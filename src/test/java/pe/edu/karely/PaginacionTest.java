package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import pe.edu.karely.controller.citas.CitaController;
import pe.edu.karely.dto.PaginaResponseDTO;
import pe.edu.karely.exception.ReglaNegocioException;
import pe.edu.karely.repository.OracleJdbc;
import pe.edu.karely.repository.citas.CitaRepository;
import pe.edu.karely.service.service.citas.CitaService;

import java.time.LocalDate;
import java.util.List;

class PaginacionTest {
    public record Fila(Long id, String nombres, String apellidos) {}

    @Test
    void consultaTodasLasPaginasSinLimiteDeCuatrocientosYBuscaFueraDeLaPrimera() {
        var ds = new DriverManagerDataSource("jdbc:h2:mem:pagina-filas;MODE=Oracle", "sa", "");
        try (var con = ds.getConnection()) {
            var jdbc =
                    new JdbcTemplate(
                            new org.springframework.jdbc.datasource.SingleConnectionDataSource(
                                    con, true));
            jdbc.execute(
                    "CREATE TABLE FILA(ID NUMBER,NOMBRES VARCHAR2(100),APELLIDOS VARCHAR2(100))");
            for (int i = 1; i <= 425; i++)
                jdbc.update("INSERT INTO FILA VALUES(?,?,'Prueba')", i, "Paciente " + i);
            var repo = new OracleJdbc(jdbc, ds);
            var primera =
                    repo.pagina(
                            Fila.class,
                            "SELECT * FROM FILA",
                            "ID ASC",
                            List.of("NOMBRES", "APELLIDOS"),
                            0,
                            10,
                            "");
            var ultima =
                    repo.pagina(
                            Fila.class,
                            "SELECT * FROM FILA",
                            "ID ASC",
                            List.of("NOMBRES", "APELLIDOS"),
                            42,
                            10,
                            "");
            assertEquals(425, primera.totalElementos());
            assertEquals(43, primera.totalPaginas());
            assertEquals(10, primera.contenido().size());
            assertTrue(primera.primera());
            assertEquals(421L, ultima.contenido().getFirst().id());
            assertEquals(5, ultima.contenido().size());
            assertTrue(ultima.ultima());
            var filtrada =
                    repo.pagina(
                            Fila.class,
                            "SELECT * FROM FILA",
                            "ID ASC",
                            List.of("NOMBRES", "APELLIDOS"),
                            0,
                            20,
                            "Paciente 425 Prueba");
            assertEquals(1, filtrada.totalElementos());
            assertEquals(425L, filtrada.contenido().getFirst().id());
            assertTrue(
                    repo.pagina(
                                    Fila.class,
                                    "SELECT * FROM FILA",
                                    "ID ASC",
                                    List.of("NOMBRES"),
                                    100,
                                    100,
                                    "")
                            .contenido()
                            .isEmpty());
            jdbc.update("INSERT INTO FILA VALUES(426,'100%_!','Especial')");
            assertEquals(
                    1,
                    repo.pagina(
                                    Fila.class,
                                    "SELECT * FROM FILA",
                                    "ID ASC",
                                    List.of("NOMBRES"),
                                    0,
                                    10,
                                    "%_!")
                            .totalElementos());
            assertEquals(
                    0,
                    repo.pagina(
                                    Fila.class,
                                    "SELECT * FROM FILA",
                                    "ID ASC",
                                    List.of("NOMBRES"),
                                    0,
                                    10,
                                    "' OR 1=1 --")
                            .totalElementos());
        } catch (java.sql.SQLException e) {
            throw new AssertionError(e);
        }
    }

    @Test
    void rechazaPaginasInvalidasAntesDeConsultarLaBaseDeDatos() {
        assertThrows(ReglaNegocioException.class, () -> PaginaResponseDTO.validar(-1, 10));
        assertThrows(ReglaNegocioException.class, () -> PaginaResponseDTO.validar(0, 101));
        assertThrows(ReglaNegocioException.class, () -> PaginaResponseDTO.validar(0, 0));
        assertTrue(PaginaResponseDTO.crear(List.of(), 0, 10, 0).ultima());
    }

    @Test
    void agendaSeparaHistorialOrdenaProximasYRespetaElDoctorAutenticado() {
        var ds = new DriverManagerDataSource("jdbc:h2:mem:pagina-agenda;MODE=Oracle", "sa", "");
        try (var con = ds.getConnection()) {
            var jdbc =
                    new JdbcTemplate(
                            new org.springframework.jdbc.datasource.SingleConnectionDataSource(
                                    con, true));
            jdbc.execute("CREATE TABLE DOCTOR(ID_DOCTOR NUMBER,ID_USUARIO NUMBER)");
            jdbc.update("INSERT INTO DOCTOR VALUES(1,99),(2,88)");
            jdbc.execute(
                    "CREATE TABLE VW_AGENDA_CITAS(ID_CITA NUMBER,FECHA_CITA DATE,HORA_INICIO"
                        + " VARCHAR2(5),HORA_FIN VARCHAR2(5),ID_DOCTOR NUMBER,NOMBRE_DOCTOR"
                        + " VARCHAR2(50),ID_PACIENTE NUMBER,NOMBRE_PACIENTE"
                        + " VARCHAR2(50),ID_ESPECIALIDAD NUMBER,ESPECIALIDAD"
                        + " VARCHAR2(50),ID_CONSULTORIO NUMBER,CONSULTORIO VARCHAR2(50),ESTADO_CITA"
                        + " VARCHAR2(20),REPROGRAMACIONES NUMBER,ASISTENCIA_REGISTRADA"
                        + " VARCHAR2(1),MONTO_TOTAL NUMBER)");
            var hoy = jdbc.queryForObject("SELECT TRUNC(SYSDATE) FROM DUAL", LocalDate.class);
            Object[][] datos = {
                {1, hoy.plusDays(2), "PROGRAMADA", 1},
                {2, hoy, "REPROGRAMADA", 1},
                {3, hoy.minusDays(1), "PROGRAMADA", 1},
                {4, hoy, "ATENDIDA", 1},
                {5, hoy.plusDays(1), "PROGRAMADA", 2}
            };
            for (var d : datos)
                jdbc.update(
                        "INSERT INTO VW_AGENDA_CITAS"
                            + " VALUES(?,?,'08:00','09:00',?,'Doctor',1,'Paciente',1,'General',1,'Consultorio',?,0,'N',100)",
                        d[0],
                        d[1],
                        d[3],
                        d[2]);
            var repo = new CitaRepository(new OracleJdbc(jdbc, ds));
            assertEquals(
                    List.of(2L, 5L, 1L),
                    repo.listarCitasPagina(0, 10, "", null, "proximas").contenido().stream()
                            .map(c -> c.idCita())
                            .toList());
            assertEquals(
                    List.of(2L, 1L),
                    repo.listarCitasPagina(0, 10, "", 99L, "proximas").contenido().stream()
                            .map(c -> c.idCita())
                            .toList());
            assertEquals(
                    List.of(4L, 3L),
                    repo.listarCitasPagina(0, 10, "", null, "historial").contenido().stream()
                            .map(c -> c.idCita())
                            .toList());
            assertEquals(5, repo.listarCitasPagina(0, 10, "", null, "todas").totalElementos());
        } catch (java.sql.SQLException e) {
            throw new AssertionError(e);
        }
    }

    @Test
    void pacientesPaginaConJpaConservaBusquedaYRegistrosFueraDelLimiteAnterior() {
        var ds =
                new DriverManagerDataSource(
                        "jdbc:h2:mem:pagina-pacientes;MODE=Oracle;DB_CLOSE_DELAY=-1", "sa", "");
        var factory = new org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean();
        factory.setDataSource(ds);
        factory.setJpaVendorAdapter(
                new org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter());
        factory.setPackagesToScan("pe.edu.karely.entity");
        factory.setJpaPropertyMap(java.util.Map.of("hibernate.hbm2ddl.auto", "create-drop"));
        factory.afterPropertiesSet();
        try {
            var jdbc = new JdbcTemplate(ds);
            for (int i = 1; i <= 215; i++)
                jdbc.update(
                        "INSERT INTO"
                            + " PACIENTE(ID_PACIENTE,TIPO_DOCUMENTO,NUMERO_DOCUMENTO,NOMBRES,APELLIDOS,ESTADO)"
                            + " VALUES(?,'DNI',?,'Paciente','Prueba','ACTIVO')",
                        i,
                        "99000" + i);
            var em = factory.getObject().createEntityManager();
            try {
                var repo = new pe.edu.karely.repository.pacientes.PacienteRepository(em);
                var pagina = repo.listarPacientesPagina(21, 10, "");
                assertEquals(215, pagina.totalElementos());
                assertEquals(5, pagina.contenido().size());
                assertEquals(211L, pagina.contenido().getFirst().idPaciente());
                assertEquals(1L, repo.listarPacientesPagina(0,10,"").contenido().getFirst().idPaciente());
                assertEquals(11L, repo.listarPacientesPagina(1,10,"").contenido().getFirst().idPaciente());
                assertEquals(
                        215, repo.listarPacientesPagina(0, 10, "Paciente Prueba").totalElementos());
                assertEquals(1, repo.listarPacientesPagina(0, 10, "99000215").totalElementos());
                assertEquals(0, repo.listarPacientesPagina(0, 10, "%").totalElementos());
            } finally {
                em.close();
            }
        } finally {
            factory.destroy();
        }
    }

    @Test
    void endpointConPaginaDevuelveMetadatosYElAnteriorConservaElArray() throws Exception {
        var servicio = mock(CitaService.class);
        var auth = new UsernamePasswordAuthenticationToken(99L, null, List.of());
        when(servicio.listarCitas(99)).thenReturn(List.of());
        when(servicio.listarCitasPagina(2, 20, "Paciente", "historial", 99))
                .thenReturn(PaginaResponseDTO.crear(List.of(), 2, 20, 50));
        var mvc = MockMvcBuilders.standaloneSetup(new CitaController(servicio)).build();
        mvc.perform(get("/api/v1/citas").principal(auth))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
        mvc.perform(
                        get("/api/v1/citas")
                                .param("pagina", "2")
                                .param("tamanio", "20")
                                .param("filtro", "Paciente")
                                .param("vista", "historial")
                                .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pagina").value(2))
                .andExpect(jsonPath("$.tamanio").value(20))
                .andExpect(jsonPath("$.totalElementos").value(50));
        verify(servicio).listarCitasPagina(2, 20, "Paciente", "historial", 99);
    }
}

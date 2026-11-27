package pe.edu.karely.modelo;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;

import pe.edu.karely.entity.Cita;
import pe.edu.karely.repository.finanzas.LiquidacionRepository;
import pe.edu.karely.repository.OracleJdbc;
import pe.edu.karely.repository.pacientes.PacienteRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

class ModeloOracleTest {
    @Test
    void esquemaYEdicionDePacienteEnH2() throws Exception {
        var fabrica = new LocalContainerEntityManagerFactoryBean();
        fabrica.setDataSource(
                new DriverManagerDataSource(
                        "jdbc:h2:mem:modelo;MODE=Oracle;DB_CLOSE_DELAY=-1", "sa", ""));
        fabrica.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        fabrica.setPackagesToScan("pe.edu.karely.entity");
        fabrica.setJpaPropertyMap(Map.of("hibernate.hbm2ddl.auto", "create-drop"));
        fabrica.afterPropertiesSet();
        try (var entidades = fabrica.getObject().createEntityManager()) {
            var tablas =
                    entidades.getMetamodel().getEntities().stream()
                            .map(tipo -> tipo.getJavaType().getAnnotation(Table.class).name())
                            .collect(Collectors.toSet());
            assertEquals(
                    Set.of(
                            "ROL",
                            "USUARIO",
                            "SESION_USUARIO",
                            "AUDITORIA",
                            "DOCTOR",
                            "DOCUMENTO_DOCTOR",
                            "ESPECIALIDAD",
                            "DOCTOR_ESPECIALIDAD",
                            "PACIENTE",
                            "CONSULTORIO",
                            "FRANJA_HORARIA",
                            "DISPONIBILIDAD_DOCTOR",
                            "PRE_RESERVA_CITA",
                            "PAGO_CITA",
                            "CITA",
                            "REPROGRAMACION_CITA",
                            "ASISTENCIA",
                            "ATENCION_MEDICA",
                            "RECETA",
                            "RECETA_DETALLE",
                            "RECIBO_HONORARIO",
                            "LIQUIDACION",
                            "PARAMETRO_SISTEMA",
                            "NOTIFICACION_SALIENTE",
                            "TOKEN_RECUPERACION"),
                    tablas);
            assertEquals(
                    "ID_PAGO",
                    Cita.class.getDeclaredField("pago").getAnnotation(JoinColumn.class).name());
            var pacientes = new PacienteRepository(entidades);
            entidades.getTransaction().begin();
            long id =
                    pacientes.registrarPaciente(
                            "DNI", "12345678", "Ana", "Gil", null, null, null, null);
            entidades.getTransaction().commit();
            entidades.clear();
            assertEquals("ACTIVO", pacientes.buscarPorId(id).estado());
            entidades.getTransaction().begin();
            assertEquals(
                    1, pacientes.editarPaciente("Ana", "Perez", null, null, null, "INACTIVO", id));
            entidades.getTransaction().commit();
            entidades.clear();
            assertEquals(
                    "Perez", pacientes.buscarPaciente("dni", "12345678").getFirst().apellidos());
            assertEquals("INACTIVO", pacientes.listarPacientes().getFirst().estado());
        } finally {
            fabrica.destroy();
        }
    }

    @Test
    void pagoUsaLasNuevePosicionesDelProcedimiento() {
        var jdbc = mock(OracleJdbc.class);
        var inicio = LocalDate.of(2026, 10, 1);
        var fin = inicio.plusDays(30);
        var monto = new BigDecimal("42.50");
        new LiquidacionRepository(jdbc)
                .pagarDoctor(2, 2, 8L, inicio, fin, monto, "BANCO", "OP", "BOL");
        verify(jdbc)
                .callId(
                        "SP_PAGAR_DOCTOR",
                        2,
                        2L,
                        8L,
                        inicio,
                        fin,
                        monto,
                        "BANCO",
                        "OP",
                        "BOL",
                        OracleJdbc.outNumber());
    }
}

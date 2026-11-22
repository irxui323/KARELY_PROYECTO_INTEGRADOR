package pe.edu.karely;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import pe.edu.karely.repository.OracleJdbc;
import pe.edu.karely.repository.DoctorRepository;
import java.sql.Timestamp;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class DoctorEspecialidadUsoTest {
    JdbcTemplate jdbc;
    DoctorRepository repo;
    @BeforeEach void preparar() {
        var ds=new DriverManagerDataSource("jdbc:h2:mem:"+java.util.UUID.randomUUID()+";MODE=Oracle;DB_CLOSE_DELAY=-1","sa","");
        jdbc=new JdbcTemplate(ds);
        jdbc.execute("CREATE TABLE CITA(ID_CITA NUMBER,ID_DOCTOR NUMBER,ID_ESPECIALIDAD NUMBER,ESTADO VARCHAR2(20))");
        jdbc.execute("CREATE TABLE PRE_RESERVA_CITA(ID_PRE_RESERVA NUMBER,ID_DOCTOR NUMBER,ID_ESPECIALIDAD NUMBER,ESTADO VARCHAR2(20),FECHA_EXPIRACION TIMESTAMP)");
        repo=new DoctorRepository(mock(jakarta.persistence.EntityManager.class),new OracleJdbc(jdbc,ds));
    }
    @Test void bloqueaCitasPendientesYAtencionAunqueLaFechaHayaPasado() {
        for(String estado:java.util.List.of("PROGRAMADA","REPROGRAMADA","EN_ATENCION")) {
            jdbc.update("DELETE FROM CITA");
            jdbc.update("INSERT INTO CITA VALUES(1,1,2,?)",estado);
            assertTrue(repo.especialidadEnUso(1,2),estado);
        }
    }
    @Test void conservaHistoriaPeroPermiteRetirarSuAsignacion() {
        for(String estado:java.util.List.of("ATENDIDA","PERDIDA","CANCELADA"))
            jdbc.update("INSERT INTO CITA VALUES(1,1,2,?)",estado);
        assertFalse(repo.especialidadEnUso(1,2));
        assertEquals(3,jdbc.queryForObject("SELECT COUNT(*) FROM CITA",Integer.class));
    }
    @Test void soloUnaReservaBloqueadaVigenteImpideRetirar() {
        jdbc.update("INSERT INTO PRE_RESERVA_CITA VALUES(1,1,2,'BLOQUEADA',?)",Timestamp.from(Instant.now().minusSeconds(60)));
        jdbc.update("INSERT INTO PRE_RESERVA_CITA VALUES(2,1,2,'CONFIRMADA',?)",Timestamp.from(Instant.now().plusSeconds(600)));
        assertFalse(repo.especialidadEnUso(1,2));
        jdbc.update("INSERT INTO PRE_RESERVA_CITA VALUES(3,1,2,'BLOQUEADA',?)",Timestamp.from(Instant.now().plusSeconds(600)));
        assertTrue(repo.especialidadEnUso(1,2));
        assertFalse(repo.especialidadEnUso(2,2));
        assertFalse(repo.especialidadEnUso(1,3));
    }
}

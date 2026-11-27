package pe.edu.karely;

import pe.edu.karely.repository.OracleJdbc;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import pe.edu.karely.repository.administracion.*;
import pe.edu.karely.repository.atencion.*;
import pe.edu.karely.repository.auth.*;
import pe.edu.karely.repository.catalogos.*;
import pe.edu.karely.repository.citas.*;
import pe.edu.karely.repository.doctores.*;
import pe.edu.karely.repository.finanzas.*;
import pe.edu.karely.repository.pacientes.*;
import pe.edu.karely.repository.reportes.*;

import java.time.LocalDate;

class CitaDisponibilidadTest {
    @Test
    void excluyeCrucesDeDoctorConsultorioYReservasVigentes() {
        var ds =
                new DriverManagerDataSource(
                        "jdbc:h2:mem:turnos;MODE=Oracle;DB_CLOSE_DELAY=-1", "sa", "");
        var jdbc = new JdbcTemplate(ds);
        jdbc.execute(
                "CREATE TABLE DOCTOR(ID_DOCTOR NUMBER,NOMBRES VARCHAR2(100),APELLIDOS"
                    + " VARCHAR2(100),ESTADO VARCHAR2(10),ESTADO_DOCUMENTACION VARCHAR2(12))");
        jdbc.execute("CREATE TABLE ESPECIALIDAD(ID_ESPECIALIDAD NUMBER,ESTADO VARCHAR2(10))");
        jdbc.execute("CREATE TABLE DOCTOR_ESPECIALIDAD(ID_DOCTOR NUMBER,ID_ESPECIALIDAD NUMBER)");
        jdbc.execute("CREATE TABLE CONSULTORIO(ID_CONSULTORIO NUMBER,ESTADO VARCHAR2(10))");
        jdbc.execute(
                "CREATE TABLE FRANJA_HORARIA(ID_FRANJA NUMBER,HORA_INICIO VARCHAR2(5),HORA_FIN"
                    + " VARCHAR2(5),ESTADO VARCHAR2(10))");
        jdbc.execute(
                "CREATE TABLE DISPONIBILIDAD_DOCTOR(ID_DOCTOR NUMBER,ID_FRANJA NUMBER,FECHA_TURNO"
                    + " DATE,ESTADO VARCHAR2(10),ID_ESPECIALIDAD NUMBER)");
        jdbc.execute(
                "CREATE TABLE CITA(ID_DOCTOR NUMBER,ID_CONSULTORIO NUMBER,ID_FRANJA"
                    + " NUMBER,FECHA_CITA DATE,ESTADO VARCHAR2(20))");
        jdbc.execute(
                "CREATE TABLE PRE_RESERVA_CITA(ID_DOCTOR NUMBER,ID_CONSULTORIO NUMBER,ID_FRANJA"
                    + " NUMBER,FECHA_CITA DATE,ESTADO VARCHAR2(12),FECHA_EXPIRACION TIMESTAMP)");
        jdbc.update("INSERT INTO DOCTOR VALUES(1,'Ana','Test','ACTIVO','COMPLETO')");
        jdbc.update("INSERT INTO DOCTOR VALUES(2,'Luis','Test','ACTIVO','INCOMPLETO')");
        jdbc.update("INSERT INTO ESPECIALIDAD VALUES(1,'ACTIVO')");
        jdbc.update("INSERT INTO DOCTOR_ESPECIALIDAD VALUES(1,1)");
        jdbc.update("INSERT INTO DOCTOR_ESPECIALIDAD VALUES(2,1)");
        jdbc.update("INSERT INTO CONSULTORIO VALUES(1,'ACTIVO')");
        for (int i = 1; i <= 4; i++) {
            jdbc.update(
                    "INSERT INTO FRANJA_HORARIA VALUES(?,?,?,'ACTIVO')",
                    i,
                    String.format("%02d:00", 7 + i),
                    String.format("%02d:00", 8 + i));
        }
        jdbc.update("INSERT INTO FRANJA_HORARIA VALUES(5,'08:30','09:30','ACTIVO')");
        var fecha = LocalDate.now().plusDays(3);
        for (int i = 1; i <= 4; i++)
            jdbc.update("INSERT INTO DISPONIBILIDAD_DOCTOR VALUES(1,?,?,'ACTIVO',1)", i, fecha);
        jdbc.update("INSERT INTO ESPECIALIDAD VALUES(2,'ACTIVO')");
        jdbc.update("INSERT INTO DOCTOR_ESPECIALIDAD VALUES(1,2)");
        var repo = new CitaRepository(new OracleJdbc(jdbc, ds));
        assertEquals(1, repo.doctoresPorEspecialidad(1).size());
        assertEquals(4, repo.turnosDisponibles(1, fecha, 1L).size());
        assertTrue(repo.turnosDisponibles(2, fecha, 1L).isEmpty());
        var mes =
                repo.turnosDelMes(
                        1, fecha.withDayOfMonth(1), fecha.withDayOfMonth(1).plusMonths(1), 1L);
        assertEquals(4, mes.size());
        assertTrue(mes.stream().allMatch(t -> t.fecha().equals(fecha)));
        jdbc.update("INSERT INTO CITA VALUES(99,1,5,?,'PROGRAMADA')", fecha);
        assertEquals(2, repo.turnosDisponibles(1, fecha, 1L).size());
        assertEquals(4, repo.turnosDisponibles(1, fecha, null).size());
        jdbc.update(
                "INSERT INTO PRE_RESERVA_CITA VALUES(1,2,3,?,'BLOQUEADA',CURRENT_TIMESTAMP+INTERVAL"
                    + " '5' MINUTE)",
                fecha);
        assertEquals(1, repo.turnosDisponibles(1, fecha, 1L).size());
        jdbc.update(
                "UPDATE PRE_RESERVA_CITA SET FECHA_EXPIRACION=CURRENT_TIMESTAMP-INTERVAL '1'"
                    + " MINUTE");
        assertEquals(2, repo.turnosDisponibles(1, fecha, 1L).size());
        jdbc.update("UPDATE CITA SET ESTADO='CANCELADA'");
        assertEquals(4, repo.turnosDisponibles(1, fecha, 1L).size());
        jdbc.update("UPDATE FRANJA_HORARIA SET ESTADO='INACTIVO' WHERE ID_FRANJA=4");
        assertEquals(3, repo.turnosDisponibles(1, fecha, 1L).size());
        jdbc.update("UPDATE CONSULTORIO SET ESTADO='INACTIVO'");
        assertTrue(repo.turnosDisponibles(1, fecha, 1L).isEmpty());
        assertEquals(3, repo.turnosDisponibles(1, fecha, null).size());
        jdbc.update("INSERT INTO FRANJA_HORARIA VALUES(6,'00:00','00:30','ACTIVO')");
        jdbc.update("INSERT INTO DISPONIBILIDAD_DOCTOR VALUES(1,6,TRUNC(SYSDATE),'ACTIVO',1)");
        assertTrue(
                repo.turnosDisponibles(1, LocalDate.now(java.time.ZoneId.systemDefault()), null)
                        .isEmpty());
        jdbc.update("UPDATE DOCTOR SET ESTADO='INACTIVO' WHERE ID_DOCTOR=1");
        assertTrue(repo.turnosDisponibles(1, fecha, 1L).isEmpty());
    }
}

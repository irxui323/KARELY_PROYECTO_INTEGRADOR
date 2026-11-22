package pe.edu.karely;

import java.nio.file.*;
import java.sql.Date;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import static org.junit.jupiter.api.Assertions.*;

class DisponibilidadEspecialidadSqlTest {
    @Test void laReglaSqlImpideSolapamientoEntreEspecialidadesYPermiteClasificarPendiente() throws Exception {
        String migracion=Files.readString(Path.of("../db/migraciones/2026-11-22-disponibilidad-especialidad.sql")).replace("\r\n","\n");
        int desde=migracion.indexOf("FROM DISPONIBILIDAD_DOCTOR D");
        int inicio=migracion.lastIndexOf("SELECT COUNT(*) INTO V_CANTIDAD",desde);
        String sql=migracion.substring(inicio,migracion.indexOf(';',desde)).replace(" INTO V_CANTIDAD","")
            .replace("P_ID_DOCTOR",":doctor").replace("P_ID_FRANJA",":franja").replace("P_FECHA",":fecha")
            .replace("V_HORA_INICIO",":inicio").replace("V_HORA_FIN",":fin");
        var ds=new DriverManagerDataSource("jdbc:h2:mem:solapamiento-especialidad;MODE=Oracle;DB_CLOSE_DELAY=-1","sa","");
        var jdbc=new JdbcTemplate(ds);
        jdbc.execute("CREATE TABLE FRANJA_HORARIA(ID_FRANJA NUMBER,HORA_INICIO VARCHAR2(5),HORA_FIN VARCHAR2(5))");
        jdbc.execute("CREATE TABLE DISPONIBILIDAD_DOCTOR(ID_DOCTOR NUMBER,ID_FRANJA NUMBER,FECHA_TURNO DATE,ESTADO VARCHAR2(10),ID_ESPECIALIDAD NUMBER)");
        jdbc.update("INSERT INTO FRANJA_HORARIA VALUES(1,'09:00','10:00')");
        jdbc.update("INSERT INTO FRANJA_HORARIA VALUES(2,'09:30','10:30')");
        jdbc.update("INSERT INTO FRANJA_HORARIA VALUES(3,'10:00','11:00')");
        LocalDate fecha=LocalDate.now().plusDays(1);
        jdbc.update("INSERT INTO DISPONIBILIDAD_DOCTOR VALUES(1,1,?,'ACTIVO',10)",fecha);
        var consulta=new NamedParameterJdbcTemplate(ds);
        Map<String,Object> params=Map.of("doctor",1,"franja",1,"fecha",Date.valueOf(fecha),"inicio","09:00","fin","10:00");
        assertEquals(1,consulta.queryForObject(sql,params,Integer.class));
        assertEquals(1,consulta.queryForObject(sql,Map.of("doctor",1,"franja",2,"fecha",Date.valueOf(fecha),"inicio","09:30","fin","10:30"),Integer.class));
        assertEquals(0,consulta.queryForObject(sql,Map.of("doctor",1,"franja",3,"fecha",Date.valueOf(fecha),"inicio","10:00","fin","11:00"),Integer.class));
        jdbc.update("UPDATE DISPONIBILIDAD_DOCTOR SET ID_ESPECIALIDAD=NULL");
        assertEquals(0,consulta.queryForObject(sql,params,Integer.class));
        assertEquals(1,consulta.queryForObject(sql,Map.of("doctor",1,"franja",2,"fecha",Date.valueOf(fecha),"inicio","09:30","fin","10:30"),Integer.class));
        assertTrue(migracion.contains("FROM DOCTOR\n    WHERE ID_DOCTOR = P_ID_DOCTOR\n      AND ESTADO = 'ACTIVO'\n    FOR UPDATE"));
        assertTrue(migracion.contains("AND ID_ESPECIALIDAD = P_ID_ESPECIALIDAD"));
        assertTrue(migracion.contains("AND ID_ESPECIALIDAD = V_RESERVA.ID_ESPECIALIDAD"));
        assertTrue(migracion.contains("AND ID_ESPECIALIDAD = V_CITA.ID_ESPECIALIDAD"));
    }
}

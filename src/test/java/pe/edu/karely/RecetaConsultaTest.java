package pe.edu.karely;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import pe.edu.karely.repository.*;
class RecetaConsultaTest {
 @Test void recuperaRecetaPorAtencionSinExponerLasDeOtroDoctor() {
  var ds=new DriverManagerDataSource("jdbc:h2:mem:receta-consulta;MODE=Oracle;DB_CLOSE_DELAY=-1","sa","");
  var jdbc=new JdbcTemplate(ds);
  jdbc.execute("CREATE TABLE DOCTOR(ID_DOCTOR NUMBER PRIMARY KEY,ID_USUARIO NUMBER)");
  jdbc.execute("CREATE TABLE ATENCION_MEDICA(ID_ATENCION NUMBER PRIMARY KEY,ID_CITA NUMBER,ID_DOCTOR NUMBER,FECHA_INICIO TIMESTAMP,FECHA_CIERRE TIMESTAMP,ESTADO VARCHAR2(12))");
  jdbc.execute("CREATE TABLE RECETA(ID_RECETA NUMBER PRIMARY KEY,ID_ATENCION NUMBER UNIQUE,INDICACIONES VARCHAR2(2000))");
  jdbc.update("INSERT INTO DOCTOR VALUES(1,7),(2,8)");
  jdbc.update("INSERT INTO ATENCION_MEDICA VALUES(1,12,1,CURRENT_TIMESTAMP,NULL,'ABIERTA'),(2,13,1,CURRENT_TIMESTAMP,NULL,'ABIERTA'),(3,14,2,CURRENT_TIMESTAMP,NULL,'ABIERTA')");
  jdbc.update("INSERT INTO RECETA VALUES(25,1,'Reposo'),(26,3,'Otra receta')");
  var repo=new AtencionMedicaRepository(new OracleJdbc(jdbc,ds));
  var propias=repo.listarAtencionesDelMedico(7);
  assertEquals(2,propias.size());
  var primera=propias.stream().filter(a->a.idCita()==12).findFirst().orElseThrow();
  assertEquals(25L,primera.idReceta());assertEquals("Reposo",primera.indicacionesReceta());
  assertNull(propias.stream().filter(a->a.idCita()==13).findFirst().orElseThrow().idReceta());
  assertEquals(3,repo.listarAtencionesGeneral().size());
 }
}

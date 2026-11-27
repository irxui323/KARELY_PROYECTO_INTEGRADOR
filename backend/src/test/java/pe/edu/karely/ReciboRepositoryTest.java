package pe.edu.karely;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import pe.edu.karely.repository.OracleJdbc;
import pe.edu.karely.repository.atencion.AtencionMedicaRepository;
import static org.junit.jupiter.api.Assertions.*;

class ReciboRepositoryTest {
    @Test
    void archivoRecibo_comparaElContenidoDelPdf() {
        var primero = new AtencionMedicaRepository.ArchivoRecibo(new byte[] {1, 2, 3});
        var segundo = new AtencionMedicaRepository.ArchivoRecibo(new byte[] {1, 2, 3});

        assertEquals(primero, segundo);
        assertEquals(primero.hashCode(), segundo.hashCode());
    }

    @Test
    void consultaRealMapeaReciboYConservaArchivoSinSobrescribir() {
        var ds=new DriverManagerDataSource("jdbc:h2:mem:reciboRepo;MODE=Oracle;DB_CLOSE_DELAY=-1","sa","");
        var jdbc=new JdbcTemplate(ds);
        jdbc.execute("CREATE TABLE PACIENTE(ID_PACIENTE NUMBER PRIMARY KEY,NOMBRES VARCHAR2(100),APELLIDOS VARCHAR2(100),NUMERO_DOCUMENTO VARCHAR2(20),CORREO VARCHAR2(150))");
        jdbc.execute("CREATE TABLE DOCTOR(ID_DOCTOR NUMBER PRIMARY KEY,ID_USUARIO NUMBER,NOMBRES VARCHAR2(100),APELLIDOS VARCHAR2(100))");
        jdbc.execute("CREATE TABLE ESPECIALIDAD(ID_ESPECIALIDAD NUMBER PRIMARY KEY,NOMBRE VARCHAR2(120))");
        jdbc.execute("CREATE TABLE FRANJA_HORARIA(ID_FRANJA NUMBER PRIMARY KEY,HORA_INICIO VARCHAR2(5))");
        jdbc.execute("CREATE TABLE PAGO_CITA(ID_PAGO NUMBER PRIMARY KEY,METODO_PAGO VARCHAR2(30))");
        jdbc.execute("CREATE TABLE CITA(ID_CITA NUMBER PRIMARY KEY,ID_PACIENTE NUMBER,ID_DOCTOR NUMBER,ID_ESPECIALIDAD NUMBER,ID_FRANJA NUMBER,ID_PAGO NUMBER,FECHA_CITA DATE)");
        jdbc.execute("CREATE TABLE RECIBO_HONORARIO(ID_RECIBO NUMBER PRIMARY KEY,ID_CITA NUMBER UNIQUE,NUMERO_RECIBO VARCHAR2(60) UNIQUE,MONTO NUMBER(12,2),FECHA_EMISION TIMESTAMP,FECHA_ENTREGA TIMESTAMP,MEDIO_ENTREGA VARCHAR2(30),ARCHIVO_PDF BLOB,CORREO_ENVIO VARCHAR2(150))");
        jdbc.execute("INSERT INTO PACIENTE VALUES(1,'Paciente','Prueba','12345678','paciente@example.com')");
        jdbc.execute("INSERT INTO DOCTOR VALUES(1,7,'Doctor','Prueba')");
        jdbc.execute("INSERT INTO ESPECIALIDAD VALUES(1,'Medicina general')");
        jdbc.execute("INSERT INTO FRANJA_HORARIA VALUES(1,'11:00')");
        jdbc.execute("INSERT INTO PAGO_CITA VALUES(1,'EFECTIVO')");
        jdbc.execute("INSERT INTO CITA VALUES(12,1,1,1,1,1,DATE '2026-11-23')");
        jdbc.execute("INSERT INTO RECIBO_HONORARIO VALUES(20,12,'REC-0000000012',120,CURRENT_TIMESTAMP,NULL,NULL,NULL,NULL)");
        var repo=new AtencionMedicaRepository(new OracleJdbc(jdbc,ds));
        var tx=new TransactionTemplate(new DataSourceTransactionManager(ds));
        tx.execute(status->{
            assertNotNull(repo.bloquearCitaParaRecibo(12,7,"DOCTOR"));
            assertNull(repo.bloquearCitaParaRecibo(12,8,"DOCTOR"));
            assertNotNull(repo.bloquearCitaParaRecibo(12,8,"ADMINISTRADORA"));
            var recibo=repo.buscarRecibo(12);
            assertEquals("Paciente Prueba",recibo.paciente());
            assertEquals("Medicina general",recibo.especialidad());
            assertEquals("EFECTIVO",recibo.metodoPago());
            assertNull(repo.buscarPdf(12));
            byte[] original={37,80,68,70,1,2};
            repo.guardarPdf(12,original);
            repo.guardarPdf(12,new byte[]{9,9});
            assertArrayEquals(original,repo.buscarPdf(12));
            repo.guardarCorreoRecibo(12,"paciente@example.com");
            assertEquals("paciente@example.com",jdbc.queryForObject(
                    "SELECT CORREO_ENVIO FROM RECIBO_HONORARIO WHERE ID_CITA=12",String.class));
            return null;
        });
    }
}

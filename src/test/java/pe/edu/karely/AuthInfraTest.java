package pe.edu.karely;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import pe.edu.karely.exception.GlobalExceptionHandler;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AuthInfraTest {
    @Test
    void mensajeDeNegocioOracleOmiteRestoDelStack() {
        var causa = new SQLException("ORA-20003: La operación no está permitida\r\nORA-06512: SQL interno", "", 20003);
        var respuesta = new GlobalExceptionHandler().sql(new DataAccessResourceFailureException("SELECT interno", causa));
        assertEquals(400, respuesta.getStatusCode().value());
        assertEquals("ORA-20003: La operación no está permitida", respuesta.getBody().error());
    }
}

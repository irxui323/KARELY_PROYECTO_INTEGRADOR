package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.security.authentication.BadCredentialsException;

import pe.edu.karely.exception.GlobalExceptionHandler;

import java.sql.SQLException;

class AuthInfraTest {
    @Test
    void autenticacionSeRespondeDesdeElManejadorGlobal() {
        var respuesta = new GlobalExceptionHandler().authentication(new BadCredentialsException("error"));
        assertEquals(401, respuesta.getStatusCode().value());
        assertEquals("Credenciales incorrectas", respuesta.getBody().message());
    }

    @Test
    void mensajeDeNegocioOracleOmiteRestoDelStack() {
        var causa =
                new SQLException(
                        "ORA-20003: La operaciÃ³n no estÃ¡ permitida\r\nORA-06512: SQL interno",
                        "",
                        20003);
        var respuesta =
                new GlobalExceptionHandler()
                        .sql(new DataAccessResourceFailureException("SELECT interno", causa));
        assertEquals(400, respuesta.getStatusCode().value());
        assertEquals("ORA-20003: La operaciÃ³n no estÃ¡ permitida", respuesta.getBody().message());
    }
}

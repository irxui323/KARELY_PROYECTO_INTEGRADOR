package pe.edu.karely;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import pe.edu.karely.exception.GlobalExceptionHandler;

import static org.junit.jupiter.api.Assertions.*;

class ErrorFormatoTest {
    @Test
    void dniDuplicadoDevuelveConflictoConMensajeDePaciente() {
        var oracle = new java.sql.SQLIntegrityConstraintViolationException(
                "ORA-00001: restricción única (KARELY_BD2.UQ_PACIENTE_DOCUMENTO) violada",
                "23000", 1);
        var exception = new org.springframework.dao.DataIntegrityViolationException(
                "No se pudo insertar", new RuntimeException(oracle));

        var response = new GlobalExceptionHandler().sql(exception);

        assertEquals(409, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Ya existe un paciente registrado con ese DNI.", response.getBody().message());
    }

    @Test
    void otroDuplicadoOracleNoSeConfundeConDniDePaciente() {
        var oracle = new java.sql.SQLException(
                "ORA-00001: restricción única (KARELY_BD2.UQ_OTRO_REGISTRO) violada", "23000", 1);
        var response = new GlobalExceptionHandler().sql(
                new org.springframework.dao.DataIntegrityViolationException("Insert", oracle));

        assertEquals(409, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Ya existe un registro con esos datos. Revise los registros existentes.",
                response.getBody().message());
    }

    @Test
    void devuelveFormatoCompletoYTodosLosCamposInvalidos() {
        var request = new MockHttpServletRequest("POST", "/api/v1/pacientes");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        try {
            var binding = new BeanPropertyBindingResult(new Object(), "paciente");
            binding.addError(new FieldError("paciente", "nombres", "Obligatorio"));
            binding.addError(new FieldError("paciente", "numeroDocumento", "Obligatorio"));
            var response = new GlobalExceptionHandler().invalidBody(
                    new MethodArgumentNotValidException(null, binding));
            var body = response.getBody();
            assertNotNull(body);
            assertEquals(400, response.getStatusCode().value());
            assertEquals(400, body.status());
            assertEquals("Bad Request", body.error());
            assertEquals("Existen errores de validación", body.message());
            assertEquals("/api/v1/pacientes", body.path());
            assertNotNull(body.timestamp());
            assertEquals(2, body.validationErrors().size());
            assertEquals("Obligatorio", body.validationErrors().get("nombres"));
            assertEquals("Obligatorio", body.validationErrors().get("numeroDocumento"));
        } finally {
            RequestContextHolder.resetRequestAttributes();
        }
    }
}

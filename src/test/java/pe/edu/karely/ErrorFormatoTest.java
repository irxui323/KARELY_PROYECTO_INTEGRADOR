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

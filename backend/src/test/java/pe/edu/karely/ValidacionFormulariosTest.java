package pe.edu.karely;

import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import pe.edu.karely.dto.doctor.DoctorRequestDTO;
import pe.edu.karely.dto.paciente.PacienteRequestDTO;
import pe.edu.karely.dto.administracion.UsuarioRequestDTO;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

class ValidacionFormulariosTest {
    @Test
    void doctorRechazaEspaciosCorreoIncorrectoYLongitudesExcesivas() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var errors = factory.getValidator().validate(new DoctorRequestDTO(
                    "DNI", "12345678", "   ", "Apellido", "1".repeat(21), "correo-invalido", "ACTIVO"));
            var fields = errors.stream().map(e -> e.getPropertyPath().toString()).toList();
            assertTrue(fields.contains("nombres"));
            assertTrue(fields.contains("telefono"));
            assertTrue(fields.contains("correo"));
        }
    }

    @Test
    void pacienteRechazaNacimientoFuturoYAceptaContactoOpcional() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            var invalid = new PacienteRequestDTO("DNI", "12345678", "Persona", "Apellido",
                    "", "", "", "ACTIVO", LocalDate.now().plusYears(1));
            assertTrue(validator.validate(invalid).stream()
                    .anyMatch(e -> e.getPropertyPath().toString().equals("fechaNacimiento")));
            var valid = new PacienteRequestDTO("DNI", "12345678", "Persona", "Apellido",
                    "", "", "", "ACTIVO", LocalDate.now().minusYears(20));
            assertTrue(validator.validate(valid).isEmpty());
        }
    }

    @Test
    void usuarioValidaRolCorreoYNombreSinExigirClaveGenerada() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            assertFalse(validator.validate(new UsuarioRequestDTO(0L, "   ", "invalido", null)).isEmpty());
            assertTrue(validator.validate(new UsuarioRequestDTO(1L, "recepcion", "persona@example.com", null)).isEmpty());
        }
    }
}

package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.*;

import jakarta.validation.Validation;

import org.junit.jupiter.api.Test;

import pe.edu.karely.dto.finanzas.PagoDoctorRequestDTO;

class ApiInputTest {
    @Test
    void pagoRequiereIdentificadorFechasEImporte() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            assertFalse(
                    factory.getValidator()
                            .validate(
                                    new PagoDoctorRequestDTO(
                                            null, null, null, null, null, null, null))
                            .isEmpty());
        }
    }
}

package pe.edu.karely.dto.atencion;

import jakarta.validation.constraints.*;

public record EntregaReciboRequestDTO(@NotBlank @Pattern(regexp = "EMAIL|PRESENCIAL") String medioEntrega) {
    public EntregaReciboRequestDTO {
        medioEntrega = medioEntrega == null ? null : medioEntrega.trim();
    }
}

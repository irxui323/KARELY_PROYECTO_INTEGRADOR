package pe.edu.karely.dto.atencion;

import jakarta.validation.constraints.*;

public record RecetaRequestDTO(@NotBlank @Size(max = 2000) String indicaciones) {
    public RecetaRequestDTO {
        indicaciones = indicaciones == null ? null : indicaciones.trim();
    }
}

package pe.edu.karely.dto.atencion;

import jakarta.validation.constraints.*;

public record DiagnosticoRequestDTO(@NotBlank String diagnostico, String observaciones) {
    public DiagnosticoRequestDTO {
        diagnostico = diagnostico == null ? null : diagnostico.trim();
        observaciones = observaciones == null ? null : observaciones.trim();
    }
}

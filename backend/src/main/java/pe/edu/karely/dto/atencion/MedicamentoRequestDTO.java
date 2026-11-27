package pe.edu.karely.dto.atencion;

import jakarta.validation.constraints.*;

public record MedicamentoRequestDTO(
        @NotBlank @Size(max = 200) String medicamento,
        @NotBlank @Size(max = 100) String dosis,
        @NotBlank @Size(max = 100) String frecuencia,
        @NotBlank @Size(max = 100) String duracion,
        @Size(max = 500) String observaciones) {
    public MedicamentoRequestDTO {
        medicamento = medicamento == null ? null : medicamento.trim();
        dosis = dosis == null ? null : dosis.trim();
        frecuencia = frecuencia == null ? null : frecuencia.trim();
        duracion = duracion == null ? null : duracion.trim();
        observaciones = observaciones == null ? null : observaciones.trim();
    }
}

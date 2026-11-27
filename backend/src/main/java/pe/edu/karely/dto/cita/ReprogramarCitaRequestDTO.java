package pe.edu.karely.dto.cita;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record ReprogramarCitaRequestDTO(
        @NotNull LocalDate fechaNueva,
        @NotNull @Positive Long idFranjaNueva,
        @NotNull @Positive Long idConsultorioNuevo,
        @NotBlank @Size(max = 500) String motivo,
        @NotBlank @Pattern(regexp = "S") String aceptacionPaciente) {
    public ReprogramarCitaRequestDTO {
        motivo = motivo == null ? null : motivo.trim();
        aceptacionPaciente = aceptacionPaciente == null ? null : aceptacionPaciente.trim();
    }
}

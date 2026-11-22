package pe.edu.karely.dto.cita;
import jakarta.validation.constraints.*;
public record CancelarCitaRequestDTO(
    @NotBlank @Size(max=500) String motivo
) {
    public CancelarCitaRequestDTO {
        motivo = motivo == null ? null : motivo.trim();
    }
}

package pe.edu.karely.dto.atencion;
import jakarta.validation.constraints.*;
public record EntregaReciboRequestDTO(
    @NotBlank @Size(max=30) String medioEntrega
) {
    public EntregaReciboRequestDTO {
        medioEntrega = medioEntrega == null ? null : medioEntrega.trim();
    }
}

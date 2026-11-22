package pe.edu.karely.dto.doctor;
import jakarta.validation.constraints.*;
public record RechazarDocumentoRequestDTO(@NotBlank @Size(max=350) String motivo) {
    public RechazarDocumentoRequestDTO { motivo=motivo==null?null:motivo.trim(); }
}

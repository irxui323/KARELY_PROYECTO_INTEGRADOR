package pe.edu.karely.dto.administracion;
import jakarta.validation.constraints.*;
public record ParametroRequestDTO(
    @NotBlank @Size(max=1000) String valor
) {
    public ParametroRequestDTO {
        valor = valor == null ? null : valor.trim();
    }
}

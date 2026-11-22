package pe.edu.karely.dto.catalogo;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record EspecialidadRequestDTO(
    @NotBlank @Size(max=120) String nombre,
    @NotNull @DecimalMin("0.00") @Digits(integer=10,fraction=2) BigDecimal precioConsulta,
    @Pattern(regexp="ACTIVO|INACTIVO") String estado
) {
    public EspecialidadRequestDTO {
        nombre = nombre == null ? null : nombre.trim();
        estado = estado == null ? "ACTIVO" : estado.trim();
    }
}

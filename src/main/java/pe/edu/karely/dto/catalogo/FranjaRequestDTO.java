package pe.edu.karely.dto.catalogo;
import jakarta.validation.constraints.*;
public record FranjaRequestDTO(
    @NotBlank @Pattern(regexp="([01][0-9]|2[0-3]):[0-5][0-9]") String horaInicio,
    @NotBlank @Pattern(regexp="([01][0-9]|2[0-3]):[0-5][0-9]") String horaFin,
    @Pattern(regexp="ACTIVO|INACTIVO") String estado
) {
    public FranjaRequestDTO {
        horaInicio = horaInicio == null ? null : horaInicio.trim();
        horaFin = horaFin == null ? null : horaFin.trim();
        estado = estado == null ? "ACTIVO" : estado.trim();
    }
}

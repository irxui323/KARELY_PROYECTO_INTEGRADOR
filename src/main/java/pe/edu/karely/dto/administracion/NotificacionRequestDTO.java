package pe.edu.karely.dto.administracion;

import jakarta.validation.constraints.*;

public record NotificacionRequestDTO(
        @NotNull @Positive Long idCita,
        @NotBlank @Pattern(regexp = "PAGO_CITA|RECIBO_HONORARIO") String tipo) {
    public NotificacionRequestDTO {
        tipo = tipo == null ? null : tipo.trim();
    }
}

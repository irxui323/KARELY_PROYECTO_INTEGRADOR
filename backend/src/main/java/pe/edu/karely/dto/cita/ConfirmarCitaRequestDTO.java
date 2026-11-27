package pe.edu.karely.dto.cita;

import jakarta.validation.constraints.*;

public record ConfirmarCitaRequestDTO(
        @NotNull @Positive Long idPreReserva,
        @NotBlank @Pattern(regexp = "EFECTIVO|TARJETA|YAPE|PLIN|TRANSFERENCIA") String metodoPago) {
    public ConfirmarCitaRequestDTO {
        metodoPago = metodoPago == null ? null : metodoPago.trim();
    }
}

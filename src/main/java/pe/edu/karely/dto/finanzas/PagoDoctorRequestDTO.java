package pe.edu.karely.dto.finanzas;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.math.BigDecimal;
public record PagoDoctorRequestDTO(
    @NotNull @Positive Long idDoctor,
    @NotNull LocalDate fechaInicio,
    @NotNull LocalDate fechaFin,
    @NotNull @DecimalMin("0.01") @Digits(integer=10,fraction=2) BigDecimal monto,
    @NotBlank @Size(max=30) String metodoPago,
    @Size(max=120) String numeroOperacion,
    @Size(max=60) String numeroBoleta
) {
    public PagoDoctorRequestDTO {
        metodoPago = metodoPago == null ? null : metodoPago.trim();
        numeroOperacion = numeroOperacion == null ? null : numeroOperacion.trim();
        numeroBoleta = numeroBoleta == null ? null : numeroBoleta.trim();
    }
}

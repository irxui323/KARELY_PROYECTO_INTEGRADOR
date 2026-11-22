package pe.edu.karely.dto.atencion;
import jakarta.validation.constraints.*;
public record IniciarAtencionRequestDTO(
    @NotNull @Positive Long idCita
) {}

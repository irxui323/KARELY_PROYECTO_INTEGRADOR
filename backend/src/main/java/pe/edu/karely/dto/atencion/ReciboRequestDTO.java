package pe.edu.karely.dto.atencion;

import jakarta.validation.constraints.*;

public record ReciboRequestDTO(@Size(max = 60) String numeroRecibo) {
    public ReciboRequestDTO {
        numeroRecibo = numeroRecibo == null ? null : numeroRecibo.trim();
    }
}

package pe.edu.karely.dto.atencion;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReciboResponseDTO(
        Long idRecibo,
        Long idCita,
        String numeroRecibo,
        BigDecimal monto,
        LocalDateTime fechaEmision,
        String paciente,
        String documento,
        String correo,
        String doctor,
        String especialidad,
        LocalDate fechaCita,
        String horaInicio,
        String metodoPago,
        LocalDateTime fechaEntrega,
        String medioEntrega) {}

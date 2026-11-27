package pe.edu.karely.dto.finanzas;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record LiquidacionResponseDTO(
        Long idLiquidacion,
        Long idDoctor,
        String nombreDoctor,
        LocalDate periodoInicio,
        LocalDate periodoFin,
        BigDecimal montoPagado,
        String metodoPago,
        String numeroOperacion,
        String numeroBoleta,
        LocalDateTime fechaPago,
        BigDecimal saldoPendiente) {}

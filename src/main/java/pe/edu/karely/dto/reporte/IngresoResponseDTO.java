package pe.edu.karely.dto.reporte;

import java.math.BigDecimal;
import java.time.LocalDate;

public record IngresoResponseDTO(
        Long idCita,
        Long idDoctor,
        LocalDate fechaCita,
        String concepto,
        BigDecimal montoIngreso) {}

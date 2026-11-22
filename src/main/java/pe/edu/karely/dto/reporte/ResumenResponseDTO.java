package pe.edu.karely.dto.reporte;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ResumenResponseDTO(
        LocalDate fechaCita,
        Long idDoctor,
        String nombreDoctor,
        Long totalCitas,
        Long totalProgramadas,
        Long totalReprogramadas,
        Long totalEnAtencion,
        Long totalAtendidas,
        Long totalPerdidas,
        Long totalCanceladas,
        BigDecimal montoAtendido) {}

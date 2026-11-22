package pe.edu.karely.dto.finanzas;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SaldoDoctorResponseDTO(
        Long idDoctor,
        LocalDate fechaCorte,
        BigDecimal saldoPendiente) {}

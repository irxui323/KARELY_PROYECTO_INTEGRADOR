package pe.edu.karely.dto.cita;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservaResponseDTO(
        Long idPreReserva,
        Long idPaciente,
        Long idDoctor,
        Long idEspecialidad,
        Long idConsultorio,
        Long idFranja,
        LocalDate fechaCita,
        BigDecimal monto,
        LocalDateTime fechaExpiracion,
        String estado) {}

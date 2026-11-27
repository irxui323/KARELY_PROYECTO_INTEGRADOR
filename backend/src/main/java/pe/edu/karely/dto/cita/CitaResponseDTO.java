package pe.edu.karely.dto.cita;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CitaResponseDTO(
        Long idCita,
        LocalDate fechaCita,
        String horaInicio,
        String horaFin,
        Long idDoctor,
        String nombreDoctor,
        Long idPaciente,
        String nombrePaciente,
        Long idEspecialidad,
        String especialidad,
        Long idConsultorio,
        String consultorio,
        String estadoCita,
        Integer reprogramaciones,
        String asistenciaRegistrada,
        BigDecimal montoTotal) {}

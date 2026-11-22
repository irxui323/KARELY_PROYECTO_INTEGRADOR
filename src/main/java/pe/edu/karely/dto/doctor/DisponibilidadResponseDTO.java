package pe.edu.karely.dto.doctor;

import java.time.LocalDate;

public record DisponibilidadResponseDTO(
        Long idDisponibilidad,
        Long idDoctor,
        String nombreDoctor,
        LocalDate fechaTurno,
        Long idFranja,
        String horaInicio,
        String horaFin,
        String estado,
        Long idEspecialidad,
        String nombreEspecialidad) {}

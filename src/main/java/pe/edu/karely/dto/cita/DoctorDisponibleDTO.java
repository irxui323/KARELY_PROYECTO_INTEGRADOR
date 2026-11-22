package pe.edu.karely.dto.cita;

import java.util.List;

public record DoctorDisponibleDTO(Long idDoctor,String nombre,List<TurnoDisponibleDTO> turnos) {}

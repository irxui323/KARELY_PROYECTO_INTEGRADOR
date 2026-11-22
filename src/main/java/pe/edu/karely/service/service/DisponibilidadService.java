package pe.edu.karely.service.service;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.doctor.DisponibilidadRequestDTO;
import pe.edu.karely.dto.doctor.DisponibilidadResponseDTO;

import java.util.List;

public interface DisponibilidadService {
    List<DisponibilidadResponseDTO> listarHorarios(long actor);

    OperacionResponseDTO registrarHorario(long idDoctor, DisponibilidadRequestDTO i, long actor);
}

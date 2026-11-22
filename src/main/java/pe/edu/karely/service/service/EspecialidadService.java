package pe.edu.karely.service.service;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.catalogo.EspecialidadRequestDTO;
import pe.edu.karely.dto.catalogo.EspecialidadResponseDTO;

import java.util.List;

public interface EspecialidadService {
    List<EspecialidadResponseDTO> listarEspecialidades(long actor);

    OperacionResponseDTO registrarEspecialidad(EspecialidadRequestDTO i, long actor);

    OperacionResponseDTO editarEspecialidad(
            long idEspecialidad, EspecialidadRequestDTO i, long actor);
}

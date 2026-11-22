package pe.edu.karely.service.service;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.catalogo.ConsultorioRequestDTO;
import pe.edu.karely.dto.catalogo.ConsultorioResponseDTO;

import java.util.List;

public interface ConsultorioService {
    List<ConsultorioResponseDTO> listarConsultorios(long actor);

    OperacionResponseDTO registrarConsultorio(ConsultorioRequestDTO i, long actor);

    OperacionResponseDTO editarConsultorio(long idConsultorio, ConsultorioRequestDTO i, long actor);
}

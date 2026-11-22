package pe.edu.karely.service.service;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.catalogo.FranjaRequestDTO;
import pe.edu.karely.dto.catalogo.FranjaResponseDTO;

import java.util.List;

public interface FranjaHorariaService {
    List<FranjaResponseDTO> listarTurnos(long actor);

    OperacionResponseDTO registrarTurno(FranjaRequestDTO i, long actor);

    OperacionResponseDTO editarTurno(long idFranja, FranjaRequestDTO i, long actor);
}

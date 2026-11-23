package pe.edu.karely.service.service.administracion;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.administracion.ParametroRequestDTO;
import pe.edu.karely.dto.administracion.ParametroResponseDTO;

import java.util.List;

public interface ParametroSistemaService {
    List<ParametroResponseDTO> listarParametros(long actor);

    OperacionResponseDTO configurarParametro(String nombre, ParametroRequestDTO i, long actor);
}

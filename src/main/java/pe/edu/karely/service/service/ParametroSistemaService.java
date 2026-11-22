package pe.edu.karely.service.service;
import java.util.List;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.administracion.ParametroRequestDTO;
import pe.edu.karely.dto.administracion.ParametroResponseDTO;
public interface ParametroSistemaService {
List<ParametroResponseDTO> listarParametros(long actor);
OperacionResponseDTO configurarParametro(String nombre, ParametroRequestDTO i, long actor);
}

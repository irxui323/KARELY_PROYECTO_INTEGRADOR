package pe.edu.karely.service.service;
import java.util.List;
import pe.edu.karely.dto.administracion.AuditoriaResponseDTO;
public interface AuditoriaService {
List<AuditoriaResponseDTO> listarAuditoria(long actor);
}

package pe.edu.karely.service.service;
import java.util.List;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.administracion.NotificacionRequestDTO;
import pe.edu.karely.dto.administracion.NotificacionResponseDTO;
public interface NotificacionService {
List<NotificacionResponseDTO> listarNotificaciones(long actor);
OperacionResponseDTO encolarNotificacion(NotificacionRequestDTO i, long actor);
}

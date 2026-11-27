package pe.edu.karely.service.service.administracion;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.administracion.NotificacionRequestDTO;
import pe.edu.karely.dto.administracion.NotificacionResponseDTO;

import java.util.List;

public interface NotificacionService {
    List<NotificacionResponseDTO> listarNotificaciones(long actor);

    OperacionResponseDTO encolarNotificacion(NotificacionRequestDTO i, long actor);

    pe.edu.karely.dto.PaginaResponseDTO<NotificacionResponseDTO> listarNotificacionesPagina(
            int pagina, int tamanio, String filtro, long actor);
}

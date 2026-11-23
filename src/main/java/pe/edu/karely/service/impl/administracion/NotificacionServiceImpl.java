package pe.edu.karely.service.impl.administracion;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.administracion.NotificacionRequestDTO;
import pe.edu.karely.dto.administracion.NotificacionResponseDTO;
import pe.edu.karely.repository.administracion.NotificacionRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.administracion.NotificacionService;

import java.util.List;

@Service
public class NotificacionServiceImpl implements NotificacionService {
    private final NotificacionRepository repository;
    private final PermisosUsuario permisos;

    public NotificacionServiceImpl(NotificacionRepository repository, PermisosUsuario permisos) {
        this.repository = repository;
        this.permisos = permisos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificacionResponseDTO> listarNotificaciones(long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "TESORERA");
        return repository.listarNotificaciones();
    }

    @Override
    @Transactional
    public OperacionResponseDTO encolarNotificacion(NotificacionRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA");
        Long id = repository.encolarNotificacion(actor, actor, i.idCita(), i.tipo());
        return OperacionResponseDTO.resultado("SP_ENCOLAR_NOTIFICACION_CITA", id);
    }
}

package pe.edu.karely.service.impl.administracion;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.administracion.AuditoriaResponseDTO;
import pe.edu.karely.repository.administracion.AuditoriaRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.administracion.AuditoriaService;

import java.util.List;

@Service
public class AuditoriaServiceImpl implements AuditoriaService {
    private final AuditoriaRepository repository;
    private final PermisosUsuario permisos;

    public AuditoriaServiceImpl(AuditoriaRepository repository, PermisosUsuario permisos) {
        this.repository = repository;
        this.permisos = permisos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditoriaResponseDTO> listarAuditoria(long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        return repository.listarAuditoria();
    }
}

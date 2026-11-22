package pe.edu.karely.service.impl;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.karely.repository.AuditoriaRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.dto.administracion.AuditoriaResponseDTO;
import pe.edu.karely.service.service.AuditoriaService;
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
        permisos.exigir(actor,"ADMINISTRADORA");
        return repository.listarAuditoria();
    }

}

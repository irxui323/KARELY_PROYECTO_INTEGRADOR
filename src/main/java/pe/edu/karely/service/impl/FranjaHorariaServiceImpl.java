package pe.edu.karely.service.impl;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.karely.repository.AuditoriaRepository;
import pe.edu.karely.repository.FranjaHorariaRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.catalogo.FranjaRequestDTO;
import pe.edu.karely.dto.catalogo.FranjaResponseDTO;
import pe.edu.karely.exception.RecursoNoEncontradoException;
import pe.edu.karely.service.service.FranjaHorariaService;
@Service
public class FranjaHorariaServiceImpl implements FranjaHorariaService {
    private final FranjaHorariaRepository repository;
    private final PermisosUsuario permisos;
    private final AuditoriaRepository auditoria;
    public FranjaHorariaServiceImpl(FranjaHorariaRepository repository, PermisosUsuario permisos, AuditoriaRepository auditoria) {
        this.repository = repository;
        this.permisos = permisos;
        this.auditoria = auditoria;
    }

@Override
    @Transactional(readOnly = true)
    public List<FranjaResponseDTO> listarTurnos(long actor) {
        permisos.rol(actor);
        return repository.listarTurnos();
    }

@Override
    @Transactional
    public OperacionResponseDTO registrarTurno(FranjaRequestDTO i, long actor) {
        permisos.exigir(actor,"ADMINISTRADORA");
        Long id=repository.registrarTurno(i.horaInicio(), i.horaFin());
        auditoria.registrar(actor,"FRANJA_HORARIA",id,"CREAR","Alta de franja horaria");
        return OperacionResponseDTO.resultado("franja-crear",id);
    }

@Override
    @Transactional
    public OperacionResponseDTO editarTurno(long idFranja, FranjaRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        long id = idFranja;
        if (repository.editarTurno(id, i.horaInicio(), i.horaFin(), i.estado()) != 1) {
            throw new RecursoNoEncontradoException("Registro no encontrado");
        }
        auditoria.registrar(actor, "FRANJA_HORARIA", id, "ACTUALIZAR", "Edición del catálogo");
        return OperacionResponseDTO.resultado("franja-editar", id);
    }

}

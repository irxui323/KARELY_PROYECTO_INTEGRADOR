package pe.edu.karely.service.impl.catalogos;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.catalogo.EspecialidadRequestDTO;
import pe.edu.karely.dto.catalogo.EspecialidadResponseDTO;
import pe.edu.karely.exception.RecursoNoEncontradoException;
import pe.edu.karely.repository.administracion.AuditoriaRepository;
import pe.edu.karely.repository.catalogos.EspecialidadRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.catalogos.EspecialidadService;

import java.util.List;

@Service
public class EspecialidadServiceImpl implements EspecialidadService {
    private final EspecialidadRepository repository;
    private final PermisosUsuario permisos;
    private final AuditoriaRepository auditoria;

    public EspecialidadServiceImpl(
            EspecialidadRepository repository,
            PermisosUsuario permisos,
            AuditoriaRepository auditoria) {
        this.repository = repository;
        this.permisos = permisos;
        this.auditoria = auditoria;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EspecialidadResponseDTO> listarEspecialidades(long actor) {
        permisos.rol(actor);
        return repository.listarEspecialidades();
    }

    @Override
    @Transactional
    public OperacionResponseDTO registrarEspecialidad(EspecialidadRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        Long id = repository.registrarEspecialidad(i.nombre(), i.precioConsulta());
        auditoria.registrar(actor, "ESPECIALIDAD", id, "CREAR", "Alta de especialidad");
        return OperacionResponseDTO.resultado("especialidad-crear", id);
    }

    @Override
    @Transactional
    public OperacionResponseDTO editarEspecialidad(
            long idEspecialidad, EspecialidadRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        long id = idEspecialidad;
        if (repository.editarEspecialidad(id, i.nombre(), i.precioConsulta(), i.estado()) != 1) {
            throw new RecursoNoEncontradoException("Registro no encontrado");
        }
        auditoria.registrar(actor, "ESPECIALIDAD", id, "ACTUALIZAR", "Edición del catálogo");
        return OperacionResponseDTO.resultado("especialidad-editar", id);
    }
}

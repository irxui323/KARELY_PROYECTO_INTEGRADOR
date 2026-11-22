package pe.edu.karely.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.catalogo.ConsultorioRequestDTO;
import pe.edu.karely.dto.catalogo.ConsultorioResponseDTO;
import pe.edu.karely.exception.RecursoNoEncontradoException;
import pe.edu.karely.repository.AuditoriaRepository;
import pe.edu.karely.repository.ConsultorioRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.ConsultorioService;

import java.util.List;

@Service
public class ConsultorioServiceImpl implements ConsultorioService {
    private final ConsultorioRepository repository;
    private final PermisosUsuario permisos;
    private final AuditoriaRepository auditoria;

    public ConsultorioServiceImpl(
            ConsultorioRepository repository,
            PermisosUsuario permisos,
            AuditoriaRepository auditoria) {
        this.repository = repository;
        this.permisos = permisos;
        this.auditoria = auditoria;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConsultorioResponseDTO> listarConsultorios(long actor) {
        permisos.rol(actor);
        return repository.listarConsultorios();
    }

    @Override
    @Transactional
    public OperacionResponseDTO registrarConsultorio(ConsultorioRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        Long id = repository.registrarConsultorio(i.nombre(), i.ubicacion());
        auditoria.registrar(actor, "CONSULTORIO", id, "CREAR", "Alta de consultorio");
        return OperacionResponseDTO.resultado("consultorio-crear", id);
    }

    @Override
    @Transactional
    public OperacionResponseDTO editarConsultorio(
            long idConsultorio, ConsultorioRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        long id = idConsultorio;
        if (repository.editarConsultorio(id, i.nombre(), i.ubicacion(), i.estado()) != 1) {
            throw new RecursoNoEncontradoException("Registro no encontrado");
        }
        auditoria.registrar(actor, "CONSULTORIO", id, "ACTUALIZAR", "Edición del catálogo");
        return OperacionResponseDTO.resultado("consultorio-editar", id);
    }
}

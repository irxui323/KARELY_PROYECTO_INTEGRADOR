package pe.edu.karely.service.impl.pacientes;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.paciente.PacienteRequestDTO;
import pe.edu.karely.dto.paciente.PacienteResponseDTO;
import pe.edu.karely.exception.RecursoNoEncontradoException;
import pe.edu.karely.repository.administracion.AuditoriaRepository;
import pe.edu.karely.repository.pacientes.PacienteRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.pacientes.PacienteService;

import java.util.List;

@Service
public class PacienteServiceImpl implements PacienteService {
    private final PacienteRepository repository;
    private final PermisosUsuario permisos;
    private final AuditoriaRepository auditoria;

    public PacienteServiceImpl(
            PacienteRepository repository,
            PermisosUsuario permisos,
            AuditoriaRepository auditoria) {
        this.repository = repository;
        this.permisos = permisos;
        this.auditoria = auditoria;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PacienteResponseDTO> listarPacientes(long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA");
        return repository.listarPacientes();
    }

    @Override
    @Transactional
    public OperacionResponseDTO registrarPaciente(PacienteRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA");
        Long id =
                repository.registrarPaciente(
                        i.tipoDocumento(),
                        i.numeroDocumento(),
                        i.nombres(),
                        i.apellidos(),
                        i.fechaNacimiento() == null
                                ? null
                                : java.sql.Date.valueOf(i.fechaNacimiento()),
                        i.telefono(),
                        i.correo(),
                        i.direccion());
        auditoria.registrar(actor, "PACIENTE", id, "CREAR", "Alta de paciente via API");
        return OperacionResponseDTO.resultado("paciente-crear", id);
    }

    @Override
    @Transactional
    public OperacionResponseDTO editarPaciente(long idPaciente, PacienteRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA");
        int n =
                repository.editarPaciente(
                        i.nombres(),
                        i.apellidos(),
                        i.telefono(),
                        i.correo(),
                        i.direccion(),
                        i.estado(),
                        idPaciente);
        if (n != 1) throw new RecursoNoEncontradoException("Paciente no encontrado");
        auditoria.registrar(
                actor, "PACIENTE", idPaciente, "ACTUALIZAR", "Actualizacion de paciente via API");
        return OperacionResponseDTO.resultado("paciente-editar", idPaciente);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PacienteResponseDTO> buscarPaciente(String tipo, String documento, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA");
        return repository.buscarPaciente(
                tipo.trim().toUpperCase(java.util.Locale.ROOT), documento.trim());
    }

    @Override
    @Transactional(readOnly = true)
    public PacienteResponseDTO buscarPorId(long id, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA");
        var registro = repository.buscarPorId(id);
        if (registro == null) throw new RecursoNoEncontradoException("Paciente no encontrado");

        return registro;
    }
}

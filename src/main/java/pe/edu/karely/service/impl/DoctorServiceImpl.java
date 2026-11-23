package pe.edu.karely.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.doctor.AccesoDoctorResponseDTO;
import pe.edu.karely.dto.doctor.AsignarEspecialidadRequestDTO;
import pe.edu.karely.dto.doctor.CrearAccesoRequestDTO;
import pe.edu.karely.dto.doctor.DoctorRequestDTO;
import pe.edu.karely.dto.doctor.DoctorResponseDTO;
import pe.edu.karely.dto.doctor.RechazarDocumentoRequestDTO;
import pe.edu.karely.dto.doctor.ValidarDocumentacionRequestDTO;
import pe.edu.karely.exception.RecursoNoEncontradoException;
import pe.edu.karely.repository.AuditoriaRepository;
import pe.edu.karely.repository.DoctorRepository;
import pe.edu.karely.repository.UsuarioRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.DoctorService;

import java.util.List;

@Service
public class DoctorServiceImpl implements DoctorService {
    private final DoctorRepository repository;
    private final PermisosUsuario permisos;
    private final AuditoriaRepository auditoria;
    private final UsuarioRepository usuarios;
    private final pe.edu.karely.repository.DocumentoDoctorRepository documentos;
    private final org.springframework.security.crypto.password.PasswordEncoder encoder;

    public DoctorServiceImpl(
            DoctorRepository repository,
            PermisosUsuario permisos,
            AuditoriaRepository auditoria,
            UsuarioRepository usuarios,
            pe.edu.karely.repository.DocumentoDoctorRepository documentos,
            org.springframework.security.crypto.password.PasswordEncoder encoder) {
        this.repository = repository;
        this.permisos = permisos;
        this.auditoria = auditoria;
        this.usuarios = usuarios;
        this.documentos = documentos;
        this.encoder = encoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponseDTO> listarDoctores(long actor) {
        String rol = permisos.rol(actor);
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA", "DOCTOR", "TESORERA");
        return rol.equals("DOCTOR")
                ? repository.listarDoctoresDelMedico(actor)
                : rol.equals("TESORERA")
                        ? repository.listarDoctoresParaTesoreria()
                        : repository.listarDoctoresGeneral();
    }

    @Override
    @Transactional
    public OperacionResponseDTO registrarDoctor(DoctorRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        Long id =
                repository.registrarDoctor(
                        i.tipoDocumento(),
                        i.numeroDocumento(),
                        i.nombres(),
                        i.apellidos(),
                        i.telefono(),
                        i.correo(),
                        null);
        auditoria.registrar(actor, "DOCTOR", id, "CREAR", "Alta de doctor via API");
        return OperacionResponseDTO.resultado("doctor-crear", id);
    }

    @Override
    @Transactional
    public OperacionResponseDTO editarDoctor(long idDoctor, DoctorRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        int n =
                repository.editarDoctor(
                        i.nombres(), i.apellidos(), i.telefono(), i.correo(), i.estado(), idDoctor);
        if (n != 1) throw new RecursoNoEncontradoException("Doctor no encontrado");
        auditoria.registrar(
                actor, "DOCTOR", idDoctor, "ACTUALIZAR", "Actualizacion de doctor via API");
        return OperacionResponseDTO.resultado("doctor-editar", idDoctor);
    }

    @Override
    @Transactional
    public AccesoDoctorResponseDTO crearAcceso(
            long idDoctor, CrearAccesoRequestDTO request, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        var doctor = doctorActivoBloqueado(idDoctor);
        if (doctor.idUsuario() != null)
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "El doctor ya tiene una cuenta de acceso");
        if (!"COMPLETO".equals(doctor.estadoDocumentacion())
                || !repository.tieneEspecialidad(idDoctor))
            throw new IllegalArgumentException(
                    "Asigna una especialidad y aprueba el DNI y el título antes de crear el"
                            + " acceso");
        if (doctor.correo() == null || doctor.correo().isBlank())
            throw new IllegalArgumentException(
                    "Registra el correo del doctor antes de crear su acceso");
        var rol = usuarios.buscarRolDoctor();
        if (rol == null) throw new IllegalStateException("No existe un rol DOCTOR activo");
        var random = new java.security.SecureRandom();
        String alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*-_";
        StringBuilder clave = new StringBuilder("Aa7!");
        for (int i = 0; i < 16; i++)
            clave.append(alfabeto.charAt(random.nextInt(alfabeto.length())));
        char[] caracteres = clave.toString().toCharArray();
        for (int i = caracteres.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = caracteres[i];
            caracteres[i] = caracteres[j];
            caracteres[j] = temp;
        }
        String password = new String(caracteres);
        Long id =
                usuarios.crearUsuario(
                        actor,
                        rol.idRol(),
                        request.username(),
                        doctor.correo(),
                        encoder.encode(password));
        if (repository.vincularUsuarioEnTabla(id, idDoctor) != 1)
            throw new RecursoNoEncontradoException("Doctor no encontrado");
        auditoria.registrar(
                actor, "DOCTOR", idDoctor, "CREAR_ACCESO", "Cuenta de doctor creada y vinculada");
        return new AccesoDoctorResponseDTO(request.username(), doctor.correo(), password);
    }

    @Override
    @Transactional
    public OperacionResponseDTO asignarEspecialidad(
            long idDoctor, AsignarEspecialidadRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        doctorActivoBloqueado(idDoctor);
        try {
            repository.asignarEspecialidad(idDoctor, i.idEspecialidad());
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            boolean duplicada = false;
            for (Throwable causa = e; causa != null; causa = causa.getCause()) {
                if (causa.getMessage() != null
                        && causa.getMessage()
                                .toUpperCase(java.util.Locale.ROOT)
                                .contains("UQ_DOCTOR_ESPECIALIDAD")) {
                    duplicada = true;
                    break;
                }
            }
            if (!duplicada) throw e;
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "El doctor ya tiene asignada esta especialidad",
                    e);
        }
        auditoria.registrar(
                actor, "DOCTOR_ESPECIALIDAD", idDoctor, "ASIGNAR", "Asignacion de especialidad");
        return OperacionResponseDTO.resultado("doctor-especialidad", null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<pe.edu.karely.dto.catalogo.EspecialidadResponseDTO> listarEspecialidades(
            long idDoctor, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "DOCTOR");
        var doctor = repository.buscarPorId(idDoctor);
        if (doctor == null) throw new RecursoNoEncontradoException("Doctor no encontrado");
        if ("DOCTOR".equals(permisos.rol(actor))
                && !java.util.Objects.equals(doctor.idUsuario(), actor))
            throw new org.springframework.security.access.AccessDeniedException(
                    "Solo puedes consultar tus especialidades");
        return repository.listarEspecialidades(idDoctor);
    }

    @Override
    @Transactional
    public OperacionResponseDTO quitarEspecialidad(long idDoctor, long idEspecialidad, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        if (repository.bloquearDoctor(idDoctor) == null)
            throw new RecursoNoEncontradoException("Doctor no encontrado");
        if (repository.especialidadEnUso(idDoctor, idEspecialidad))
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "No se puede quitar: hay citas pendientes, atenciones abiertas o reservas"
                            + " vigentes con esta especialidad");
        if (repository.quitarEspecialidad(idDoctor, idEspecialidad) != 1)
            throw new RecursoNoEncontradoException("El doctor no tiene asignada esta especialidad");
        auditoria.registrar(
                actor,
                "DOCTOR_ESPECIALIDAD",
                idDoctor,
                "QUITAR",
                "Especialidad retirada: " + idEspecialidad);
        return OperacionResponseDTO.resultado("doctor-especialidad-quitar", idEspecialidad);
    }

    @Override
    @Transactional
    public OperacionResponseDTO validarDocumentacion(
            long idDoctor, ValidarDocumentacionRequestDTO revision, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        doctorActivoBloqueado(idDoctor);
        if (!repository.tieneEspecialidad(idDoctor))
            throw new IllegalArgumentException(
                    "Asigna una especialidad antes de aprobar la documentación");
        if (!Boolean.TRUE.equals(revision.dniConforme())
                || !Boolean.TRUE.equals(revision.tituloConforme()))
            throw new IllegalArgumentException("Confirma la revisión manual del DNI y del título");
        var archivos = documentos.listarDocumentos(idDoctor);
        for (String tipo : java.util.List.of("DNI", "TITULO")) {
            var ultimo =
                    archivos.stream()
                            .filter(d -> tipo.equals(d.tipoDocumento()))
                            .max(java.util.Comparator.comparing(d -> d.idDocumento()))
                            .orElseThrow(
                                    () ->
                                            new IllegalArgumentException(
                                                    "Falta el documento " + tipo));
            Long revisado = "DNI".equals(tipo) ? revision.idDni() : revision.idTitulo();
            if (!ultimo.idDocumento().equals(revisado)
                    || !java.util.Set.of("PENDIENTE", "VALIDADO").contains(ultimo.estado()))
                throw new IllegalArgumentException(
                        "Los documentos cambiaron o fueron rechazados. Revisa su última versión");
        }
        repository.validarDocumentacion(actor, actor, idDoctor);
        auditoria.registrar(
                actor,
                "DOCTOR",
                idDoctor,
                "VALIDAR_DOC",
                "Revisión manual conforme de DNI="
                        + revision.idDni()
                        + " y título="
                        + revision.idTitulo());
        return OperacionResponseDTO.resultado("SP_VALIDAR_DOCUMENTACION", null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponseDTO> buscarPorDocumento(String documento, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA");
        return repository.buscarPorDocumento(documento.trim());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponseDTO> listarPendientes(long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        return repository.listarPendientes();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponseDTO> listarConDocumentacionCompleta(long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        return repository.listarConDocumentacionCompleta();
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponseDTO buscarPorId(long id, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA", "DOCTOR", "TESORERA");
        var registro = repository.buscarPorId(id);
        if (registro == null) throw new RecursoNoEncontradoException("Doctor no encontrado");
        if ("DOCTOR".equals(permisos.rol(actor))
                && !Long.valueOf(actor).equals(registro.idUsuario()))
            throw new org.springframework.security.access.AccessDeniedException("Doctor ajeno");
        if ("TESORERA".equals(permisos.rol(actor))) {
            return new DoctorResponseDTO(
                    registro.idDoctor(),
                    null,
                    null,
                    null,
                    registro.nombres(),
                    registro.apellidos(),
                    null,
                    null,
                    null,
                    registro.estado());
        }
        return registro;
    }

    private DoctorResponseDTO doctorActivoBloqueado(long id) {
        var doctor = repository.bloquearDoctor(id);
        if (doctor == null) throw new RecursoNoEncontradoException("Doctor no encontrado");
        if (!"ACTIVO".equals(doctor.estado()))
            throw new IllegalArgumentException("El doctor está inactivo");
        return doctor;
    }

    @Override
    @Transactional
    public OperacionResponseDTO rechazarDocumento(
            long idDoctor, long idDocumento, RechazarDocumentoRequestDTO request, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        doctorActivoBloqueado(idDoctor);
        var archivos = documentos.listarDocumentos(idDoctor);
        var seleccionado =
                archivos.stream()
                        .filter(d -> d.idDocumento() == idDocumento)
                        .findFirst()
                        .orElseThrow(
                                () ->
                                        new RecursoNoEncontradoException(
                                                "Documento no encontrado para este doctor"));
        if (archivos.stream()
                .anyMatch(
                        d ->
                                d.tipoDocumento().equals(seleccionado.tipoDocumento())
                                        && d.idDocumento() > idDocumento))
            throw new IllegalArgumentException("Revisa la versión vigente del documento");
        if (documentos.rechazar(idDoctor, idDocumento, actor) != 1)
            throw new RecursoNoEncontradoException("Documento no encontrado para este doctor");
        repository.rechazarDocumentacion(idDoctor);
        auditoria.registrar(actor, "DOCUMENTO_DOCTOR", idDocumento, "RECHAZAR", request.motivo());
        return OperacionResponseDTO.resultado("documento-rechazar", idDocumento);
    }
}

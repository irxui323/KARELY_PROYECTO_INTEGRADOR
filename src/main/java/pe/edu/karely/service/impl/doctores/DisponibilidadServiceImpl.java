package pe.edu.karely.service.impl.doctores;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.doctor.DisponibilidadRequestDTO;
import pe.edu.karely.dto.doctor.DisponibilidadResponseDTO;
import pe.edu.karely.repository.doctores.DisponibilidadDoctorRepository;
import pe.edu.karely.repository.doctores.DoctorRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.doctores.DisponibilidadService;

import java.util.List;

@Service
public class DisponibilidadServiceImpl implements DisponibilidadService {
    @Override
    @Transactional(readOnly = true)
    public pe.edu.karely.dto.PaginaResponseDTO<DisponibilidadResponseDTO> listarHorariosPagina(
            int pagina, int tamanio, String filtro, long actor) {
        pe.edu.karely.dto.PaginaResponseDTO.validar(pagina, tamanio);
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA", "DOCTOR");
        return repository.listarHorariosPagina(
                pagina, tamanio, filtro, permisos.rol(actor).equals("DOCTOR") ? actor : null);
    }

    private final DisponibilidadDoctorRepository repository;
    private final PermisosUsuario permisos;
    private final DoctorRepository doctores;

    public DisponibilidadServiceImpl(
            DisponibilidadDoctorRepository repository,
            PermisosUsuario permisos,
            DoctorRepository doctores) {
        this.repository = repository;
        this.permisos = permisos;
        this.doctores = doctores;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisponibilidadResponseDTO> listarHorarios(long actor) {
        String rol = permisos.rol(actor);
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA", "DOCTOR");
        return rol.equals("DOCTOR")
                ? repository.listarHorariosDelMedico(actor)
                : repository.listarHorariosGeneral();
    }

    @Override
    @Transactional
    public OperacionResponseDTO registrarHorario(
            long idDoctor, DisponibilidadRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "DOCTOR");
        if (i.fecha() == null
                || i.fecha()
                        .isBefore(java.time.LocalDate.now(java.time.ZoneId.of("America/Bogota"))))
            throw new IllegalArgumentException("La fecha del horario no puede ser anterior a hoy");
        if (i.idEspecialidad() == null || i.idEspecialidad() <= 0)
            throw new IllegalArgumentException("Selecciona la especialidad de esta disponibilidad");
        var doctor = doctores.bloquearDoctor(idDoctor);
        if (doctor == null
                || !"ACTIVO".equals(doctor.estado())
                || !"COMPLETO".equals(doctor.estadoDocumentacion()))
            throw new IllegalArgumentException(
                    "Solo se puede registrar disponibilidad para un médico validado");
        return OperacionResponseDTO.resultado(
                "SP_REGISTRAR_DISPONIBILIDAD",
                repository.registrarHorario(
                        actor, actor, idDoctor, i.fecha(), i.idFranja(), i.idEspecialidad()));
    }
}

package pe.edu.karely.service.impl.citas;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.cita.CancelarCitaRequestDTO;
import pe.edu.karely.dto.cita.CitaResponseDTO;
import pe.edu.karely.dto.cita.ConfirmarCitaRequestDTO;
import pe.edu.karely.dto.cita.ReprogramarCitaRequestDTO;
import pe.edu.karely.dto.cita.ReservaRequestDTO;
import pe.edu.karely.dto.cita.ReservaResponseDTO;
import pe.edu.karely.repository.citas.CitaRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.citas.CitaService;

import java.util.List;

@Service
public class CitaServiceImpl implements CitaService {
    private final CitaRepository repository;
    private final PermisosUsuario permisos;

    public CitaServiceImpl(CitaRepository repository, PermisosUsuario permisos) {
        this.repository = repository;
        this.permisos = permisos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<pe.edu.karely.dto.cita.DisponibilidadDiaDTO> disponibilidadMes(
            long especialidad, java.time.LocalDate mes, Long consultorio, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA");
        if (especialidad <= 0
                || mes == null
                || mes.getDayOfMonth() != 1
                || (consultorio != null && consultorio <= 0))
            throw new IllegalArgumentException(
                    "Selecciona un mes, especialidad y consultorio válidos");
        var grupos =
                repository.turnosDelMes(especialidad, mes, mes.plusMonths(1), consultorio).stream()
                        .collect(
                                java.util.stream.Collectors.groupingBy(
                                        t ->
                                                new pe.edu.karely.dto.cita.DisponibilidadDiaDTO(
                                                        t.fecha(), t.idDoctor(), 0L),
                                        java.util.LinkedHashMap::new,
                                        java.util.stream.Collectors.counting()));
        return grupos.entrySet().stream()
                .map(
                        e ->
                                new pe.edu.karely.dto.cita.DisponibilidadDiaDTO(
                                        e.getKey().fecha(), e.getKey().idDoctor(), e.getValue()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<pe.edu.karely.dto.cita.DoctorDisponibleDTO> disponibilidad(
            long especialidad, java.time.LocalDate fecha, Long consultorio, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA");
        if (especialidad <= 0 || (consultorio != null && consultorio <= 0))
            throw new IllegalArgumentException(
                    "Selecciona una especialidad y un consultorio válidos");
        if (fecha != null
                && fecha.isBefore(java.time.LocalDate.now(java.time.ZoneId.of("America/Bogota"))))
            throw new IllegalArgumentException("La fecha de la cita no puede ser anterior a hoy");
        var doctores = repository.doctoresPorEspecialidad(especialidad);
        var turnos =
                fecha == null
                        ? java.util.List.<pe.edu.karely.dto.cita.TurnoDisponibleDTO>of()
                        : repository.turnosDisponibles(especialidad, fecha, consultorio);
        return doctores.stream()
                .map(
                        d ->
                                new pe.edu.karely.dto.cita.DoctorDisponibleDTO(
                                        d.idDoctor(),
                                        d.nombre(),
                                        turnos.stream()
                                                .filter(t -> t.idDoctor().equals(d.idDoctor()))
                                                .toList()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listarCitas(long actor) {
        String rol = permisos.rol(actor);
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA", "CAJERA", "DOCTOR");
        return rol.equals("DOCTOR")
                ? repository.listarCitasDelMedico(actor)
                : repository.listarCitasGeneral();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarReservas(long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA", "CAJERA");
        return repository.listarReservas();
    }

    @Override
    @Transactional
    public OperacionResponseDTO bloquearTurno(ReservaRequestDTO i, long actor) {
        permisos.exigir(actor, "RECEPCIONISTA", "ADMINISTRADORA");
        return OperacionResponseDTO.resultado(
                "SP_PRE_RESERVAR_CITA",
                repository.bloquearTurno(
                        actor,
                        actor,
                        i.idPaciente(),
                        i.idDoctor(),
                        i.idEspecialidad(),
                        i.idConsultorio(),
                        i.idFranja(),
                        i.fecha()));
    }

    @Override
    @Transactional
    public OperacionResponseDTO registrarCita(ConfirmarCitaRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA", "CAJERA");
        if (i.idPreReserva() == null || i.idPreReserva() <= 0)
            throw new IllegalArgumentException("Selecciona una pre-reserva válida");
        String referencia =
                "COBRO-" + String.format(java.util.Locale.ROOT, "%06d", i.idPreReserva());
        Long id =
                repository.registrarCita(
                        actor, actor, i.idPreReserva(), i.metodoPago(), referencia);
        return new OperacionResponseDTO(
                "SP_CONFIRMAR_CITA_PAGADA",
                id,
                "Cobro " + referencia + " registrado. Cita #" + id + " confirmada.");
    }

    @Override
    @Transactional
    public OperacionResponseDTO reprogramarCita(
            long idCita, ReprogramarCitaRequestDTO i, long actor) {
        permisos.exigir(actor, "RECEPCIONISTA", "ADMINISTRADORA");
        repository.reprogramarCita(
                actor,
                actor,
                idCita,
                i.fechaNueva(),
                i.idFranjaNueva(),
                i.idConsultorioNuevo(),
                i.motivo(),
                i.aceptacionPaciente());
        return OperacionResponseDTO.resultado("SP_REPROGRAMAR_CITA", null);
    }

    @Override
    @Transactional
    public OperacionResponseDTO registrarAsistencia(long idCita, long actor) {
        permisos.exigir(actor, "RECEPCIONISTA", "ADMINISTRADORA");
        return OperacionResponseDTO.resultado(
                "SP_REGISTRAR_ASISTENCIA", repository.registrarAsistencia(actor, actor, idCita));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponseDTO> filtrarAgendaMedica(long actor, java.time.LocalDate fecha) {
        permisos.exigir(actor, "DOCTOR", "ADMINISTRADORA");
        return permisos.rol(actor).equals("ADMINISTRADORA")
                ? repository.filtrarAgendaGeneral(fecha)
                : repository.filtrarAgendaMedica(actor, fecha);
    }

    @Override
    @Transactional(readOnly = true)
    public CitaResponseDTO detalleCitaMedica(long actor, long idCita) {
        permisos.exigir(actor, "DOCTOR", "ADMINISTRADORA");
        var cita =
                permisos.rol(actor).equals("ADMINISTRADORA")
                        ? repository.detalleCitaGeneral(idCita)
                        : repository.detalleCitaMedica(actor, idCita);
        if (cita == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Cita no encontrada");
        }
        return cita;
    }

    @Override
    @Transactional
    public OperacionResponseDTO cancelarReprogramada(
            long idCita, CancelarCitaRequestDTO request, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        repository.cancelarReprogramada(actor, actor, idCita, request.motivo());
        return OperacionResponseDTO.resultado("cita-cancelar", idCita);
    }

    @Override
    @Transactional(readOnly = true)
    public pe.edu.karely.dto.PaginaResponseDTO<CitaResponseDTO> listarCitasPagina(
            int pagina, int tamanio, String filtro, String vista, long actor) {
        pe.edu.karely.dto.PaginaResponseDTO.validar(pagina, tamanio);
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA", "CAJERA", "DOCTOR");
        if (!java.util.Set.of("proximas", "historial", "todas").contains(vista))
            throw new IllegalArgumentException("Vista de agenda inválida");
        return repository.listarCitasPagina(
                pagina,
                tamanio,
                filtro,
                permisos.rol(actor).equals("DOCTOR") ? actor : null,
                vista);
    }
}

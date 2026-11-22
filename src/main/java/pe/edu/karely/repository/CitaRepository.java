package pe.edu.karely.repository;

import org.springframework.stereotype.Repository;

import pe.edu.karely.dto.cita.CitaResponseDTO;
import pe.edu.karely.dto.cita.ReservaResponseDTO;

import java.util.List;

@Repository
public class CitaRepository {
    private final OracleJdbc jdbc;

    public CitaRepository(OracleJdbc jdbc) {
        this.jdbc = jdbc;
    }

    public List<pe.edu.karely.dto.cita.DoctorEspecialidadDTO> doctoresPorEspecialidad(
            long especialidad) {
        return jdbc.list(
                pe.edu.karely.dto.cita.DoctorEspecialidadDTO.class,
                """
                SELECT d.ID_DOCTOR,d.NOMBRES||' '||d.APELLIDOS AS NOMBRE
                FROM DOCTOR d JOIN DOCTOR_ESPECIALIDAD de ON de.ID_DOCTOR=d.ID_DOCTOR
                JOIN ESPECIALIDAD e ON e.ID_ESPECIALIDAD=de.ID_ESPECIALIDAD
                WHERE e.ID_ESPECIALIDAD=? AND e.ESTADO='ACTIVO'
                  AND d.ESTADO='ACTIVO' AND d.ESTADO_DOCUMENTACION='COMPLETO'
                ORDER BY d.APELLIDOS,d.NOMBRES
                """,
                especialidad);
    }

    public List<pe.edu.karely.dto.cita.TurnoDisponibleDTO> turnosDisponibles(
            long especialidad, java.time.LocalDate fecha, Long consultorio) {
        return turnosDelMes(especialidad, fecha, fecha.plusDays(1), consultorio).stream()
                .map(
                        t ->
                                new pe.edu.karely.dto.cita.TurnoDisponibleDTO(
                                        t.idDoctor(), t.idFranja(), t.horaInicio(), t.horaFin()))
                .toList();
    }

    public List<pe.edu.karely.dto.cita.TurnoFechaDTO> turnosDelMes(
            long especialidad,
            java.time.LocalDate desde,
            java.time.LocalDate hasta,
            Long consultorio) {
        String sql =
                """
                SELECT DISTINCT d.ID_DOCTOR,f.ID_FRANJA,f.HORA_INICIO,f.HORA_FIN,a.FECHA_TURNO AS FECHA
                FROM DOCTOR d JOIN DOCTOR_ESPECIALIDAD de ON de.ID_DOCTOR=d.ID_DOCTOR
                JOIN ESPECIALIDAD e ON e.ID_ESPECIALIDAD=de.ID_ESPECIALIDAD
                JOIN DISPONIBILIDAD_DOCTOR a ON a.ID_DOCTOR=d.ID_DOCTOR
                JOIN FRANJA_HORARIA f ON f.ID_FRANJA=a.ID_FRANJA
                WHERE e.ID_ESPECIALIDAD=? AND e.ESTADO='ACTIVO' AND d.ESTADO='ACTIVO'
                  AND d.ESTADO_DOCUMENTACION='COMPLETO' AND a.ESTADO='ACTIVO' AND f.ESTADO='ACTIVO'
                  AND a.ID_ESPECIALIDAD=de.ID_ESPECIALIDAD
                  AND a.FECHA_TURNO>=? AND a.FECHA_TURNO<?
                  AND (a.FECHA_TURNO>TRUNC(SYSDATE) OR (a.FECHA_TURNO=TRUNC(SYSDATE) AND f.HORA_INICIO>TO_CHAR(SYSDATE,'HH24:MI')))
                  AND NOT EXISTS (
                    SELECT 1 FROM CITA c JOIN FRANJA_HORARIA cf ON cf.ID_FRANJA=c.ID_FRANJA
                    WHERE c.FECHA_CITA=a.FECHA_TURNO AND c.ESTADO IN ('PROGRAMADA','REPROGRAMADA','EN_ATENCION')
                      AND (c.ID_DOCTOR=d.ID_DOCTOR OR c.ID_CONSULTORIO=?)
                      AND cf.HORA_INICIO<f.HORA_FIN AND f.HORA_INICIO<cf.HORA_FIN)
                  AND NOT EXISTS (
                    SELECT 1 FROM PRE_RESERVA_CITA p JOIN FRANJA_HORARIA pf ON pf.ID_FRANJA=p.ID_FRANJA
                    WHERE p.FECHA_CITA=a.FECHA_TURNO AND p.ESTADO='BLOQUEADA' AND p.FECHA_EXPIRACION>SYSTIMESTAMP
                      AND (p.ID_DOCTOR=d.ID_DOCTOR OR p.ID_CONSULTORIO=?)
                      AND pf.HORA_INICIO<f.HORA_FIN AND f.HORA_INICIO<pf.HORA_FIN)
                """;
        if (consultorio != null)
            sql +=
                    " AND EXISTS (SELECT 1 FROM CONSULTORIO co WHERE co.ID_CONSULTORIO=? AND"
                        + " co.ESTADO='ACTIVO')";
        sql += " ORDER BY a.FECHA_TURNO,d.ID_DOCTOR,f.HORA_INICIO,f.HORA_FIN";
        return consultorio == null
                ? jdbc.list(
                        pe.edu.karely.dto.cita.TurnoFechaDTO.class,
                        sql,
                        especialidad,
                        desde,
                        hasta,
                        null,
                        null)
                : jdbc.list(
                        pe.edu.karely.dto.cita.TurnoFechaDTO.class,
                        sql,
                        especialidad,
                        desde,
                        hasta,
                        consultorio,
                        consultorio,
                        consultorio);
    }

    public List<CitaResponseDTO> listarCitasDelMedico(long usuario) {
        return jdbc.list(
                CitaResponseDTO.class,
                "SELECT A.ID_CITA, A.FECHA_CITA, A.HORA_INICIO, A.HORA_FIN, A.ID_DOCTOR,"
                    + " A.NOMBRE_DOCTOR, A.ID_PACIENTE, A.NOMBRE_PACIENTE, A.ID_ESPECIALIDAD,"
                    + " A.ESPECIALIDAD, A.ID_CONSULTORIO, A.CONSULTORIO, A.ESTADO_CITA,"
                    + " A.REPROGRAMACIONES, A.ASISTENCIA_REGISTRADA, A.MONTO_TOTAL FROM"
                    + " VW_AGENDA_CITAS A JOIN DOCTOR D ON A.ID_DOCTOR=D.ID_DOCTOR WHERE"
                    + " D.ID_USUARIO=? ORDER BY A.FECHA_CITA DESC,A.HORA_INICIO FETCH FIRST 200"
                    + " ROWS ONLY",
                usuario);
    }

    public List<CitaResponseDTO> listarCitasGeneral() {
        return jdbc.list(
                CitaResponseDTO.class,
                "SELECT ID_CITA, FECHA_CITA, HORA_INICIO, HORA_FIN, ID_DOCTOR, NOMBRE_DOCTOR,"
                    + " ID_PACIENTE, NOMBRE_PACIENTE, ID_ESPECIALIDAD, ESPECIALIDAD,"
                    + " ID_CONSULTORIO, CONSULTORIO, ESTADO_CITA, REPROGRAMACIONES,"
                    + " ASISTENCIA_REGISTRADA, MONTO_TOTAL FROM VW_AGENDA_CITAS ORDER BY FECHA_CITA"
                    + " DESC, HORA_INICIO FETCH FIRST 400 ROWS ONLY");
    }

    public List<ReservaResponseDTO> listarReservas() {
        return jdbc.list(
                ReservaResponseDTO.class,
                "SELECT"
                    + " ID_PRE_RESERVA,ID_PACIENTE,ID_DOCTOR,ID_ESPECIALIDAD,ID_CONSULTORIO,ID_FRANJA,FECHA_CITA,MONTO,FECHA_EXPIRACION,ESTADO"
                    + " FROM PRE_RESERVA_CITA WHERE ESTADO='BLOQUEADA' AND"
                    + " FECHA_EXPIRACION>SYSTIMESTAMP ORDER BY ID_PRE_RESERVA DESC FETCH FIRST 100"
                    + " ROWS ONLY");
    }

    public Long bloquearTurno(
            long actor,
            long usuario,
            Long idPaciente,
            Long idDoctor,
            Long idEspecialidad,
            Long idConsultorio,
            Long idFranja,
            java.time.LocalDate fecha) {
        return jdbc.callId(
                "SP_PRE_RESERVAR_CITA",
                actor,
                usuario,
                idPaciente,
                idDoctor,
                idEspecialidad,
                idConsultorio,
                idFranja,
                fecha,
                OracleJdbc.outNumber());
    }

    public Long registrarCita(
            long actor, long usuario, Long idPreReserva, String metodoPago, String referenciaPago) {
        return jdbc.callId(
                "SP_CONFIRMAR_CITA_PAGADA",
                actor,
                usuario,
                idPreReserva,
                metodoPago,
                referenciaPago,
                OracleJdbc.outNumber());
    }

    public void reprogramarCita(
            long actor,
            long usuario,
            Long idCita,
            java.time.LocalDate fechaNueva,
            Long idFranjaNueva,
            Long idConsultorioNuevo,
            String motivo,
            String aceptacionPaciente) {
        jdbc.call(
                "SP_REPROGRAMAR_CITA",
                actor,
                usuario,
                idCita,
                fechaNueva,
                idFranjaNueva,
                idConsultorioNuevo,
                motivo,
                aceptacionPaciente);
    }

    public Long registrarAsistencia(long actor, long usuario, Long idCita) {
        return jdbc.callId(
                "SP_REGISTRAR_ASISTENCIA", actor, usuario, idCita, OracleJdbc.outNumber());
    }

    public List<CitaResponseDTO> filtrarAgendaMedica(long actor, java.time.LocalDate fecha) {
        return jdbc.list(
                CitaResponseDTO.class,
                """
                SELECT A.ID_CITA, A.FECHA_CITA, A.HORA_INICIO, A.HORA_FIN, A.ID_DOCTOR, A.NOMBRE_DOCTOR, A.ID_PACIENTE, A.NOMBRE_PACIENTE, A.ID_ESPECIALIDAD, A.ESPECIALIDAD, A.ID_CONSULTORIO, A.CONSULTORIO, A.ESTADO_CITA, A.REPROGRAMACIONES, A.ASISTENCIA_REGISTRADA, A.MONTO_TOTAL FROM VW_AGENDA_CITAS A JOIN DOCTOR D ON D.ID_DOCTOR = A.ID_DOCTOR
                WHERE D.ID_USUARIO = ? AND A.FECHA_CITA = ?
                ORDER BY A.HORA_INICIO, A.ID_CITA
                """,
                actor,
                fecha);
    }

    public CitaResponseDTO detalleCitaMedica(long actor, long idCita) {
        return jdbc.one(
                CitaResponseDTO.class,
                """
                SELECT A.ID_CITA, A.FECHA_CITA, A.HORA_INICIO, A.HORA_FIN, A.ID_DOCTOR, A.NOMBRE_DOCTOR, A.ID_PACIENTE, A.NOMBRE_PACIENTE, A.ID_ESPECIALIDAD, A.ESPECIALIDAD, A.ID_CONSULTORIO, A.CONSULTORIO, A.ESTADO_CITA, A.REPROGRAMACIONES, A.ASISTENCIA_REGISTRADA, A.MONTO_TOTAL FROM VW_AGENDA_CITAS A JOIN DOCTOR D ON D.ID_DOCTOR = A.ID_DOCTOR
                WHERE D.ID_USUARIO = ? AND A.ID_CITA = ?
                """,
                actor,
                idCita);
    }

    public List<CitaResponseDTO> filtrarAgendaGeneral(java.time.LocalDate fecha) {
        return jdbc.list(
                CitaResponseDTO.class,
                """
                SELECT A.ID_CITA, A.FECHA_CITA, A.HORA_INICIO, A.HORA_FIN, A.ID_DOCTOR, A.NOMBRE_DOCTOR, A.ID_PACIENTE, A.NOMBRE_PACIENTE, A.ID_ESPECIALIDAD, A.ESPECIALIDAD, A.ID_CONSULTORIO, A.CONSULTORIO, A.ESTADO_CITA, A.REPROGRAMACIONES, A.ASISTENCIA_REGISTRADA, A.MONTO_TOTAL FROM VW_AGENDA_CITAS A JOIN DOCTOR D ON D.ID_DOCTOR = A.ID_DOCTOR
                WHERE A.FECHA_CITA = ?
                ORDER BY A.HORA_INICIO, A.ID_CITA
                """,
                fecha);
    }

    public CitaResponseDTO detalleCitaGeneral(long idCita) {
        return jdbc.one(
                CitaResponseDTO.class,
                """
                SELECT A.ID_CITA, A.FECHA_CITA, A.HORA_INICIO, A.HORA_FIN, A.ID_DOCTOR, A.NOMBRE_DOCTOR, A.ID_PACIENTE, A.NOMBRE_PACIENTE, A.ID_ESPECIALIDAD, A.ESPECIALIDAD, A.ID_CONSULTORIO, A.CONSULTORIO, A.ESTADO_CITA, A.REPROGRAMACIONES, A.ASISTENCIA_REGISTRADA, A.MONTO_TOTAL FROM VW_AGENDA_CITAS A JOIN DOCTOR D ON D.ID_DOCTOR = A.ID_DOCTOR
                WHERE A.ID_CITA = ?
                """,
                idCita);
    }

    public void cancelarReprogramada(long actor, long usuario, Long idCita, String motivo) {
        jdbc.call("SP_CANCELAR_REPROGRAMADA", actor, usuario, idCita, motivo);
    }
}

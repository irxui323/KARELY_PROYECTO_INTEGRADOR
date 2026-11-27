package pe.edu.karely.repository.atencion;

import org.springframework.stereotype.Repository;

import pe.edu.karely.dto.atencion.AtencionResponseDTO;
import pe.edu.karely.dto.atencion.DetalleAtencionResponseDTO;
import pe.edu.karely.dto.atencion.MedicamentoDetalleDTO;
import pe.edu.karely.dto.atencion.ReciboResponseDTO;
import pe.edu.karely.repository.OracleJdbc;

import java.util.Arrays;
import java.util.List;

@Repository
public class AtencionMedicaRepository {
    private final OracleJdbc jdbc;

    public AtencionMedicaRepository(OracleJdbc jdbc) {
        this.jdbc = jdbc;
    }

    public List<AtencionResponseDTO> listarAtencionesDelMedico(long usuario) {
        return jdbc.list(
                AtencionResponseDTO.class,
                "SELECT"
                    + " A.ID_ATENCION,A.ID_CITA,A.ID_DOCTOR,A.FECHA_INICIO,A.FECHA_CIERRE,A.ESTADO,R.ID_RECETA,R.INDICACIONES"
                    + " AS INDICACIONES_RECETA FROM ATENCION_MEDICA A LEFT JOIN RECETA R ON"
                    + " R.ID_ATENCION=A.ID_ATENCION JOIN DOCTOR D ON D.ID_DOCTOR=A.ID_DOCTOR WHERE"
                    + " D.ID_USUARIO=? ORDER BY A.FECHA_INICIO DESC FETCH FIRST 150 ROWS ONLY",
                usuario);
    }

    public List<AtencionResponseDTO> listarAtencionesGeneral() {
        return jdbc.list(
                AtencionResponseDTO.class,
                "SELECT"
                    + " A.ID_ATENCION,A.ID_CITA,A.ID_DOCTOR,A.FECHA_INICIO,A.FECHA_CIERRE,A.ESTADO,R.ID_RECETA,R.INDICACIONES"
                    + " AS INDICACIONES_RECETA FROM ATENCION_MEDICA A LEFT JOIN RECETA R ON"
                    + " R.ID_ATENCION=A.ID_ATENCION ORDER BY A.FECHA_INICIO DESC FETCH FIRST 150"
                    + " ROWS ONLY");
    }

    public DetalleAtencionResponseDTO buscarDetalleCerrada(long idCita, long actor, String rol) {
        var cabecera =
                jdbc.one(
                        DetalleAtencionCabecera.class,
                        "SELECT C.ID_CITA, P.NOMBRES||' '||P.APELLIDOS AS PACIENTE,"
                            + " D.NOMBRES||' '||D.APELLIDOS AS DOCTOR, E.NOMBRE AS ESPECIALIDAD,"
                            + " C.FECHA_CITA, F.HORA_INICIO, C.ESTADO AS ESTADO_CITA,"
                            + " A.DIAGNOSTICO, A.OBSERVACIONES, R.ID_RECETA, R.INDICACIONES AS INDICACIONES_RECETA,"
                            + " RH.NUMERO_RECIBO, RH.MEDIO_ENTREGA"
                            + " FROM ATENCION_MEDICA A JOIN CITA C ON C.ID_CITA=A.ID_CITA"
                            + " JOIN PACIENTE P ON P.ID_PACIENTE=C.ID_PACIENTE"
                            + " JOIN DOCTOR D ON D.ID_DOCTOR=C.ID_DOCTOR"
                            + " JOIN ESPECIALIDAD E ON E.ID_ESPECIALIDAD=C.ID_ESPECIALIDAD"
                            + " JOIN FRANJA_HORARIA F ON F.ID_FRANJA=C.ID_FRANJA"
                            + " LEFT JOIN RECETA R ON R.ID_ATENCION=A.ID_ATENCION"
                            + " LEFT JOIN RECIBO_HONORARIO RH ON RH.ID_CITA=C.ID_CITA"
                            + " WHERE C.ID_CITA=? AND A.ESTADO='CERRADA' AND C.ESTADO='ATENDIDA'"
                            + " AND (D.ID_USUARIO=? OR ? IN ('ADMINISTRADORA','RECEPCIONISTA'))",
                        idCita,
                        actor,
                        rol);
        if (cabecera == null) return null;
        var medicamentos =
                cabecera.idReceta() == null
                        ? List.<MedicamentoDetalleDTO>of()
                        : jdbc.list(
                                MedicamentoDetalleDTO.class,
                                "SELECT MEDICAMENTO,DOSIS,FRECUENCIA,DURACION,OBSERVACIONES"
                                    + " FROM RECETA_DETALLE WHERE ID_RECETA=? ORDER BY ID_DETALLE",
                                cabecera.idReceta());
        return new DetalleAtencionResponseDTO(
                cabecera.idCita(),
                cabecera.paciente(),
                cabecera.doctor(),
                cabecera.especialidad(),
                cabecera.fechaCita(),
                cabecera.horaInicio(),
                cabecera.estadoCita(),
                cabecera.diagnostico(),
                cabecera.observaciones(),
                cabecera.indicacionesReceta(),
                medicamentos,
                cabecera.numeroRecibo(),
                cabecera.medioEntrega());
    }

    private record DetalleAtencionCabecera(
            Long idCita,
            String paciente,
            String doctor,
            String especialidad,
            java.time.LocalDate fechaCita,
            String horaInicio,
            String estadoCita,
            String diagnostico,
            String observaciones,
            Long idReceta,
            String indicacionesReceta,
            String numeroRecibo,
            String medioEntrega) {}

    public Long iniciarAtencion(long actor, long usuario, Long idCita) {
        return jdbc.callId("SP_INICIAR_ATENCION", actor, usuario, idCita, OracleJdbc.outNumber());
    }

    public void registrarDiagnostico(
            long actor, long usuario, Long idCita, String diagnostico, String observaciones) {
        jdbc.call("SP_REGISTRAR_DIAGNOSTICO", actor, usuario, idCita, diagnostico, observaciones);
    }

    public Long registrarReceta(long actor, long usuario, Long idCita, String indicaciones) {
        return jdbc.callId(
                "SP_CREAR_RECETA", actor, usuario, idCita, indicaciones, OracleJdbc.outNumber());
    }

    public Long agregarMedicamento(
            long actor,
            long usuario,
            Long idReceta,
            String medicamento,
            String dosis,
            String frecuencia,
            String duracion,
            String observaciones) {
        return jdbc.callId(
                "SP_AGREGAR_MEDICAMENTO",
                actor,
                usuario,
                idReceta,
                medicamento,
                dosis,
                frecuencia,
                duracion,
                OracleJdbc.outNumber(),
                observaciones);
    }

    public Long emitirRecibo(long actor, long usuario, Long idCita, String numeroRecibo) {
        return jdbc.callId(
                "SP_EMITIR_RECIBO", actor, usuario, idCita, numeroRecibo, OracleJdbc.outNumber());
    }

    public void entregarRecibo(long actor, long usuario, Long idCita, String medioEntrega) {
        jdbc.call("SP_ENTREGAR_RECIBO", actor, usuario, idCita, medioEntrega);
    }

    public void cerrarAtencion(long actor, long usuario, Long idCita) {
        jdbc.call("SP_CERRAR_ATENCION", actor, usuario, idCita);
    }

    public record CitaRecibo(Long idCita) {}

    public CitaRecibo bloquearCitaParaRecibo(long idCita, long actor, String rol) {
        return jdbc.one(
                CitaRecibo.class,
                "SELECT C.ID_CITA FROM CITA C JOIN DOCTOR D ON D.ID_DOCTOR=C.ID_DOCTOR"
                        + " WHERE C.ID_CITA=? AND (D.ID_USUARIO=? OR ?='ADMINISTRADORA')"
                        + " FOR UPDATE OF C.ID_CITA",
                idCita,
                actor,
                rol);
    }

    public ReciboResponseDTO buscarRecibo(long idCita) {
        return jdbc.one(
                ReciboResponseDTO.class,
                "SELECT R.ID_RECIBO,R.ID_CITA,R.NUMERO_RECIBO,R.MONTO,R.FECHA_EMISION, P.NOMBRES||'"
                    + " '||P.APELLIDOS AS PACIENTE,P.NUMERO_DOCUMENTO AS DOCUMENTO,"
                    + " P.CORREO,D.NOMBRES||' '||D.APELLIDOS AS DOCTOR,E.NOMBRE AS ESPECIALIDAD,"
                    + " C.FECHA_CITA,F.HORA_INICIO,PC.METODO_PAGO,R.FECHA_ENTREGA,R.MEDIO_ENTREGA"
                    + " FROM RECIBO_HONORARIO R JOIN CITA C ON C.ID_CITA=R.ID_CITA JOIN PACIENTE P"
                    + " ON P.ID_PACIENTE=C.ID_PACIENTE JOIN DOCTOR D ON D.ID_DOCTOR=C.ID_DOCTOR"
                    + " JOIN ESPECIALIDAD E ON E.ID_ESPECIALIDAD=C.ID_ESPECIALIDAD JOIN"
                    + " FRANJA_HORARIA F ON F.ID_FRANJA=C.ID_FRANJA JOIN PAGO_CITA PC ON"
                    + " PC.ID_PAGO=C.ID_PAGO WHERE R.ID_CITA=?",
                idCita);
    }

    public record ArchivoRecibo(byte[] archivoPdf) {
        @Override
        public boolean equals(Object objeto) {
            return objeto instanceof ArchivoRecibo otro
                    && Arrays.equals(archivoPdf, otro.archivoPdf);
        }

        @Override
        public int hashCode() {
            return Arrays.hashCode(archivoPdf);
        }

        @Override
        public String toString() {
            return "ArchivoRecibo[archivoPdf=" + Arrays.toString(archivoPdf) + "]";
        }
    }

    public byte[] buscarPdf(long idCita) {
        var archivo =
                jdbc.one(
                        ArchivoRecibo.class,
                        "SELECT ARCHIVO_PDF FROM RECIBO_HONORARIO WHERE ID_CITA=?",
                        idCita);
        return archivo == null ? null : archivo.archivoPdf();
    }

    public void guardarPdf(long idCita, byte[] pdf) {
        jdbc.update(
                "UPDATE RECIBO_HONORARIO SET ARCHIVO_PDF=? WHERE ID_CITA=? AND ARCHIVO_PDF IS NULL",
                pdf,
                idCita);
    }

    public void guardarCorreoRecibo(long idCita, String correo) {
        jdbc.update("UPDATE RECIBO_HONORARIO SET CORREO_ENVIO=? WHERE ID_CITA=?", correo, idCita);
    }
}

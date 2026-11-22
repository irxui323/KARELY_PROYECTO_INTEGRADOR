package pe.edu.karely.repository;

import org.springframework.stereotype.Repository;

import pe.edu.karely.dto.atencion.AtencionResponseDTO;

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
}

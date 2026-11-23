package pe.edu.karely.repository.administracion;

import pe.edu.karely.repository.OracleJdbc;

import org.springframework.stereotype.Repository;

import pe.edu.karely.dto.administracion.NotificacionEnvioDTO;
import pe.edu.karely.dto.administracion.NotificacionResponseDTO;

import java.util.List;

@Repository
public class NotificacionRepository {
    private final OracleJdbc jdbc;

    public NotificacionRepository(OracleJdbc jdbc) {
        this.jdbc = jdbc;
    }

    public List<NotificacionResponseDTO> listarNotificaciones() {
        return jdbc.list(
                NotificacionResponseDTO.class,
                "SELECT ID_NOTIFICACION, CODIGO_EVENTO, TIPO, CANAL, ESTADO, INTENTOS,"
                    + " FECHA_CREACION, FECHA_PROXIMO_INTENTO, FECHA_ENVIO, ID_CITA, ID_LIQUIDACION"
                    + " FROM VW_CONTROL_NOTIFICACIONES FETCH FIRST 200 ROWS ONLY");
    }

    public Long encolarNotificacion(long actor, long usuario, Long idCita, String tipo) {
        return jdbc.callId(
                "SP_ENCOLAR_NOTIFICACION_CITA",
                actor,
                usuario,
                idCita,
                tipo,
                OracleJdbc.outNumber());
    }

    public NotificacionEnvioDTO reclamar(long operador) {
        var valores =
                jdbc.call(
                        "SP_TOMAR_NOTIFICACION",
                        operador,
                        operador,
                        OracleJdbc.outNumber(),
                        OracleJdbc.outText(),
                        OracleJdbc.outText(),
                        OracleJdbc.outText(),
                        OracleJdbc.outNumber());
        Number id = (Number) valores.get(0);
        Number intento = (Number) valores.get(4);
        return new NotificacionEnvioDTO(
                id == null ? null : id.longValue(),
                (String) valores.get(1),
                (String) valores.get(2),
                (String) valores.get(3),
                intento == null ? null : intento.intValue());
    }

    public void registrarResultado(
            long operador, long id, int intento, String exito, String detalle) {
        jdbc.call("SP_REGISTRAR_RESULTADO_ENVIO", operador, operador, id, intento, exito, detalle);
    }
}

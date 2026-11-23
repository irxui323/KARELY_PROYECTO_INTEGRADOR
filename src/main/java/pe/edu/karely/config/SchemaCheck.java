package pe.edu.karely.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Configuration
public class SchemaCheck {
    private static final Map<String, Set<String>> OBJETOS =
            Map.of(
                    "TABLE",
                            Set.of(
                                    "ROL",
                                    "USUARIO",
                                    "SESION_USUARIO",
                                    "AUDITORIA",
                                    "DOCTOR",
                                    "DOCUMENTO_DOCTOR",
                                    "ESPECIALIDAD",
                                    "DOCTOR_ESPECIALIDAD",
                                    "PACIENTE",
                                    "CONSULTORIO",
                                    "FRANJA_HORARIA",
                                    "DISPONIBILIDAD_DOCTOR",
                                    "PRE_RESERVA_CITA",
                                    "PAGO_CITA",
                                    "CITA",
                                    "REPROGRAMACION_CITA",
                                    "ASISTENCIA",
                                    "ATENCION_MEDICA",
                                    "RECETA",
                                    "RECETA_DETALLE",
                                    "RECIBO_HONORARIO",
                                    "LIQUIDACION",
                                    "PARAMETRO_SISTEMA",
                                    "NOTIFICACION_SALIENTE",
                                    "TOKEN_RECUPERACION"),
                    "PROCEDURE",
                            Set.of(
                                    "SP_VALIDAR_DOCUMENTACION",
                                    "SP_REGISTRAR_DISPONIBILIDAD",
                                    "SP_PRE_RESERVAR_CITA",
                                    "SP_CONFIRMAR_CITA_PAGADA",
                                    "SP_EXPIRAR_PRE_RESERVAS",
                                    "SP_REPROGRAMAR_CITA",
                                    "SP_REGISTRAR_ASISTENCIA",
                                    "SP_INICIAR_ATENCION",
                                    "SP_REGISTRAR_DIAGNOSTICO",
                                    "SP_CREAR_RECETA",
                                    "SP_AGREGAR_MEDICAMENTO",
                                    "SP_EMITIR_RECIBO",
                                    "SP_ENTREGAR_RECIBO",
                                    "SP_CERRAR_ATENCION",
                                    "SP_PAGAR_DOCTOR",
                                    "SP_GENERAR_LIQUIDACION",
                                    "SP_CANCELAR_REPROGRAMADA",
                                    "SP_CREAR_USUARIO",
                                    "SP_CAMBIAR_ROL_USUARIO",
                                    "SP_CAMBIAR_ESTADO_USUARIO",
                                    "SP_CAMBIAR_PARAMETRO",
                                    "SP_CERRAR_SESION",
                                    "SP_EXPIRAR_SESIONES",
                                    "SP_ENCOLAR_NOTIFICACION_CITA",
                                    "SP_TOMAR_NOTIFICACION",
                                    "SP_REGISTRAR_RESULTADO_ENVIO",
                                    "SP_MARCAR_CITAS_PERDIDAS",
                                    "SP_TAREA_MANTENIMIENTO"),
                    "FUNCTION",
                            Set.of(
                                    "FN_MONTO_DOCTOR",
                                    "FN_DOCUMENTACION_COMPLETA",
                                    "FN_INICIO_TURNO",
                                    "FN_ROL_USUARIO",
                                    "FN_SALDO_DOCTOR",
                                    "FN_SALDO_LIQUIDACION"),
                    "TRIGGER",
                            Set.of(
                                    "TR_NO_EDITAR_LIQUIDACION",
                                    "TR_NO_EDITAR_PAGO_APROBADO",
                                    "TR_AUD_PAGO_CITA",
                                    "TR_VALIDAR_PAGO_CITA",
                                    "TR_AUD_PARAMETRO",
                                    "TR_AUD_LIQUIDACION",
                                    "TR_DOCUMENTO_REVALIDACION",
                                    "TR_DOCTOR_ESTADO_VALIDADO"),
                    "VIEW",
                            Set.of(
                                    "VW_AGENDA_CITAS",
                                    "VW_RESUMEN_CITAS_DIARIAS",
                                    "VW_SALDOS_LIQUIDACIONES",
                                    "VW_INGRESOS_GESTORA",
                                    "VW_PAGOS_CITA",
                                    "VW_CONTROL_NOTIFICACIONES"));

    @Bean
    @Order(1)
    ApplicationRunner validarEsquema(JdbcTemplate jdbc) {
        return args -> {
            for (var grupo : OBJETOS.entrySet()) {
                List<String> presentes =
                        jdbc.queryForList(
                                """
                                SELECT OBJECT_NAME
                                FROM USER_OBJECTS
                                WHERE OBJECT_TYPE = ? AND STATUS = 'VALID'
                                """,
                                String.class,
                                grupo.getKey());
                Set<String> faltantes = new HashSet<>(grupo.getValue());
                faltantes.removeAll(presentes);
                if (!faltantes.isEmpty()) {
                    throw new IllegalStateException(
                            "Objetos faltantes o invÃ¡lidos en el esquema Oracle ("
                                    + grupo.getKey()
                                    + "): "
                                    + String.join(", ", faltantes.stream().sorted().toList()));
                }
            }
        };
    }
}

# Contrato API → objetos de KARELY_BD2

El backend no ejecuta la DDL del esquema ni recrea las particiones. Se conecta a la instancia Oracle ya preparada por el usuario, con 29 tablas y los pasos 14–25 instalados.

| Endpoint REST actual | PL/SQL Oracle |
|---|---|
| `POST /api/v1/doctores/{id}/validar-documentacion` | `SP_VALIDAR_DOCUMENTACION` |
| `POST /api/v1/doctores/{id}/disponibilidades` | `SP_REGISTRAR_DISPONIBILIDAD` |
| `POST /api/v1/citas/reservas` | `SP_PRE_RESERVAR_CITA` |
| `POST /api/v1/citas/confirmar` | `SP_CONFIRMAR_CITA_PAGADA` |
| `POST /api/v1/citas/{id}/reprogramar` | `SP_REPROGRAMAR_CITA` |
| `POST /api/v1/citas/{id}/asistencia` | `SP_REGISTRAR_ASISTENCIA` |
| `POST /api/v1/atenciones/iniciar` | `SP_INICIAR_ATENCION` |
| `POST /api/v1/atenciones/{idCita}/diagnostico` | `SP_REGISTRAR_DIAGNOSTICO` |
| `POST /api/v1/atenciones/{idCita}/receta` | `SP_CREAR_RECETA` |
| `POST /api/v1/atenciones/recetas/{idReceta}/medicamentos` | `SP_AGREGAR_MEDICAMENTO` |
| `POST /api/v1/atenciones/{idCita}/recibo` | `SP_EMITIR_RECIBO` |
| `POST /api/v1/atenciones/{idCita}/entrega` | `SP_ENTREGAR_RECIBO` |
| `POST /api/v1/atenciones/{idCita}/cerrar` | `SP_CERRAR_ATENCION` |
| `POST /api/v1/liquidaciones` | `SP_PAGAR_DOCTOR` |
| `POST /api/v1/citas/{id}/cancelar` | `SP_CANCELAR_REPROGRAMADA` |
| `PATCH /api/v1/usuarios/{id}/rol` | `SP_CAMBIAR_ROL_USUARIO` |
| `PATCH /api/v1/usuarios/{id}/estado` | `SP_CAMBIAR_ESTADO_USUARIO` |
| `PUT /api/v1/parametros/{nombre}` | `SP_CAMBIAR_PARAMETRO` |
| `POST /api/v1/notificaciones` | `SP_ENCOLAR_NOTIFICACION_CITA` |

Los procedimientos exigen `CLIENT_IDENTIFIER`. `OracleJdbc.call(...)` establece el ID autenticado en la misma conexión de la transacción y lo limpia en un bloque `finally`.

Las altas sencillas de pacientes, doctores y catálogos operan directamente con `INSERT ... RETURNING`, usando parámetros JDBC. Las vistas del paso 23 sirven reportes y listados.

`SP_CONFIRMAR_CITA_PAGADA` registra un pago marcado aprobado; solo debe llamarse cuando la verificación de la caja o pasarela externa haya terminado satisfactoriamente. Esta API **no verifica pagos reales** por sí misma.

`NOTIFICACION_SALIENTE` guarda una cola, no envía email. Un componente de backend con proveedor de correo externo todavía debe implementarse para envíos reales.

## Correo SMTP opcional

`MailQueueWorker` consume la cola Oracle mediante `SP_TOMAR_NOTIFICACION`, hace commit de la toma, envía por SMTP y registra el resultado con `SP_REGISTRAR_RESULTADO_ENVIO` en otra transacción. Está deshabilitado de forma predeterminada (`APP_MAIL_ENABLED=false`); solo funciona al configurar operador con rol `ADMINISTRADORA`, `APP_MAIL_FROM`, `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD` y el servidor SMTP.

El envío es **al menos una vez**, no exactamente una vez: si se pierde la conexión tras aceptación de SMTP podría duplicarse un correo; el código de evento permite deduplicación donde el proveedor lo admita. No se incorporan diagnósticos ni datos clínicos en los mensajes.

# Recibos de atención

## Activación

1. Conectar SQL Developer con el propietario del esquema de Karely.
2. Ejecutar con F5 `db/migraciones/2026-11-23-recibo-pdf.sql` antes de usar las nuevas acciones.
3. Verificar que aparecen las columnas ARCHIVO_PDF (BLOB) y CORREO_ENVIO (VARCHAR2). La migración agrega solo columnas ausentes y puede repetirse. Oracle confirma DDL automáticamente; guardar un respaldo antes de aplicar cambios de esquema.
4. Reiniciar backend y frontend. Maven descargará PDFBox 3.0.8 al compilar por primera vez.
5. Para correo, utilizar la misma cuenta SMTP configurada para recuperación. Con Gmail, el script existente admite `-CorreoGmail`; no usar la contraseña normal de Google. El remitente se obtiene de app.recovery.from, con fallback a app.mail.from.

La migración se entrega para ejecución manual; no fue aplicada automáticamente sobre Oracle por el asistente.

## Flujo

- Seleccionar la cita habilitada e iniciar la atención según las reglas existentes.
- Emitir recibo: se genera `REC-` seguido del ID de cita con un mínimo de diez posiciones. Es un identificador interno único por cita, no una numeración fiscal ni un correlativo independiente.
- Se ejecuta SP_EMITIR_RECIBO con ese número automático; se conservan sus validaciones y auditoría. La restricción única y el bloqueo de la cita evitan emisiones paralelas duplicadas. Si ya existe un recibo, se devuelve ese mismo registro.
- Se genera el PDF con el logo y se guarda como BLOB en la misma transacción. El PDF conservado es el documento original; su descarga no lo regenera cuando ya está guardado. Para recibos antiguos sin archivo se genera en la primera descarga con los datos disponibles en ese momento.
- Descargar PDF permite guardarlo o abrirlo desde el equipo.
- Enviar PDF por correo usa el correo actual registrado del paciente y adjunta el documento almacenado. El destinatario no se acepta desde el navegador. Solo tras aceptar el envío SMTP se puede confirmar la transacción de entrega; si falla, se revierte la operación y puede reintentarse.
- Entrega impresa: descargar, entregar físicamente y pulsar Confirmar entrega impresa.
- Cerrar atención conserva SP_CERRAR_ATENCION y sus requisitos originales. El frontend requiere además entrega registrada para habilitar ese botón.

La aceptación SMTP no garantiza llegada a la bandeja principal: el proveedor puede retrasar, rechazar posteriormente o clasificar como spam. SMTP y Oracle no comparten una transacción distribuida: un corte después de aceptar el correo y antes de confirmar Oracle puede requerir comprobar la entrega antes de reintentar. No se promete envío exactamente una vez frente a ese caso.

## Capas y archivos

- `controller/atencion/AtencionMedicaController`: mantiene las acciones existentes y añade consulta/descarga.
- `service/service/atencion/AtencionMedicaService`: contratos de consulta y descarga.
- `service/impl/atencion/AtencionMedicaServiceImpl`: permisos, emisión automática y entrega.
- `service/impl/atencion/ReciboPdf`: generación del documento con PDFBox.
- `repository/atencion/AtencionMedicaRepository`: consultas, bloqueo por cita y almacenamiento de PDF/destinatario.
- `dto/atencion/ReciboResponseDTO`: datos del recibo.
- `features/atencion/services/atencion-service.ts`: llamadas HTTP.
- `features/atencion/pages/atencion-form`: resumen, descarga, entrega y cierre, manteniendo espaciado entre bloques.

Se reutiliza la configuración JavaMailSender/SMTP. No se invoca la lógica de recuperación de contraseña para enviar recibos.

## Endpoints

| Método | Ruta | Resultado |
| --- | --- | --- |
| POST | /api/v1/atenciones/{idCita}/recibo | Emite o recupera el recibo; admite cuerpo vacío o `{}` |
| GET | /api/v1/atenciones/{idCita}/recibo | Metadatos; 204 si todavía no se emitió |
| GET | /api/v1/atenciones/{idCita}/recibo/pdf | PDF adjunto, Cache-Control: no-store |
| POST | /api/v1/atenciones/{idCita}/entrega | `{ "medioEntrega": "EMAIL" }` o `PRESENCIAL` |

Las acciones requieren autenticación. Solo el doctor asignado o la administradora pueden acceder al recibo. Las solicitudes de escritura también conservan la protección CSRF configurada.

## Pruebas y límites

ReciboFlujoTest cubre emisión automática, repetición, permisos, entrega impresa, destino ausente, MIME con PDF adjunto y rollback con reintento de entrega ante fallo SMTP. ReciboRepositoryTest prueba las consultas, mapeo y persistencia BLOB en H2 compatible con Oracle. ReciboHttpTest comprueba emisión sin número, descarga y validación de medio. ReciboPdfTest abre y extrae el PDF generado y comprueba logo y contenido.

El envío de pruebas utiliza un servidor de correo simulado y no envía mensajes reales. La migración y los procedimientos deben verificarse finalmente en el Oracle del usuario. El documento es un recibo interno, no un comprobante tributario electrónico.

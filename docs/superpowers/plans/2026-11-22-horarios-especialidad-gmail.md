# Horarios por especialidad y Gmail

Conservar arquitectura y controllers. DISPONIBILIDAD_DOCTOR necesita ID_ESPECIALIDAD; preparar migración incremental sin ejecutarla. Clasificar automáticamente solo doctores con una especialidad; las disponibilidades ambiguas quedan con especialidad nula y no se ofrecen en reservas. Un registro pendiente puede clasificarse al registrar su misma fecha/franja con especialidad. Mantener IDs y estado de citas históricas.

Modificar SP_REGISTRAR_DISPONIBILIDAD para recibir especialidad asignada/activa y preservar bloqueo del doctor y comprobación global de solapamiento. Excluir del solapamiento únicamente la misma fila pendiente al clasificar. Registrar/reactivar sin duplicar. Exigir especialidad coincidente en pre-reserva, confirmación y reprogramación. Actualizar entidad, DTO, repositorio, formularios y consultas de disponibilidad/calendario.

Correo: usuario confirmó que solo escribió su dirección, sin configurar remitente. Añadir -CorreoGmail al script para pedir dirección remitente y contraseña de aplicación mediante entrada segura. Activar recuperación y configurar SMTP Gmail en la misma sesión, limpiar variables al salir y mostrar estado sin secretos. No enviar mensajes ni probar credenciales reales sin configuración del usuario. Documentar diferencia entre correo de doctor y USUARIO.

Verificar DTOs/permisos, filtrado de especialidad, solapamiento en SQL y consultas H2, formularios, reserva y calendario, suites completas, compilación y sintaxis PowerShell. Sin comentarios nuevos ni ejecución DDL en Oracle.

## Resultado

Preparada db/migraciones/2026-11-22-disponibilidad-especialidad.sql, sin ejecutarla. Se añadió relación opcional para conservar filas antiguas pendientes; el contrato de alta exige especialidad. Ambos formularios cargan las especialidades asignadas activas, la tabla muestra la especialidad y permite clasificar filas antiguas. Reservas/calendario consultan exclusivamente la especialidad de cada disponibilidad. Pre-reserva, confirmación y reprogramación vuelven a comprobarla en Oracle.

La migración conserva restricción única y bloqueo de doctor. El control global de solapamiento funciona con cualquier especialidad, y solo permite actualizar en su sitio la fila pendiente de la misma franja. Las citas y reservas inequívocas existentes se usan para conservar su clasificación. Los datos de prueba nuevos asignan la agenda de Ana a Medicina general, sin duplicarla para Dermatología.

Correo: usuario confirmó ausencia de configuración del remitente. Opción -CorreoGmail añadida; solicita remitente y contraseña de aplicación por entrada segura, activa configuración en el proceso y restaura variables previas al terminar. Arranque informa si recuperación está desactivada y rechaza configuración incompleta cuando está activada. No se pidieron credenciales por chat, no se conectó a Gmail ni se enviaron correos reales. Guía actualizada con requisitos de Google y correspondencia USUARIO.CORREO.

Verificación final: 101 pruebas backend y 79 Angular +39 Node aprobadas, Maven verify y compilación Angular de producción completados. SQL de filtros y solapamientos probado con H2, no con Oracle. La sintaxis del script PowerShell pasó el parser. Migración revisada por sus cuatro procedimientos y conservación de datos; necesita aplicación manual y comprobar compilación en SQL Developer. No se hizo revisión visual real porque el navegador local no estaba disponible en este chat.

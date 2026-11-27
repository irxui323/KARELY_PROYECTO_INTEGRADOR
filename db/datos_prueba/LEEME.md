# Datos de prueba Karely

La versión actual de estos datos requiere aplicar primero la migración
`db/migraciones/2026-11-22-disponibilidad-especialidad.sql`. La agenda de TEST Ana
se asigna a TEST Medicina general; tener también Dermatología no duplica los
turnos. Si ya cargaste los datos, no ejecutes esta carga de nuevo: aplica solo
la migración y clasifica los horarios pendientes desde la aplicación.

Conectar en SQL Developer como **KARELY_BD2**, servicio **ORCL**. Ejecutar cada archivo con **F5**, en orden, y revisar la salida antes de continuar:

1. `01_datos_base.sql`
2. `02_escenarios.sql` (opcional: escenarios preparados de citas y finanzas).
3. `03_verificar.sql` (solo consultas).

Los dos primeros hacen COMMIT al terminar y ROLLBACK si falla su bloque. No ejecutan DDL, no reinician identidades, no desactivan triggers y no actualizan cuentas existentes. Rechazan una segunda carga si encuentran sus marcadores. No volver a ejecutar los instaladores 00 a 08. No necesitan una base vacía, pero sí los objetos originales instalados y los documentos reservados libres. Los roles existentes deben estar activos; los parámetros existentes se conservan. Se requieren franjas activas de una hora entre 08:00 y 18:00. Usar una base de desarrollo: son registros ficticios persistentes, incluidos pagos inmutables.

Para arrancar el backend actual también debe estar aplicada la migración de recuperación de contraseña, descrita en `docs/RECUPERACION_PASSWORD.md`. Estos scripts no la ejecutan.

## Cuentas

Todas las cuentas nuevas usan **KarelyTest2026!**. En Oracle se guarda un hash BCrypt generado y comprobado con la biblioteca del backend.

| Usuario | Rol / caso |
|---|---|
| test.admin | ADMINISTRADORA |
| test.recepcion | RECEPCIONISTA |
| test.caja | CAJERA |
| test.tesoreria | TESORERA |
| test.doctor | DOCTOR, vinculado a TEST Ana |
| test.inactivo | INACTIVO: debe impedir login |
| test.bloqueado | BLOQUEADO, cinco intentos: debe impedir login |

Los correos terminan en `@example.com` y no reciben mensajes. Para probar recuperación, editar desde Administración el correo de **una cuenta TEST** y poner una dirección propia de Gmail u Outlook; configurar primero el remitente SMTP. Mantener `APP_MAIL_ENABLED=false` mientras se prueban los escenarios ficticios. No se precargan tokens ni sesiones, y no se envían correos desde SQL.

## Doctores y documentos

| DNI | Estado inicial y prueba |
|---|---|
| 99000001 | TEST Ana: habilitada, DNI y título validados, cuenta test.doctor, dos especialidades y agenda de hoy a hoy +14 días |
| 99000002 | TEST Luis: DNI y título pendientes y especialidad asignada; revisar ambos manualmente y generar su cuenta desde la aplicación |
| 99000003 | TEST Maria: sin documentos ni especialidad; probar el flujo completo y el rechazo por documentación incompleta |
| 99000004 | TEST Pedro: documentos rechazados; subir reemplazos y revisar nuevamente |

Se incluyen seis PDF válidos, identificados visiblemente como **TEST FICTICIO**, también almacenados como BLOB. Sirven para probar descarga, visualización y selección manual; no prueban autenticidad profesional. El estado aprobado de TEST Ana es una preparación del escenario, no una validación automática del sistema. Para probar subir archivos, los PDF están junto a estos scripts. Tras subir un reemplazo, corresponde revisar nuevamente los documentos más recientes.

Se crean tres especialidades TEST con precios 100, 150 y 120; dos consultorios TEST; seis pacientes (99100001 a 99100006), el último inactivo. El primer script no crea citas: permite probar registro, asignación de especialidad, documentación, creación de cuenta, agenda y reservas desde cero.

## Escenarios del segundo script

El segundo script inserta fixtures directamente para abrir pantallas en diferentes estados. No demuestra que el flujo de procedimientos o API funcione de principio a fin. Las fechas son relativas al día de ejecución; las horas son fijas. Si se prueba asistencia fuera de la ventana admitida, el rechazo horario es esperado. La disponibilidad precargada termina a los 14 días: para fechas posteriores registrarla desde la aplicación.

| Referencia de pago | Escenario |
|---|---|
| TEST-SEED-1 | Ayer, ATENDIDA: diagnóstico, receta, detalle, recibo entregado y devengos |
| TEST-SEED-2 | Hoy, EN_ATENCION: completar diagnóstico, receta, recibo y cierre con test.doctor |
| TEST-SEED-3 | Mañana, PROGRAMADA: consultar y reprogramar desde recepción |
| TEST-SEED-4 | Pasado mañana, PROGRAMADA: consultar pago y comprobante |
| TEST-SEED-5 | Hoy +3, PROGRAMADA: otra cita para pruebas |

Cada cita tiene un cobro ficticio aprobado de 100. La primera usa las comisiones actuales mediante FN_MONTO_DOCTOR; con los valores iniciales 60/40 genera 60 para el doctor y 40 para la gestora. Se carga un pago parcial de 30 (la mitad del devengo calculado), quedando 30 de saldo inicial. Si las comisiones son otras, los importes cambian. Si el devengo es cero, no se inserta pago de liquidación.

Los cobros, liquidaciones y documentos de esta carga no representan pagos ni documentos reales. No se insertan notificaciones pendientes. No se proporciona limpieza automática porque los triggers impiden borrar pagos aprobados y liquidaciones. No desactivar esos controles para limpiar.

## Lista de pruebas manuales

1. Entrar con cada rol y verificar sus permisos; comprobar que inactivo y bloqueado no entren.
2. Desde administración, revisar TEST Luis, abrir ambos PDF, aprobar manualmente y generar cuenta. Comprobar que TEST Maria no pueda habilitarse sin requisitos.
3. Asignar una especialidad a TEST Maria; repetir la misma asignación y comprobar un error comprensible sin duplicados.
4. Crear un paciente nuevo y probar documento duplicado e inactividad.
5. Desde recepción, reservar un turno libre futuro de TEST Ana. Desde caja, registrar el pago ficticio por el flujo normal. Comprobar que no se permita ocupar el mismo turno dos veces.
6. Probar asistencia dentro de los 30 minutos anteriores al inicio de una cita adecuada; fuera de esa ventana debe rechazarse.
7. Con test.doctor, completar la atención abierta de hoy; probar cierre sin diagnóstico/receta/recibo y después completar requisitos.
8. Con test.tesoreria, consultar el saldo y pagar como máximo lo pendiente. Comprobar que se rechace un pago mayor al saldo.
9. Revisar finanzas y auditoría. Contrastar importes con las consultas del tercer script.
10. Probar recuperación con correo propio: enlace válido, segundo uso rechazado, vencimiento y login con la nueva clave. La recuperación se prueba mediante la aplicación, nunca insertando tokens desde SQL.

## Alcance de la verificación

Se contrastaron columnas, restricciones y triggers con los scripts Oracle suministrados; se comprobó el hash con BCrypt y la estructura de los PDF. No se ha ejecutado esta carga en Oracle ni se certifican esas pruebas manuales como realizadas. Conservar la salida de SQL Developer si aparece un error.

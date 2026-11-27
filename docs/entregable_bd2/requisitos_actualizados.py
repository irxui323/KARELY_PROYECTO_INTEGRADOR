"""Ampliación documental basada en el modelo vigente, sin ejecutar SQL."""

actores={
 'Doctores':'Administradora; doctor en funciones propias',
 'Citas':'Administradora o recepcionista',
 'Pacientes':'Administración o recepción para filiación; doctor para clínica',
 'Finanzas':'Administradora o tesorero; doctor para recibo',
 'Recepción y seguridad':'Administradora; recepción o usuario según operación',
 'Todos':'Propietario o perfil autorizado según objeto'}
actores_especificos={
 'RF02':'Administradora','RF08':'Administradora o recepcionista',
 'RF09':'Doctor asignado o administradora autorizada',
 'RF10':'Doctor asignado o administradora autorizada',
 'RF12':'Doctor asignado o administradora autorizada',
 'RF18':'SYSTEM instala; auditor o administrador consulta',
 'RF21':'Doctor conectado','RF23':'Mantenimiento',
 'RF25':'Mantenimiento','RF28':'Doctor asignado o administradora autorizada',
 'RF32':'Administradora','RF33':'Usuario que solicita recuperación',
 'RF34':'Usuario y mecanismos de sesión','RF35':'Administradora o recepcionista',
 'RF36':'KARELY_BD2 en exposición'}

def ampliar_requisitos(rf,rn):
 rf=[(a,b,('Cambiar a una fecha igual o posterior a hoy, aunque sea anterior a la fecha original, con turno disponible y aceptación del paciente.' if a=='RF07' else c),d) for a,b,c,d in rf]
 rf += [
 ('RF19','Consultar documentos del doctor','Listar documentos adjuntos, estado de revisión y fecha de validación, distinguiendo archivo recibido de documento aprobado.','Doctores'),
 ('RF20','Seleccionar doctores habilitados','Ofrecer para registrar disponibilidad únicamente doctores activos y con documentación completa.','Doctores'),
 ('RF21','Consultar horarios propios','Identificar al doctor conectado y mostrar sus horarios sin incluir los de otros médicos.','Doctores'),
 ('RF22','Consultar agenda y disponibilidad','Mostrar fechas y franjas disponibles por doctor, especialidad y consultorio, junto con el importe de consulta.','Citas'),
 ('RF23','Liberar reservas vencidas','Expirar pre-reservas cuyo plazo terminó y dejar de considerarlas bloqueos vigentes.','Citas'),
 ('RF24','Conservar la reprogramación','Guardar fecha, franja y consultorio anteriores y nuevos, motivo, aceptación y usuario de la operación.','Citas'),
 ('RF25','Cancelar citas vencidas','Cambiar a CANCELADA las citas programadas o reprogramadas sin asistencia cuando terminó el turno, mediante mantenimiento.','Citas'),
 ('RF26','Consultar cita atendida','Permitir a perfiles autorizados consultar el detalle de la cita atendida y la información clínica vinculada según sus permisos.','Pacientes'),
 ('RF27','Consultar historial del paciente','Relacionar paciente, citas, estados de atención y recetas para consultar sus registros anteriores.','Pacientes'),
 ('RF28','Registrar medicamentos','Guardar medicamento, dosis, frecuencia, duración y observaciones como detalles de una receta existente.','Pacientes'),
 ('RF29','Consultar cobros y liquidaciones','Listar cobros de pacientes y pagos a doctores con filtros y referencias de operación.','Finanzas'),
 ('RF30','Numerar pagos al doctor','Generar referencias únicas de operación y boleta con formato OP-año-secuencia y BOL-año-secuencia.','Finanzas'),
 ('RF31','Gestionar notificaciones','Registrar notificaciones de recibos y pagos, estado de envío, intentos y resultado para procesamiento.','Finanzas'),
 ('RF32','Administrar parámetros','Permitir a administración configurar parámetros autorizados de comisiones, reserva y sesión con las validaciones correspondientes.','Recepción y seguridad'),
 ('RF33','Recuperar credenciales','Permitir recuperar acceso mediante un token con caducidad y control de uso, almacenado como hash.','Recepción y seguridad'),
 ('RF34','Controlar sesiones','Registrar inicio, actividad, cierre y expiración de sesiones, y comprobar su vigencia para el acceso.','Recepción y seguridad'),
 ('RF35','Consultar recepción por fecha','Mostrar citas del día con paciente y estado de llegada para distinguir presencia registrada de citas sin registro.','Recepción y seguridad'),
 ('RF36','Consultar reportes por módulo','Ejecutar los 15 procedimientos SP_EXP_ como reportes internos con filtros validados y resultados por cursor.','Todos')]
 rn=[(a,b,('Solo una reprogramación por cita y con aceptación; la fecha nueva debe ser igual o posterior a hoy y puede preceder a la fecha original.' if a=='RN05' else c),d) for a,b,c,d in rn]
 rn += [
 ('RN15','Catálogos y especialidad','La reserva utiliza especialidad activa asignada al doctor, consultorio activo y franja activa. No basta con proporcionar un identificador existente.','RF03 RF05 RF22'),
 ('RN16','Precio de reserva','El importe de pre-reserva se obtiene de la especialidad y debe coincidir con el cobro aprobado.','RF05 RF06'),
 ('RN17','Reserva vigente','La confirmación exige una pre-reserva bloqueada y no vencida. Su plazo se obtiene del parámetro BLOQUEO_MINUTOS validado por el sistema.','RF05 RF06 RF23'),
 ('RN18','Pago al reprogramar','La reprogramación conserva cita y pago original, no genera un segundo cobro y exige motivo y aceptación expresa.','RF07 RF24'),
 ('RN19','Inasistencia vencida','El mantenimiento cancela citas PROGRAMADA o REPROGRAMADA sin asistencia al alcanzar la hora de fin. No cierra una atención ya iniciada.','RF25'),
 ('RN20','Comisiones configurables','COMISION_DOCTOR y COMISION_GESTORA deben estar activas, ser válidas y sumar 100. El reparto 60/40 no es una regla fija.','RF12 RF13 RF14 RF32'),
 ('RN21','Cancelación reprogramada','La vista de ingresos atribuye a la gestora el total de citas CANCELADA con REPROGRAMACIONES igual a 1. No duplica el ingreso en una tabla de ganancias.','RF14 RF25'),
 ('RN22','Documento vigente','La habilitación comprueba los documentos requeridos vigentes: DNI y título validados con archivo no vacío. Cambiar documentos provoca revalidación.','RF02 RF19 RF20'),
 ('RN23','Administración de cuentas','Crear cuentas y modificar sus roles o estados exige autorización administrativa y las protecciones de los procedimientos vigentes.','RF15 RF32'),
 ('RN24','Receta y medicamentos','Una atención tiene una cabecera única de receta y varios detalles de medicamentos. La escritura exige actor autorizado y atención abierta.','RF10 RF28'),
 ('RN25','Cierre consistente','El cierre válido cambia la atención a CERRADA, registra FECHA_CIERRE y deja la cita en ATENDIDA dentro de la operación transaccional.','RF12 RF26'),
 ('RN26','Referencias financieras','La operación y boleta automáticas son únicas. Una secuencia puede dejar saltos si una transacción se revierte; no se garantiza numeración sin huecos.','RF13 RF30'),
 ('RN27','Reportes internos','SP_EXP_ consulta con privilegios del invocador, sin GRANT adicionales. Filtrar por ID no autentica al doctor ni sustituye las vistas propias del acceso Oracle.','RF17 RF36')]
 return rf,rn

casos=[
 ('CU01 Registrar doctor y especialidades','Administradora','RF01 RF19','DOCTOR; DOCTOR_ESPECIALIDAD; ESPECIALIDAD'),
 ('CU02 Validar documentación','Administradora','RF02 RF19 RF20','DOCUMENTO_DOCTOR; DOCTOR'),
 ('CU03 Gestionar disponibilidad','Administradora o doctor propio','RF03 RF21','DISPONIBILIDAD_DOCTOR; FRANJA_HORARIA'),
 ('CU04 Registrar o consultar paciente','Administradora o recepción','RF04','PACIENTE'),
 ('CU05 Reservar y confirmar cita','Administradora o recepción','RF05 RF06 RF22 RF23','PRE_RESERVA_CITA; PAGO_CITA; CITA'),
 ('CU06 Reprogramar cita','Administradora o recepción','RF07 RF24','CITA; REPROGRAMACION_CITA'),
 ('CU07 Registrar llegada','Administradora o recepción','RF08 RF35','ASISTENCIA; CITA'),
 ('CU08 Registrar atención y receta','Doctor asignado o administradora autorizada','RF09 RF10 RF28','ATENCION_MEDICA; RECETA; RECETA_DETALLE'),
 ('CU09 Emitir recibo y cerrar atención','Doctor asignado o administradora autorizada','RF11 RF12 RF26','RECIBO_HONORARIO; ATENCION_MEDICA; CITA'),
 ('CU10 Consultar historial y detalle','Perfil autorizado según operación','RF26 RF27','PACIENTE; CITA; ATENCION_MEDICA; RECETA'),
 ('CU11 Gestionar finanzas','Administradora o tesorero','RF13 RF14 RF29 RF30','LIQUIDACION; CITA; PAGO_CITA'),
 ('CU12 Administrar seguridad','Administradora; usuario en su sesión','RF15 RF16 RF17 RF18 RF32 RF33 RF34','USUARIO; ROL; SESION_USUARIO; AUDITORIA; PARAMETRO_SISTEMA'),
 ('CU13 Procesar vencimientos y avisos','Procesos autorizados','RF23 RF25 RF31','PRE_RESERVA_CITA; CITA; SESION_USUARIO; NOTIFICACION_SALIENTE'),
 ('CU14 Consultar reportes de exposición','KARELY_BD2','RF36','Tablas y vistas de cada módulo mediante SP_EXP_')]

calidad_adicional=[
 ('RNF09','Compatibilidad','La interfaz debe funcionar en navegadores modernos del entorno de entrega. Registrar navegador y versión realmente probados.'),
 ('RNF10','Disponibilidad','El servicio debe funcionar durante el horario acordado del centro. Definir horario y registrar interrupciones; no se afirma alta disponibilidad del entorno local.'),
 ('RNF11','Respaldo y recuperación','Debe existir exportación e importación documentadas y prueba de restauración de una copia. No declarar respaldo automático sin programación y evidencia.'),
 ('RNF12','Portabilidad','Configurar conexión y secretos por entorno e instalar con scripts ordenados. Verificar instalación nueva con dependencias y versión Oracle admitidas.'),
 ('RNF13','Control de sesión','Comprobar vigencia, actividad y estado según configuración. Probar cierre, expiración y rechazo de reutilización de una sesión invalidada.'),
 ('RNF14','Crecimiento de datos','Mantener listados paginados y evaluar planes con datos representativos. El soporte de crecimiento se acredita con mediciones, no solo con particiones.')]

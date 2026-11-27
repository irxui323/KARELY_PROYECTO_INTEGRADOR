# Módulo de doctores: revisión manual y acceso

Flujo implementado:
1. Registrar datos del doctor, sin introducir ID de cuenta.
2. Asignar especialidad.
3. Subir por separado DNI y título profesional.
4. Abrir cada última versión y confirmar manualmente su conformidad.
5. Aprobar documentación o rechazar cada documento con motivo.
6. Crear acceso: nombre de usuario elegido por administración, rol DOCTOR
   resuelto por el servidor, correo del doctor y contraseña segura generada.

El DNI se compara con número, nombres y apellidos registrados. El título se
revisa manualmente; no hay autenticación automática de documentos. Una versión
nueva exige nueva revisión. El historial muestra versiones, estados y motivos.
Los motivos y decisiones se registran en AUDITORIA sin agregar tablas.

El backend exige especialidad/documentación aprobada y evita duplicar cuentas.
Crear cuenta y vincular doctor comparten transacción. La contraseña se guarda
como hash y se muestra una sola vez; la página elimina su valor al salir o
cambiar de doctor. No se implementaron expiración, cambio obligatorio al primer
acceso ni recuperación de contraseña: pertenecen a la futura etapa de login.

Arquitectura conservada: DoctorController, DTO doctor, service/service,
service/impl y repositorios existentes. Angular mantiene features/doctores con
páginas independientes de registro, especialidades, documentos y acceso.
Sin nuevos controllers, sin DDL y sin comentarios en las fuentes modificadas.

Pruebas: restricciones de aprobación, versiones revisadas, rechazo, rol y hash,
cuenta duplicada, formulario de acceso y eliminación de credenciales en memoria.
Las pruebas de backend/HTTP son simuladas y JPA usa H2; no se ejecutó el recorrido
contra Oracle ni una comprobación visual del navegador en esta entrega.

Verificación final:60 pruebas backend,36 Angular y39 Node aprobadas; Maven verify y compilación frontend de producción con código de salida0.

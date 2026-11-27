# Recuperación de contraseña por correo

## Alcance aprobado

Olvidé contraseña -> correo registrado -> enlace de un uso (15 minutos) -> nueva
contraseña y confirmación -> iniciar sesión con la nueva contraseña. Actualizar
hash del mismo usuario, revocar sesiones y tokens previos. Sin controllers nuevos.
AuthController, DTO auth, service/service, service/impl, repository, entity;
frontend features/auth. No comentarios, commits, publicación ni DDL ejecutado.

## Contrato compartido

- POST /api/v1/auth/recuperacion {correo:string} ->202 {mensaje:string} genérico
  «Si el correo corresponde a una cuenta, recibirás instrucciones para restablecer tu contraseña».
- POST /api/v1/auth/restablecer-password {token:string,password:string,
  confirmacionPassword:string} ->200 {mensaje:string}; inválido/vencido/usado ->400.
- Frontend público /recuperar-password y /restablecer-password#token=...;
  token en fragmento, no consultar/verificarlo mediante GET que lo consuma.
- Nuevos DTO RecuperacionRequestDTO y RestablecerPasswordRequestDTO en dto/auth.
- RecuperacionService.solicitar(RecuperacionRequestDTO,String ip):void async;
  restablecer(RestablecerPasswordRequestDTO):MensajeResponseDTO.
- Token aleatorio32bytes base64url sinpadding, almacenar SHA256, sin logs ni
  contraseñas/tokens en respuestas públicas ni almacenamiento frontend persistente.
- Vincular token con correo y versión SHA256 del hash de contraseña actual.
  Restablecer comprueba esas condiciones y estado activo o bloqueado por intentos;
  no reactivar usuarios INACTIVO ni roles inactivos. Desbloquear BLOQUEADO por intentos
  después de comprobar token y limpiar INTENTOS_FALLIDOS (roladministrado noINACTIVO).
- Bloquear USUARIO antes de token en solicitud y reset, consumir/resetear en misma
  transacción, invalidar otros tokens y sesiones. Correo después de commit.

## Configuración

JavaMailSender existente; no reutilizar tipos financieros de NOTIFICACION_SALIENTE.
SMTP configurable mediante entorno. app.recovery.enabled=false por defecto hasta
configurar; app.recovery.base-url=http://localhost:4200/restablecer-password;
app.recovery.expiration-minutes=15; app.recovery.from=${app.mail.from}.
Clock UTC bean, @EnableAsync executor recuperacionExecutor (2 threads,cola100).
Servicio async captura fallos y no filtra cuentas por respuesta. Rate limits IP y
correo con almacenamiento acotado y vencimiento. URLs confiables configuradas,
HTTPS salvo localhost/127.0.0.1 para pruebas locales. Sin depender de Host request.

## Esquema

Migración separada db/migraciones/2026-11-22-recuperacion-password.sql crea
TOKEN_RECUPERACION (TOKEN_HASH VARCHAR2(64) PK, ID_USUARIO FK USUARIO,
CORREO VARCHAR2(150), VERSION_CREDENCIAL VARCHAR2(64), FECHA_CREACION TIMESTAMP,
FECHA_EXPIRACION TIMESTAMP, FECHA_USO TIMESTAMP nullable). No ejecutar por agente.
Tras aplicarla son 24tablasbase+1 recuperación. JPA ddl-auto=validate conserva datos.

## Tareas y verificación

- [x] Backend entidades/repositorio/servicios/DTO con pruebas RED/GREEN de uso único,
  vencimiento, correo inexistente, cambio hash/sesiones, concurrencia y SMTP simulado.
- [x] Controller/security/config y SQL incremental, pruebas HTTP.
- [x] Frontend formularios reactivos, enlace en login y retorno a login, tests.
- [x] Suites completas, empaquetado, revisión independiente y guía de configuración.

Gmail y Outlook como destinatarios. Remitente configurable: Gmail con contraseña
de aplicación y2FA; Microsoft requiere configuración/autorización SMTP de su cuenta
(OAuth recomendado). No prometer recepción real sin configurar y probar proveedor.


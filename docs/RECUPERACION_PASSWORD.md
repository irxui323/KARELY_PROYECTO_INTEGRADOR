# Recuperación de contraseña por correo

## Arquitectura

Se conserva AuthController. La recuperación utiliza DTO de auth,
RecuperacionService en service/service, RecuperacionServiceImpl en service/impl,
TokenRecuperacionRepository y la entidad TokenRecuperacion. El frontend mantiene
las páginas y el servicio HTTP en features/auth. No se añadió otro controller.

## Preparar Oracle una sola vez

Conectar como KARELY_BD2 a ORCL y ejecutar con F5:

    db/migraciones/2026-11-22-recuperacion-password.sql

Es una ampliación: no ejecutar nuevamente los instaladores de la base ni borrar
usuarios o tablas. Se añade TOKEN_RECUPERACION a las 24 tablas base. La aplicación
usa ddl-auto=validate y necesita esta tabla antes de arrancar con el nuevo código.
El script es idempotente: si la tabla existe no la elimina ni la recrea. Revisar
los errores que indique SQL Developer antes de continuar.

La tabla guarda hash SHA-256 del token, usuario, correo de emisión, versión de
la credencial, creación, vencimiento y uso. No almacena el token del enlace ni
contraseñas en texto plano.

## Configurar el remitente

La forma interactiva para Gmail es iniciar el backend desde PowerShell con:

```powershell
cd C:\UNIVERSIDAD\LP2\SEMANA11\karely_moderno\backend
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\iniciar-backend.ps1 -CorreoGmail
```

Pide primero la contraseña de Oracle y después la cuenta Gmail remitente y su
contraseña de aplicación de Google de 16 caracteres. Esta última se pide como
entrada segura, se utiliza solo para ese proceso y no se escribe en archivos.
Al salir se restauran las variables de correo originales. Cada arranque con
-CorreoGmail requiere introducirla nuevamente. El correo remitente puede ser
distinto del correo del trabajador que solicita recuperar su contraseña.

Si se arranca sin esa opción y sin variables SMTP configuradas, la recuperación
permanece desactivada y la terminal lo indica. Escribir una dirección Gmail en
la página no configura un remitente. El correo de destino debe existir en
USUARIO.CORREO; modificar solamente DOCTOR.CORREO no cambia la cuenta de acceso.
Los correos @example.com de la carga TEST no tienen bandeja de entrada.

Antes de usar -CorreoGmail, activar la verificación en dos pasos de Google y
generar una contraseña de aplicación para Karely. No introducir la contraseña
normal de Gmail ni un código de verificación de seis dígitos. Si la cuenta no
ofrece contraseñas de aplicación, revisar las restricciones de su organización
o del programa de protección de la cuenta.

Después de arrancar, probar Olvidé mi contraseña con el correo real de USUARIO.
Revisar también Spam. Si SMTP rechaza las credenciales, el backend registra un
mensaje de autenticación sin imprimir credenciales, token ni dirección. La
pantalla sigue mostrando una respuesta genérica para no revelar cuentas.

El destinatario puede utilizar Gmail, Outlook u otro servicio: se envía al correo
que ya está registrado en USUARIO. Karely necesita una sola cuenta remitente
activa por configuración; no necesita las contraseñas de correo de los trabajadores.

Para un remitente Gmail, usar una contraseña de aplicación de una cuenta con
verificación en dos pasos, cuando esa opción esté disponible para la cuenta.
Ver instrucciones oficiales: https://support.google.com/accounts/answer/185833

En PowerShell, en la misma terminal desde la que se arrancará el backend:

```powershell
$env:APP_RECOVERY_ENABLED = 'true'
$env:APP_RECOVERY_BASE_URL = 'http://localhost:4200/restablecer-password'
$env:APP_RECOVERY_EXPIRATION_MINUTES = '15'
$env:APP_RECOVERY_FROM = 'TU_CUENTA_REMITENTE@gmail.com'
$env:MAIL_HOST = 'smtp.gmail.com'
$env:MAIL_PORT = '587'
$env:MAIL_USERNAME = $env:APP_RECOVERY_FROM
$claveCorreo = Read-Host 'Contraseña de aplicación del remitente' -AsSecureString
$env:MAIL_PASSWORD = [System.Net.NetworkCredential]::new('', $claveCorreo).Password
$claveCorreo = $null
```

Después arrancar el backend con iniciar-backend.ps1, como se venía haciendo.
Los archivos .env.example son ejemplos; Spring no los carga automáticamente.
No guardar contraseñas reales en el repositorio ni enviarlas por el chat.

La cuenta SMTP es independiente del envío financiero APP_MAIL_ENABLED; activar
la recuperación no exige activar MailQueueWorker ni configurar un operador de cola.

Un remitente de Microsoft 365/Outlook requiere la autorización SMTP correspondiente
a esa cuenta. Microsoft recomienda OAuth; obtener y renovar esos tokens requiere
una integración con Microsoft Entra que no se añadió como parte de este flujo.
No basta con sustituir el host y utilizar una contraseña normal de Outlook.
Documentación: https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth

## Flujo

El correo de recuperación ahora incluye una tarjeta HTML con los colores de
Karely, el logo original incrustado en el mensaje, un saludo y un botón para
restablecer la contraseña. También incluye texto alternativo, enlace visible
y aviso del vencimiento. Los recursos están en backend/src/main/resources/mail;
no dependen de una imagen pública ni del frontend encendido para cargar el logo.
El enlace sigue necesitando que el frontend esté accesible para abrir el formulario.

El diseño se aplica a correos nuevos después de reiniciar el backend. Los
mensajes recibidos anteriormente no cambian: solicitar otro enlace para ver
el nuevo formato. No requiere otra migración SQL. La vista previa local en
output/correo-recuperacion/vista-previa.html contiene un enlace ficticio sin validez.

1. En login, pulsar Olvidé mi contraseña e introducir el correo registrado.
2. La respuesta siempre indica que se enviarán instrucciones si corresponde a
   una cuenta. No confirma públicamente la existencia de ese correo.
3. Recibir un enlace con token en el fragmento #token=..., de un uso y 15 minutos.
4. Introducir y confirmar una contraseña nueva de 12 a 72 caracteres; el límite
   del hash BCrypt también se comprueba en bytes UTF-8.
5. El backend actualiza el hash de la misma cuenta, consume los tokens pendientes
   y cierra sus sesiones. No inicia sesión automáticamente.
6. Volver a login e ingresar con el usuario habitual y la contraseña nueva.

El frontend conserva el token solo en memoria y retira el fragmento de la barra
de direcciones. Si se recarga esa página después de retirarlo, abrir nuevamente
el enlace recibido o solicitar otro si ya venció.

POST /api/v1/auth/recuperacion recibe correo y devuelve 202 con mensaje genérico.
POST /api/v1/auth/restablecer-password recibe token, password y
confirmacionPassword; devuelve 200 al completar o 400 si no es válido.

Las solicitudes se procesan de forma asíncrona con cola acotada y límites por
IP/correo. El enlace usa una URL configurada de confianza, no el encabezado Host.
Usar HTTPS y un dominio real para un despliegue fuera de localhost.

## Verificación y límites

Las pruebas automatizadas utilizan SMTP simulado y persistencia H2 donde se
indica; no acreditan entrega real en Gmail/Outlook ni ejecución en Oracle.
Configurar el remitente y aplicar la ampliación SQL son requisitos de la prueba
real. Mientras APP_RECOVERY_ENABLED=false, no se envían correos de recuperación.
La pantalla conserva su respuesta genérica también si el envío no pudo realizarse.
El backend registra un fallo de envío sin incluir dirección, token ni contraseña.

Verificación del 22/11/2026: Maven verify completó 79 pruebas sin fallos y generó
el JAR. El frontend aprobó 50 pruebas Angular y 39 pruebas Node; la compilación
de producción también completó. Se revisaron concurrencia entre login y reset,
uso único, expiración, revocación de sesiones y contratos HTTP públicos.


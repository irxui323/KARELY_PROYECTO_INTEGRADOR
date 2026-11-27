# Correo de recuperación Karely

Objetivo: adaptar el correo a la referencia del usuario, conservando la arquitectura, tokens y envío posterior al commit.

1. Cambiar SimpleMailMessage por MIME multipart alternative (texto + HTML) en RecuperacionServiceImpl. Recursos HTML e imágenes bajo resources/mail, sin nueva capa ni controller.
2. Usar el logo adjunto original incrustado por CID y un candado ilustrativo; fondo celeste, tarjeta blanca, saludo con username escapado y botón azul. Presentar enlace alternativo y vencimiento; sin contactos inventados ni imágenes remotas.
3. Adaptar dobles de correo de las pruebas para MIME y verificar HTML, texto alternativo, escape de datos, recursos incrustados, enlaces, expiración y fallo SMTP.
4. Generar una vista previa con token ficticio y revisar el render si el navegador está disponible. No enviar correos reales ni reutilizar tokens de capturas.
5. Maven verify, revisar empaquetado del JAR y entregar instrucciones para solicitar un correo nuevo tras reiniciar.

## Resultado

Revisión posterior solicitada por el usuario: sustituido el diseño de tarjeta ilustrada por un membrete de consultorio, con logo, línea azul fina, cuerpo de texto a la izquierda, botón de ancho natural y firma de Administración. Eliminados candado, eslogan y recuadros. El candado ya no se adjunta al MIME. Nueva vista previa revisada en escritorio y móvil de 390 px sin desbordamiento. Maven verify: 103 pruebas aprobadas.

RecuperacionServiceImpl conserva transacciones, límites, generación y consumo de token. Ahora compone MIME con texto alternativo, HTML UTF-8, nombre de remitente Karely’s y dos imágenes CID. Se usa el username escapado para el saludo. Los recursos se empaquetan con el backend; no hay dependencias nuevas, controllers, cambios SQL ni comentarios de código.

Logo original copiado sin modificaciones desde el adjunto; hash SHA-256 EF7191BEDA44D351FB5840B5A97ED16F89E59E2A4FB7FE09BE03DC7EE6B5AFE6. Icono de candado propio generado como recurso PNG. Plantilla basada en tablas y estilos inline con ajuste para móviles.

Verificación: 103 pruebas backend aprobadas con Maven verify. Las pruebas serializan/deserializan el MIME como en transporte real y comprueban partes texto/HTML, enlace común, logo y candado incrustados, logo byte a byte, UTF-8, saludo escapado, fallo SMTP, expiración y concurrencia. El JAR incluye plantilla e imágenes. No se enviaron correos reales durante estas pruebas.

Revisión visual en navegador de la vista previa con datos ficticios: escritorio y móvil de 390 px, imágenes cargadas y sin desbordamiento horizontal. La vista previa autónoma está en output/correo-recuperacion/vista-previa.html. Los servidores temporales de revisión se detuvieron y se restauró el viewport del navegador.

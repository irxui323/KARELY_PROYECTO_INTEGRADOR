# Estado verificable de la adaptación Karely → LP2

## Componentes implementados en el código fuente

- Frontend Angular standalone (login, home, pacientes, doctores, citas, finanzas, doctor, administración), diseño original preservado en assets CSS e imágenes.
- Cliente HTTP, interceptor JWT, rutas protegidas por rol, proxy a `http://localhost:8080`.
- Backend REST Java21/SpringBoot4, servicio y repositorio Oracle, operaciones parametrizadas.
- Conexión a Oracle `KARELY_BD2` por variables de entorno; el código no conoce la contraseña.
- Autenticación BCrypt, sesiones Oracle, JWT HMAC-SHA256, validación por roles y bloqueo tras cinco intentos fallidos.
- Alta inicial de una administradora con contraseña proporcionada por el usuario; sin credenciales por defecto.
- Altas de pacientes, médicos y catálogos; documentación médica (BLOB PDF/PNG/JPEG), validación y asociación de especialidades.
- PL/SQL existente: disponibilidad, pre-reserva, confirmación de pago/cita, reprogramación, admisión, atención, diagnóstico, receta y detalle, recibo, cierre, liquidación, pago a médico, administración y notificaciones.
- Vistas existentes del paso 23, consultadas desde backend según permisos.
- Uso de particiones mensuales existentes, sin intentar crear/modificar particiones desde la app.
- Trabajador de cola SMTP opcional: está apagado por defecto, se habilita con servidor y credenciales válidas.

## No implementado o no verificado

- Compilación de dependencias y ejecución real en el equipo Oracle del usuario (sin conectividad a esa instancia desde aquí).
- Pasarela bancaria, adquirente o conciliación para confirmar automáticamente pagos reales: el operador introduce una referencia externa comprobada.
- Integración con SUNAT u otro emisor fiscal para validez del recibo.
- Entrega efectiva de email cuando no se proporcionan datos de SMTP.
- Tests de concurrencia bajo carga y revisión formal de los 112 RF, 27 RN y 19 RNF.
- Publicación con TLS, cuenta Oracle de mínimos privilegios y controles adicionales de documentos clínicos.
- Equivalencia visual exacta página por página con los HTML antiguos: clases, CSS, imágenes, logo y navegación permanecen, pero las plantillas Thymeleaf fueron reemplazadas por componentes Angular. Se requiere revisión visual en navegador.
- Prohibición genérica de cancelaciones frente al caso excepcional de cancelación tras reprogramación sigue siendo una contradicción documental pendiente de decisión del negocio.

## Control de riesgos

El esquema real de 29 tablas **nunca se recrea** desde el backend ni desde Angular. Para prevenir ejecuciones en una base equivocada se comprueba la presencia de 29 tablas, de las 5 vistas y que los objetos PL/SQL conocidos no se encuentren `INVALID`.

La validación de la empresa de pagos, correo y facturación debe completarse antes de recibir pagos/datos reales; no presentar el trabajo como listo para producción hasta tener resultados de las pruebas manuales y de seguridad.

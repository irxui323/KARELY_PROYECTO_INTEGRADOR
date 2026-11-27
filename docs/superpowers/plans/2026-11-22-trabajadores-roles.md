# Trabajadores y accesos por rol

Reutilizar los módulos existentes y mantener controller, DTO, service y repository. El administrador conserva todas las acciones. Recepción entra a citas, caja a confirmación de cobros, tesorería a finanzas y doctor a agenda propia.

El alta administrativa requiere usuario, correo y rol activo. El backend genera una clave aleatoria cuando no se proporciona, guarda BCrypt y devuelve las credenciales con Cache-Control no-store. La pantalla mantiene las credenciales en memoria hasta salir, sin guardarlas en almacenamiento del navegador. DOCTOR se crea desde su proceso validado.

Verificación: creación con hash comprobable, contraseña distinta en cada alta, bloqueo de rol inactivo y operador sin permiso, contrato HTTP sin contraseña requerida y respuesta no cacheable; formularios, destinos de ingreso y menú por rol; suites completas y build de producción. La prueba real contra Oracle requiere que el usuario aplique las migraciones pendientes y reinicie backend.

Resultados: Maven verify correcto, 114 pruebas sin fallos; frontend 94 pruebas Angular y 40 Node correctas; compilación de producción correcta.

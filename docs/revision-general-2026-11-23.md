# Revisión general del 23 de noviembre de 2026

Se mantuvo la organización existente por capas y módulos. Se dejó pendiente conservar el filtro al volver de editar, según lo acordado.

## Comprobaciones

| Comprobación | Resultado |
|---|---|
| Backend: suite Maven | 142 pruebas, sin fallos ni errores |
| Frontend: compilación Angular | Correcta |
| Frontend: pruebas Angular | 6 aprobadas |
| Frontend: pruebas Node | 44 aprobadas |
| Navegador Edge, API simulada | 19 comprobaciones, sin errores de JavaScript |

Las pruebas cubren autenticación, permisos, sesiones, validaciones, documentación de doctores, especialidades, disponibilidad, citas, recetas, recibos, pagos y paginación. La comprobación en navegador recorre 16 pantallas, comprueba la redirección al login sin sesión, el aviso de credenciales incorrectas y el paginador con búsqueda y selector de tamaño.

## Correcciones de mensajes

- Tildes y caracteres dañados en los textos del backend y frontend.
- Avisos de conexión, permisos y errores internos en lenguaje claro.
- Un solo mensaje de validación visible por vez.
- Se conserva el motivo de negocio de Oracle sin mostrar el código ORA ni la traza.
- Confirmación de pago de cita sin identificadores técnicos largos.
- Instrucciones de contraseña y textos de ayuda sin referencias innecesarias a bytes, Oracle o SMTP.
- Mensajes de listados vacíos que mencionan los filtros actuales.

## Alcance

Las comprobaciones del navegador usan respuestas simuladas. Las pruebas de persistencia usan bases de datos de prueba y dobles de prueba; no validan la instalación Oracle local completa ni el envío real por Gmail o la API externa de DNI. No se modificaron datos ni esquemas en Oracle, ni se enviaron correos reales.

Reiniciar el backend y recargar el frontend para aplicar los cambios. No requiere migraciones SQL.

Los registros de ejecución están en la carpeta `tmp`, con el prefijo `revision-general`.

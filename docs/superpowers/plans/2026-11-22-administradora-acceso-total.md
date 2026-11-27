# Acceso completo de la administradora

Habilitar todos los permisos existentes en menú y rutas, asistencia, atención y pagos. Conservar controllers, DTO, service, repository y módulos existentes. Mantener actor administrador en auditoría y médico de la cita en atención; conservar las reglas de negocio y las restricciones de otros roles.

1. Probar permisos administrativos y restricciones de otros trabajadores.
2. Ampliar servicios y vistas existentes; reutilizar horarios generales para administración.
3. Preparar migración Oracle de los nueve procedimientos afectados, sin ejecutarla.
4. Ejecutar pruebas backend, frontend y compilación de producción.

## Aplicación en Oracle

Ejecutar db/migraciones/2026-11-22-administradora-acceso-total.sql con F5 conectado como KARELY_BD2. El archivo sustituye nueve procedimientos existentes; no crea tablas ni borra datos. Verificar nueve procedimientos VALID y consulta USER_ERRORS sin filas. Reiniciar backend y recargar frontend. La migración fue preparada y revisada, pero no ejecutada contra Oracle desde este trabajo.

# Karely frontend - plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para ejecutar esta etapa en la sesión actual.

**Goal:** Reorganizar Angular según ejemplo y PDF manteniendo el backend actual.
**Architecture:** core para sesión, HTTP y guards; features por módulo con servicios/modelos; layout separado y shared reutilizable. El contrato Oracle/HTTP actual se conserva hasta la etapa backend.
**Tech Stack:** Angular 22, TypeScript 6, RxJS y pruebas Node existentes.
**Spec:** docs/superpowers/specs/2026-11-21-arquitectura-karely-design.md

## Restricciones y alcance acordado

- Aprobación del 21/11/2026: frontend primero; organización del backend y defectos funcionales críticos se revisan después.
- No modificar backend, ejemplo, pdfs ni datos Oracle.
- Conservar cambios locales previos, diseño visual y restricciones de roles actuales.
- Sin comentarios nuevos en fuentes. No publicar cambios en esta etapa.
- Los contratos TypeScript reflejan los nombres actuales del servidor; camelCase coordinado con DTO Java queda para backend.

## Foco de revisión

- Recarga de sesión y token vencido.
- Una respuesta 403 no elimina una sesión válida.
- Credenciales HTTP solo hacia la API propia.
- Rutas lazy conservan permisos y destinos actuales.
- Recarga de documentación no mezcla médicos ni conserva éxitos anteriores.

## Tareas

### 1. Copia de seguridad y línea base
- [x] Guardar src, tests y configuración en tmp/backup-frontend-arquitectura.
- [x] Ejecutar npm.cmd test y build de producción antes de migrar.

### 2. Core, sesión y navegación
- [x] Separar core.ts en auth/modelos, auth/service, interceptores y errores.
- [x] Crear environments y app.config.ts.
- [x] Probar token en API, 401, 403, sesión dañada y guardas.
- [x] Implementar guards y rutas lazy por feature con las restricciones actuales.

### 3. Features y layout
- [x] Mover páginas a features y extraer HTML/CSS con imports válidos.
- [x] Separar MainLayout, Header y Sidebar y configurar menú centralizado.
- [x] Conservar rutas existentes mediante configuración de navegación.
- [x] Migrar pruebas para cargar las fuentes en su nueva ubicación, sin bajar sus expectativas.

### 4. Servicios y contratos por dominio
- [x] Crear modelos y servicios HTTP de doctores, pacientes, citas, atención, finanzas y administración.
- [x] Retirar el cliente genérico de los componentes y mantener compatibilidad HTTP con backend.
- [x] Comprobar carga de datos, payloads y errores con HTTP de pruebas de Angular.

### 5. Formularios y cierre
- [x] Separar la migración de estructura de los cambios de reglas funcionales: documentar el estado de formularios y los puntos que dependan del backend.
- [x] Ejecutar toda la suite y build de producción.
- [x] Revisión independiente de los cambios y corrección de regresiones.
- [x] Actualizar README y estado de implementación con límites explícitos.

## Registro

- Decisión: trabajar en la carpeta autorizada conservando copia de las fuentes con cambios sin commit; no crear commits sobre trabajo previo del usuario.
- Decisión: no cambiar reglas funcionales ni simular la implementación backend aplazada.
- Estado: etapa frontend implementada y revisada. 23 pruebas; build de producción aprobado. Ver docs/ESTADO_REESTRUCTURACION_2026-11-21.md para los pendientes explícitos.

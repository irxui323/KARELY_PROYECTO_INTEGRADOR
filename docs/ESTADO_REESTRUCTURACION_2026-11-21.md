# Estado de la reestructuración de Karely

## Alcance

Frontend reorganizado según ejemplo y PDF S7-S11. La organización del backend
y las reglas críticas de negocio continúan en la etapa posterior acordada.
Se conservan los contratos Java/Oracle actuales.

## Arquitectura implementada

- core, features, layout y shared con responsabilidades utilizadas.
- Modelos y servicios HTTP por dominio con Observable y tipos explícitos.
- Plantillas y estilos externos, rutas lazy por operación y layout separado.
- Formularios reactivos; filtros y selectores auxiliares conservan ngModel.
- Sesión tipada con vencimiento desde exp del JWT, restauración validada,
  temporizador y limpieza al destruir el servicio.
- Guards de sesión, invitado y permisos; retorno interno seguro tras login.
- Permisos derivados de las restricciones Java, usados en rutas, menú,
  navegación y directiva de acciones. Java sigue autorizando cada petición.
- Interceptores separados, limitados a la API propia.
- Edición por ID desde los listados existentes; una carga fallida no puede
  convertirse en un alta accidental.
- Bloqueo de envíos repetidos y notificación explícita de cambios asincrónicos
  para Angular zoneless.

## Páginas por módulo

| Módulo | Páginas independientes |
|---|---|
| Doctores | DoctorList, DoctorForm, DoctorEspecialidades, DoctorHorarios, DoctorDocumentos |
| Pacientes | PacienteList, PacienteForm, PacienteAdmision |
| Citas | CitaList, CitaReserva, CitaConfirmacion, CitaReprogramacion |
| Atención | AgendaList, DisponibilidadForm, AtencionForm |
| Finanzas | LiquidacionList, LiquidacionForm, PagoForm, IngresoList |
| Administración | UsuarioList, UsuarioForm, ParametroForm, CatalogoForm, NotificacionList, AuditoriaList |

Son 25 páginas de operaciones, además de login, inicio y páginas comunes.
Cada una utiliza sus servicios y estado; no hereda ni envuelve los componentes
anteriores con todas las operaciones del módulo.

## Verificación ejecutada

- npm.cmd test: código 0; 34 pruebas Angular/Vitest en 14 archivos spec y
  35 pruebas Node, todas aprobadas, sin casos omitidos.
- Builds de desarrollo y producción: código 0.
- Paquete inicial de producción: aproximadamente 290 kB.
- Búsqueda de comentarios en fuentes frontend: sin coincidencias.
- Revisión independiente: corregidos renderizado asincrónico, creación
  accidental desde edición fallida y acción financiera sin permiso visible.

Las pruebas incluyen HTTP simulado, multipart, permisos, vencimiento,
returnUrl, formularios inválidos, edición por ID, doble envío y plantillas
montadas en jsdom. Se conservaron las regresiones previas de documentación,
selección clínica y controles deshabilitados.

## Límites y siguiente etapa

Las pruebas usan servidor simulado; no se conectaron a Oracle ni certifican
flujos clínicos o financieros integrales. No se hizo comprobación visual en
navegador real en esta entrega.

Quedan para la etapa backend las entidades JPA, DTO, mappers, repositorios,
contratos camelCase, errores de campo uniformes y permisos servidos por Java.
Los modelos actuales mantienen nombres y nulabilidad de la API existente.
Las validaciones locales no sustituyen el análisis pendiente de reglas críticas.

La guía PDF previa describe la arquitectura anterior; se actualizará al cerrar
el diseño completo del backend y de los flujos funcionales.

No se publicaron cambios ni se crearon commits. Copias previas:
tmp/backup-frontend-arquitectura y tmp/frontend-antes-completar.
Plan: docs/superpowers/plans/2026-11-21-completar-frontend.md.

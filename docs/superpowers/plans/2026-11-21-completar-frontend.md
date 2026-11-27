# Completar arquitectura frontend

> REQUIRED SUB-SKILL: subagent-driven-development para tareas independientes y revisión al final.

## Alcance

Completar las carencias pendientes del frontend ya aprobadas por el usuario.
Backend y sus contratos quedan intactos. No se publica en GitHub ni se hacen
commits sobre cambios del usuario. Se conserva el diseño de Karely y no se
añaden comentarios al código. Referencia: diseño de arquitectura aprobado,
ejemplo PharmaSoft y PDF S7-S11.

## Tareas

- [x] Sesión tipada con vencimiento basado en exp del JWT, restauración válida,
  temporizador con limpieza; authGuard con returnUrl interno e invitadoGuard.
- [x] Permisos frontend derivados exclusivamente de los roles y restricciones
  existentes de Java; permisoGuard, menú y acciones filtradas. El backend sigue
  siendo la autoridad. No se inventan permisos recibidos desde el servidor.
- [x] Páginas independientes por operación en pacientes, doctores, citas,
  atención, finanzas y administración, con rutas lazy. No crear wrappers que
  mantengan un componente gigante oculto ni heredar todos sus métodos.
- [x] Formularios de edición cargan datos por id desde los listados actuales
  cuando el backend no dispone de GET por id. Informar si no existe el registro.
- [x] Pruebas distribuidas por módulo y componente, con regresiones originales
  conservadas y comprobación de rutas, permisos, vencimiento y formularios.
- [x] Suites completas, build desarrollo/producción, revisión independiente y
  actualización del estado real de cumplimiento.

## Verificación y riesgos

Primero escribir y ejecutar pruebas que fallen por la carencia. Tras cada
cambio verificar permisos de escritura, URLs directas, edición por id, estado
de formularios al navegar, retorno de login y temporizadores. No simular éxito
de Oracle ni considerar un mock como prueba integral.

## Registro

- 21/11/2026: inicio. El usuario pide completar, no aplazar estas carencias.
- Copia de la primera etapa: tmp/frontend-antes-completar, sin dependencias.
- Formularios y paginación específica de negocio se conservan según backend;
  no se afirman implementadas reglas clínicas o contables nuevas.


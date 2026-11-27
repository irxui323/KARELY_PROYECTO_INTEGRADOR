# Arquitectura objetivo de Karely

Fecha: 21/11/2026. Estado: propuesta para revisión del usuario, sin implementación iniciada.

## Propósito

Adaptar el frontend y backend de Karely al patrón académico aportado en `ejemplo`
y `pdfs`. La conformidad debe demostrarse con responsabilidades, contratos y
pruebas; mover archivos o mantener carpetas vacías no satisface el objetivo.

Se mantienen los casos de uso clínicos de Karely: médicos, documentación,
disponibilidad, pacientes, citas, atención, finanzas, administración y sesiones.
Se conserva el diseño visual de Karely como criterio propuesto: la solicitud
es arquitectónica y no pide sustituir su identidad por la de PharmaSoft.
Se mantiene la petición previa de no añadir comentarios al código fuente.

## Evidencia revisada

- `ejemplo/pharmaSoft-frotend-main/src/app`: core, features, layout y shared;
  páginas separadas en TS/HTML/CSS, servicios y modelos por dominio, rutas lazy.
- `ejemplo/PharmaBackend/src/main/java/com/example/Actividad01`: controller,
  dto, entity, mapper, repository, service/service, service/impl, security,
  exception, enums y auditoria. Spring Data JPA y DTO validados.
- Guía S7, páginas 4-7, 11 y 15-16: estructura Angular, entornos, contratos,
  servicios HTTP, navegación y formularios reactivos.
- Guía S8: relaciones por identificador, catálogos, formularios dependientes y
  consistencia entre DTO y modelos TypeScript.
- Guía S9, páginas 3-4: operaciones transaccionales, cabecera/detalle,
  precios calculados en servidor, consultas y filtros.
- Guía S10, páginas 8-11 y 23-31: entidades de seguridad, repositorios,
  DTO, mapper, AuthenticationManager, BCrypt y contratos de autenticación.
- Guía S11, páginas 3-15 y 18-20: sesión con vencimiento, permisos,
  interceptores separados, guards, returnUrl seguro y menú por permisos.
- Las diapositivas S7-S11 complementan las cinco guías. Se extrajo texto de
  los 10 PDF de `pdfs` y se inspeccionaron visualmente páginas de estructura.

Los PDF describen PharmaSoft. Se adapta su arquitectura, no sus tablas de
farmacia ni sus permisos literales al negocio clínico.

## Diferencias concretas con Karely actual

| Aspecto | Actual | Objetivo |
|---|---|---|
| Frontend | Componentes concentrados en src/app | Features por dominio |
| Plantillas | HTML extenso dentro de TS | TS, HTML y CSS separados |
| HTTP | ApiService genérico, nombres de acciones | Servicios específicos tipados |
| Datos frontend | Row y any | Modelos Request/Response por caso de uso |
| Formularios | ngModel predominante | ReactiveForms y validaciones por campo |
| Rutas | Importaciones directas, guardas en un archivo | Rutas por feature y carga diferida |
| Layout | Shell que concentra estructura y menú | MainLayout, Header, Sidebar y menú central |
| Sesión | Token y rol, sin temporizador cliente | Sesión tipada con vencimiento y permisos |
| Backend | Map y ApiInput en contratos | RequestDTO/ResponseDTO y @Valid |
| Entidades | Records poco usados | Entidades mapeadas y usadas por persistencia |
| Repositorios | SQL genérico con mapas | JPA tipado y repositorios de procedimientos |
| Servicios | service y serviceimpl a nivel raíz | service/service y service/impl como el ejemplo |
| Errores | Formato parcial y excepciones en controller | exception con respuesta uniforme |

Las pruebas existentes son una línea base; no acreditan estas características
por sí solas. Los contadores anteriores no equivalen a cobertura integral.

## Enfoque propuesto y alternativas

1. **Adaptación completa del patrón con persistencia híbrida, recomendada.**
   Entidades y Spring Data JPA para consultas y CRUD adecuados; repositorios
   especializados para PL/SQL clínico y contable existente. DTO y modelos
   tipados en todos los límites. Es el enfoque descrito en este documento.
2. Reordenar carpetas manteniendo Map, ApiService genérico y records sin uso.
   Es menos trabajo, pero no responde al patrón aportado y se descarta.
3. Reescribir las reglas PL/SQL exclusivamente en Java. Aumenta el riesgo de
   duplicar lógica y cambiar bloqueos y contabilidad; no está justificado por
   la solicitud y se descarta.

La adaptación JPA requiere confirmar columnas, claves, restricciones y tipos
reales de Oracle. No se puede inferir un mapeo completo solo del frontend.

## Frontend objetivo

```text
src/
  app/
    core/
      auth/                 auth.model.ts, auth-service.ts
      config/               menu.ts
      guards/               auth-guard.ts, permiso-guard.ts
      interceptors/         auth-interceptor.ts, error-interceptor.ts
      models/               error-response.ts, pagina-response.ts
      utils/                http-error.ts, return-url.ts
    features/
      auth/pages/login/
      inicio/
      doctores/             models, services, pages, doctores.routes.ts
      pacientes/            models, services, pages, pacientes.routes.ts
      citas/                models, services, pages, citas.routes.ts
      atencion/             models, services, pages, atencion.routes.ts
      finanzas/             models, services, pages, finanzas.routes.ts
      administracion/       models, services, pages, administracion.routes.ts
    layout/                 main-layout, header, sidebar
    shared/                 components, directives, pages
    app.ts, app.html, app.css, app.config.ts, app.routes.ts
  environments/             environment.ts, environment.development.ts
```

Cada página tiene plantilla y estilo externos. Doctores separa listado,
formulario, documentación, especialidades y disponibilidad. Pacientes separa
listado, formulario y búsqueda. Citas separa reserva, confirmación, consulta,
reprogramación y asistencia; la atención conserva su secuencia clínica.
Finanzas separa consulta de ingresos, liquidaciones y pagos.

Los servicios exponen Observable tipado. Los formularios utilizan controles
tipados, validación local y errores de campo del servidor. Las páginas tienen
estados de carga, guardado, error y vacío. No se reenvían operaciones con un
doble clic durante el guardado. El servidor conserva la autoridad de negocio.

La directiva de permisos y los guards mejoran la experiencia; no sustituyen la
autorización del backend. El interceptor solo añade credenciales a la API
configurada. Un 401 cierra sesión salvo en login; un 403 abre acceso denegado
sin borrar una sesión válida. returnUrl solo admite destinos internos.

## Backend objetivo

```text
pe.edu.karely/
  config/
  controller/
  dto/                      auth, doctor, paciente, cita, finanzas, catalogo
  entity/
  enums/                    Rol y Permiso adaptados a Karely
  exception/                reglas, no encontrado, handler global
  mapper/
  repository/               JPA y contratos especializados de procedimientos
  service/
    generic/                solo contratos CRUD realmente compartidos
    service/                interfaces por dominio
    impl/                   implementaciones transaccionales
  security/
  auditoria/
```

Los controller reciben DTO validados y devuelven ResponseEntity tipado. No
contienen SQL, conversiones genéricas de Map ni reglas del negocio. Los mappers
convierten entidades/proyecciones en respuestas sin filtrar hashes, BLOB o datos
clínicos a roles ajenos.

Las entidades deben participar en consultas o persistencia real: no se crean
solo para completar una carpeta. Los repositorios de lectura devuelven entidades
o proyecciones tipadas. Los procedimientos conservan parámetros y resultados
tipados; la infraestructura técnica de JDBC puede permanecer encapsulada donde
sea necesaria, sin ser la API pública de todos los dominios.

La configuración de JPA no crea, elimina ni actualiza tablas automáticamente.
Se fija `spring.jpa.hibernate.ddl-auto: validate`. Antes del mapeo se obtienen
columnas, PK, FK, secuencias/identidades, nulabilidad y tipos Oracle de fechas y
BLOB. Esos datos son un requisito técnico, no se sustituyen por suposiciones.
No se copia el V1 de PharmaSoft sobre KARELY_BD2. Flyway solo se considerará con
un baseline revisado; no se ejecutan migraciones sobre datos existentes como
parte de esta reorganización. El esquema y objetos de producción se conservan.

## Contratos y compatibilidad

Se propone migrar frontend y backend juntos a recursos y acciones HTTP claras:
`/doctores`, `/pacientes`, `/especialidades`, `/citas`, `/liquidaciones` y `/auth`.
GET consulta, POST crea o ejecuta una acción y PUT actualiza donde corresponde.
La lista definitiva se documentará antes de modificar los clientes HTTP.

Respuestas JSON en camelCase con campos concretos. Error uniforme con timestamp,
status, error, message, path y validationErrors. Estados esperados: 201 en altas,
400 en formato/validación, 401 sin autenticación, 403 sin permiso, 404 inexistente,
409 conflicto y 413 archivo excesivo. El 500 queda para errores inesperados.

La conservación temporal de rutas antiguas solo procede si aparece un consumidor
externo real. No se mantienen dos contratos por defecto ni se cambia una ruta
sin actualizar su consumidor y sus pruebas.

## Seguridad y consistencia de negocio

Se adapta AuthenticationManager, UserDetailsService y BCrypt al esquema real.
No se copia la relación muchos-a-muchos de roles de PharmaSoft si Karely tiene
un único ID_ROL. Los permisos se derivan de roles de Karely y se verifican en el
backend. Se conserva la revocación de sesiones, el bloqueo por intentos y la
protección del último administrador; sus reglas se prueban explícitamente.

No se confunde quitar comentarios con quitar configuración necesaria. Las
credenciales siguen fuera del código y no se modifica una contraseña existente.

Se preserva el orden de bloqueos y la identidad Oracle de quien actúa. Las
transacciones deben considerar los COMMIT internos de PL/SQL: @Transactional
no revierte una operación que Oracle ya confirmó. Cada caso se verificará en
un esquema de pruebas antes de afirmar atomicidad o concurrencia correctas.

JPA y JDBC usarán un único DataSource y una coordinación transaccional común.
Las llamadas a procedimientos usarán la conexión asociada a la transacción
activa; se probará la integración real del gestor transaccional con el acceso
JDBC y CLIENT_IDENTIFIER. Se hará flush antes de procedimientos que dependan
de cambios JPA pendientes, y refresh o clear después cuando modifiquen datos
ya cargados en el EntityManager. Se documentará cada COMMIT interno y se
verificará que ninguna respuesta use entidades desactualizadas.

## Migración y verificación

1. Inventariar todas las rutas, cuerpos, respuestas, permisos y llamadas PL/SQL.
   La matriz fijará nombres concretos de permisos de Karely y DTO por operación,
   manteniendo las restricciones de acceso a los registros del médico autenticado.
2. Conservar una copia o rama de la versión actual. No modificar `ejemplo` ni PDF.
3. Establecer contratos y errores tipados, y comprobar mapeos contra Oracle.
4. Migrar autenticación, permisos y layout de forma coordinada.
5. Migrar catálogos y pacientes como primer recorrido completo.
6. Migrar doctores, documentación y disponibilidad.
7. Migrar citas, atención y finanzas preservando reglas y transacciones.
8. Reemplazar pruebas dependientes de la estructura antigua por pruebas de los
   contratos nuevos, manteniendo los casos funcionales y los defectos corregidos.
9. Ejecutar compilación y suites completas de backend y frontend; comprobar
   navegador y, cuando exista acceso, Oracle con datos de prueba.
10. Actualizar README, trazabilidad y guía PDF para que describan el código final.

No se publican cambios en GitHub en esta fase de diseño. La migración se
considera completa solo cuando los contratos tipados se usan de extremo a
extremo y todas las referencias antiguas se han retirado o justificado.

## Criterios de aceptación

- Estructura frontend equivalente al ejemplo, con uso real de cada capa.
- Modelos TypeScript y DTO Java concordantes, sin Row/any/Map en los contratos.
- Formularios reactivos, rutas lazy, layout separado y seguridad por permisos.
- Entidades y repositorios tipados usados; PL/SQL preservado donde corresponde.
- Pruebas de validación, permisos, conflictos, sesión y flujos de cada módulo.
- Ningún dato real eliminado ni esquema recreado durante la reorganización.
- Diferenciar pruebas simuladas, H2 y Oracle; no acreditar una con la otra.
- Documentación final y guía de estudio correspondientes a la arquitectura real.

## Pendiente de acordar

Confirmar la propuesta híbrida JPA + procedimientos Oracle y la migración
coordinada de contratos. Para pruebas Oracle se necesitará un esquema de pruebas
accesible y metadatos reales; su ausencia no se suplirá inventando resultados.

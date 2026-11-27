# Auditoría técnica de Karely

Fecha: 23 de noviembre de 2026.

## Alcance y criterio

Revisión del código local del backend Spring Boot, frontend Angular y configuración Oracle, comparados con `ejemplo/PharmaBackend` y la organización por capas y módulos acordada. Este informe registra evidencias técnicas; no sustituye la rúbrica oficial ni certifica la aceptación del docente.

Los cambios locales pendientes forman parte del estado revisado. El informe no presupone que estén publicados en GitHub ni que los scripts SQL hayan sido ejecutados en la base de datos del usuario.

## Arquitectura actual

```text
frontend/src/app/
  core/                  Autenticación, permisos, interceptores y utilidades
  features/              Funcionalidad por módulos
  layout/                Encabezado, menú y estructura principal
  shared/                Componentes y directivas reutilizables

backend/src/main/java/pe/edu/karely/
  config/
  controller/{modulo}/
  dto/{modulo}/
  entity/
  exception/
  mapper/
  repository/{modulo}/
  security/
  service/
    service/{modulo}/    Interfaces
    impl/{modulo}/       Implementaciones
```

Módulos funcionales: administración, autenticación, pacientes, doctores, catálogos, citas, atención médica, finanzas y reportes. El frontend también cuenta con inicio; el backend incluye salud del sistema.

La nomenclatura de carpetas no es completamente uniforme: algunos DTO usan singular (`doctor`, `paciente`, `cita`, `catalogo`, `reporte`) y otras capas utilizan plural. Los DTO generales de operación y error, OracleJdbc, entidades, mappers y clases transversales permanecen compartidos.

Los módulos son paquetes de una aplicación; no son microservicios independientes. La arquitectura C4 está documentada en [workspace.dsl](arquitectura/workspace.dsl).

## Conformidad con el ejemplo

| Aspecto | Estado observado |
| --- | --- |
| Separación Controller, DTO, Service, implementación y Repository | Presente |
| Interfaces y clases impl independientes dentro de service | Presente |
| Organización por módulos dentro de las capas reorganizadas | Presente |
| Autenticación gestionada por el manejador global | Presente mediante AuthenticationException |
| Formato completo de errores | Implementado |
| Recolección de errores de todos los campos inválidos | Implementada mediante getFieldErrors |
| Repositorios idénticos a la plantilla | No: la plantilla usa JpaRepository; Karely combina EntityManager y JDBC |
| Conversión de entidad a DTO en el mismo lugar que la plantilla | No completamente: Karely también convierte en repositorios mediante mappers |
| Códigos HTTP de reglas de negocio | No idénticos: el ejemplo utiliza 409 para ReglaNegocioException; Karely mantiene 400 para ese manejador |

La separación general sigue la arquitectura por capas. No corresponde afirmar que toda la implementación replica literalmente la plantilla del profesor.

## Flujo de una operación

1. El componente Angular recoge datos y valida el formulario.
2. El servicio Angular realiza la petición HTTP y el interceptor adjunta el token cuando corresponde.
3. Spring Security verifica autenticación y los servicios comprueban permisos.
4. El controlador recibe el DTO y activa las validaciones declaradas.
5. La implementación del servicio ejecuta reglas de negocio y coordina la transacción.
6. El repositorio consulta o modifica Oracle mediante JPA/JDBC y procedimientos.
7. La respuesta se devuelve al frontend; una excepción controlada genera un error uniforme.

## Errores y validaciones

`dto/ErrorResponseDTO.java` contiene `timestamp`, `status`, `error`, `message`, `path` y `validationErrors`.

`exception/GlobalExceptionHandler.java` reúne los errores de campos en un mapa. El formulario Angular presenta un único aviso con los mensajes reunidos mediante `core/utils/http-error.ts`, sin introducir una alerta por cada campo.

Las respuestas de seguridad configuradas en SecurityConfig utilizan el mismo DTO. Las validaciones añadidas a doctores, pacientes y usuarios comprueban obligatoriedad, longitudes y correo. Los campos obligatorios rechazan entradas compuestas solo por espacios. El nacimiento futuro se rechaza en el DTO de paciente y en su formulario.

Las reglas de permisos, aprobación manual de documentos y disponibilidad permanecen en servicios y base de datos. No se ha certificado que cada regla posible de todos los módulos esté cubierta por validaciones o pruebas.

## Seguridad y datos

- Contraseñas almacenadas con BCrypt.
- Autenticación con JWT y sesión persistida; duración configurable del token, con valor predeterminado de 60 minutos.
- Roles y permisos verificados en backend y navegación restringida en frontend.
- Control de intentos fallidos y recuperación mediante enlace temporal de un uso.
- Recuperación con vencimiento configurable, por defecto de 15 minutos, y envío SMTP cuando está habilitado.
- Documentación del doctor almacenada como BLOB y sometida a revisión manual.
- Consulta DNI externa opcional, configurable y realizada desde el backend.
- Credenciales de infraestructura suministradas mediante variables de entorno.

La presencia de estos controles no equivale a una auditoría de penetración ni a una certificación de seguridad.

## Verificaciones realizadas

| Verificación | Evidencia disponible |
| --- | --- |
| Suite backend ejecutada en esta sesión | 124 pruebas, 0 fallos, 0 errores |
| Validaciones de formularios backend | ValidacionFormulariosTest: 3 pruebas correctas |
| Formato de errores | ErrorFormatoTest comprueba metadatos, ruta y varios campos inválidos |
| Compilación Angular | npm.cmd run build finalizó correctamente tras los cambios de validación |
| Utilidad de mensajes frontend | 3 comprobaciones directas correctas: agrupación, mensaje de autenticación y formulario |
| Modelo C4 | Bloques y referencias del DSL comprobados; pendiente validación con Structurizr |

Los reportes Maven se encuentran en `backend/target/surefire-reports/`. Estos son resultados de ejecuciones previas de esta sesión, no una nueva ejecución provocada por la escritura del informe.

No se realizó en esta revisión una prueba completa de navegador, envío SMTP real, consulta DNI real ni ejecución de todas las operaciones contra Oracle de producción. Las pruebas automatizadas incluyen simulaciones y bases H2, por lo que no sustituyen esas verificaciones.

## Hallazgos y pendientes

| Código | Prioridad | Hallazgo | Acción sugerida |
| --- | --- | --- | --- |
| AUD-01 | Alta | Existen cadenas con caracteres dañados, como `mÃ¡ximo`, en mensajes del backend | Corregir codificación UTF-8 y verificar textos de respuestas y correos |
| AUD-02 | Media | Persistencia y conversión DTO difieren de la plantilla | Acordar si el profesor exige JpaRepository y conversión en ServiceImpl antes de refactorizar |
| AUD-03 | Media | ReglaNegocioException mantiene estado 400, mientras el ejemplo utiliza 409 | Unificar criterio con la guía y actualizar pruebas/consumidores si se decide cambiar |
| AUD-04 | Media | Carpetas DTO con singular y otras capas con plural | Homogeneizar únicamente paquetes e imports en una tarea independiente |
| AUD-05 | Media | Hay cambios locales y archivos sin seguimiento en los repositorios | Revisar el diff, seleccionar archivos de entrega y realizar commit/push autorizado |
| AUD-06 | Media | Flujo integral con Oracle y servicios externos pendiente de comprobar en este alcance | Probar registro, documentos, citas, atención, pagos y recuperación en el entorno de demostración |
| AUD-07 | Baja | El árbol local frontend vuelve a contener un archivo auth-service.spec.ts, además de coverage y .scannerwork | Revisar su origen y decidir qué pruebas y artefactos deben versionarse; no se eliminaron en esta auditoría |
| AUD-08 | Baja | Validación oficial del workspace.dsl pendiente | Importar o validar el archivo con Structurizr |

## Comandos de comprobación

Desde `backend`:

```powershell
.\mvnw.cmd test
```

Desde `frontend`:

```powershell
npm.cmd run build
```

En cada repositorio antes de publicar:

```powershell
git status --short
git diff --check
git diff
```

## Resultado

La aplicación dispone de separación por capas y módulos, errores estructurados y validaciones reforzadas en los formularios revisados. Las verificaciones automatizadas citadas pasaron. La equivalencia literal con la plantilla y la aceptación funcional integral requieren resolver o comprobar los pendientes indicados.

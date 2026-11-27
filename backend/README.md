# Backend Karely: arquitectura y esquema Oracle

Adaptación a los scripts Oracle 19c S1-S8 suministrados por el usuario.
La instalación confirmada por el usuario es ORCL no-CDB, esquema KARELY_BD2.

## Capas

- controller: 15 recursos REST; reciben DTO validados y responden JSON camelCase.
- dto: contratos específicos por dominio, sin ApiInput ni mapas como API pública.
- entity: 24 entidades JPA del esquema original y TokenRecuperacion para recuperar contraseñas.
- mapper: conversiones entre entidades y DTO de pacientes, doctores y catálogos.
- repository: operaciones JPA para CRUD apropiados y consultas/procedimientos JDBC tipados.
- service/service: interfaces; service/impl: reglas, coordinación y transacciones.
- exception: errores uniformes y manejo central; security: JWT, sesión y permisos.
- config: CORS, OpenAPI, comprobación de esquema y creación administrativa opcional.

Los procedimientos conservan las reglas clínicas y financieras del esquema.
OracleJdbc usa la conexión vinculada a la transacción y establece/limpia
CLIENT_IDENTIFIER alrededor de cada llamada. Los esquemas y tablas no se recrean:
Hibernate tiene ddl-auto=validate y la inicialización SQL está desactivada.

La recuperación conserva AuthController y las mismas capas. Antes de arrancar
esta versión, aplicar manualmente la migración incremental indicada en
[la guía de recuperación](../docs/RECUPERACION_PASSWORD.md). El esquema queda
con 24 tablas originales y una tabla adicional; el código no ejecuta ese DDL.

## Controllers

| Controller | Recurso / responsabilidad |
|---|---|
| PacienteController | /api/v1/pacientes |
| DoctorController | /api/v1/doctores, documentación, especialidades asignadas y disponibilidad |
| EspecialidadController | /api/v1/especialidades |
| ConsultorioController | /api/v1/consultorios |
| FranjaHorariaController | /api/v1/franjas |
| CitaController | /api/v1/citas, reservas, confirmación, asistencia y reprogramación |
| AtencionMedicaController | /api/v1/atenciones, diagnóstico, receta, medicamentos y recibo |
| LiquidacionController | /api/v1/liquidaciones, pagos efectivos y saldo del doctor |
| UsuarioController | /api/v1/usuarios y roles |
| ParametroSistemaController | /api/v1/parametros |
| NotificacionController | /api/v1/notificaciones |
| AuditoriaController | /api/v1/auditoria |
| ReporteController | /api/v1/reportes, ingresos y consultas agregadas |
| AuthController | /api/v1/auth |
| HealthController | /api/v1/health |

Los ID en /atenciones/{idCita} identifican la cita, no el ID de atención.
No hay controller por cada tabla dependiente. Tampoco hay controllers separados
para documentos, ganancias, ingresos u horarios del doctor.

## Finanzas

LIQUIDACION representa un pago efectivo, total o parcial, registrado por tesorería.
POST /api/v1/liquidaciones requiere idDoctor, fechaInicio, fechaFin, monto,
metodoPago, numeroOperacion y numeroBoleta. Se delega en SP_PAGAR_DOCTOR con su
firma nueva. No se crean deudas preliminares ni registros en PAGO_DOCTOR.
GET /api/v1/liquidaciones/saldo recibe idDoctor y fechaCorte.
Los ingresos se consultan de VW_INGRESOS_GESTORA usando fechaCita.
Los pagos no tienen endpoints de modificación o eliminación.

## Ejecución y comprobación

Requiere JDK 21. Definir DB_PASSWORD y APP_JWT_SECRET fuera del código.
DB_URL predeterminado: jdbc:oracle:thin:@//localhost:1521/orcl.
DB_USERNAME predeterminado: KARELY_BD2.

Desde backend:

    .\mvnw.cmd test
    .\mvnw.cmd spring-boot:run

El script iniciar-backend.ps1 solicita las credenciales. La opción InicializarAdmin
se mantiene para un esquema sin cuenta administrativa, sin contraseñas fijas.
OpenAPI: /swagger-ui.html. Los scripts históricos db/COMPLETAR_BACKEND_FREEPDB1.sql
no corresponden al esquema nuevo y no deben ejecutarse para esta adaptación.

## Verificación y límites

Las pruebas incluyen HTTP/validación, permisos, JWT, documentación y firmas PL/SQL;
el modelo JPA se comprueba con H2 en modo Oracle. H2 no acredita la compatibilidad
exacta de los tipos ni la ejecución de procedimientos en Oracle 19c.
No se ejecutó DDL ni se modificaron usuarios o datos de Oracle durante el trabajo.
El arranque real con ddl-auto=validate y los flujos de negocio deben comprobarse
con la conexión del usuario. La revisión funcional amplia y el login siguen siendo
la etapa posterior acordada; el comportamiento de autenticación existente se conserva.

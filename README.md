
> Actualización de arquitectura BD24: consultar backend/README.md. Los contratos REST ahora usan recursos y DTO camelCase; las instrucciones y ejemplos históricos inferiores pueden describir rutas anteriores. No ejecutar el instalador histórico de db sobre el nuevo esquema.

# KARELY — Proyecto actualizado a LP2 / PHARMADB

**Versión corregida v3 para integración y validación local** · 27 de octubre de 2026

Aplicación del centro médico Karely's. Partimos de `karely.zip_expanded.zip` del ciclo anterior (Spring MVC + Thymeleaf, HTML, CSS e imágenes) y migramos a una **SPA Angular 22 + REST Spring Boot 4.0.7, Java 21, Oracle 19c**. El diseño conserva la paleta azul, el logo, los íconos, imágenes y estructura de navegación original; las pantallas ahora consumen datos reales desde `/api/v1`.

> **NO ejecutar los scripts de creación de 24 tablas otra vez.** Esta aplicación usa el esquema existente `KARELY_BD2`, sus procedimientos PL/SQL, las seis vistas y particiones ya creadas. No usa `ddl-auto=create` ni migraciones que modifiquen el esquema.

## 1. Estructura del proyecto

```text
karely_moderno/
├─ backend/                  Java 21, Spring Boot 4.0.7, Maven, Oracle JDBC, BCrypt + JWT
│  ├─ src/main/java/pe/edu/karely/
│  │  ├─ config/              CORS, Security, comprobación de esquema, bootstrap admin
│  │  ├─ controller/          Auth, operaciones REST, usuarios, documentos
│  │  ├─ service/             Interfaces
│  │  ├─ service/impl/         Lógica de coordinación y permisos por rol
│  │  ├─ repository/          SQL parametrizado y PL/SQL transaccional
│  │  ├─ dto/                 Entrada validada
│  │  ├─ entity/              Entidades JPA del esquema de 24 tablas
│  │  └─ security/            JWT HMAC-SHA256, verificación de sesión y roles
│  ├─ src/main/resources/application.yaml
│  ├─ iniciar-backend.ps1
│  └─ .env.example
├─ frontend/                 Angular 22 standalone, rutas protegidas, HttpClient
│  ├─ src/app/               Inicio, login, pacientes, médicos, citas, finanzas,
│  │                         panel médico y administración
│  ├─ public/img/            Imágenes originales SIN modificaciones
│  ├─ public/css/            Hojas CSS originales SIN modificaciones
│  ├─ public/js/             JS histórico (referencia; no cargado por Angular)
│  ├─ proxy.conf.json        /api → http://localhost:8080
│  └─ iniciar-frontend.ps1
├─ legacy-original/          Templates HTML, CSS, JS e imágenes del proyecto original
├─ db/                       Contrato API-PL/SQL y consultas de validación
└─ docs/                     Pruebas, pendientes, matriz de correspondencia
```

## 2. Requisitos de ejecución en Windows

- **Java JDK 21** (`java -version`).
- Maven Wrapper (`backend/mvnw.cmd`), que podrá descargar Maven si no está instalado; necesita conexión a internet la primera vez.
- **Node.js compatible con Angular 22**: 22.22.3+, 24.15.0+ o 26.0+. `node -v`. No basta Node 22.16.
- Oracle Database 19c en ejecución y accesible desde el equipo.
- El esquema `KARELY_BD2` con las **24 tablas**, procedimientos de los pasos 14–22, vistas del paso 23 y particiones del paso 25.
- El rol `ADMINISTRADORA` creado en `ROL` (paso 13).

## 3. Conexión a Oracle

1. Abrir SQL Developer con el usuario `KARELY_BD2`.
2. Ejecutar `db/CONSULTAS_VERIFICACION.sql`; resolver cualquier `INVALID`.
3. Tomar **host, puerto y nombre de servicio** de la conexión **KARELY_BD2**, no del proyecto anterior `PROYECTOBD`.
4. Definir en backend:

   - `DB_URL=jdbc:oracle:thin:@//HOST:PUERTO/SERVICIO`
   - `DB_USERNAME=KARELY_BD2`
   - `DB_PASSWORD` (introducir en el entorno, no en Git)
   - `APP_JWT_SECRET` (cadena aleatoria de al menos 32 caracteres)
   - Opcional: `APP_FRONTEND_ORIGIN=http://localhost:4200`

La URL de ejemplo `jdbc:oracle:thin:@//localhost:1521/ORCLPDB` corresponde al patrón PHARMADB y **podría no coincidir** con tu nueva instancia; compruébalo en SQL Developer.

La forma más sencilla en PowerShell es (el script compila ANTES de pedir credenciales):

```powershell
cd backend
.\iniciar-backend.ps1 -Servicio ORCLPDB -Puerto 1521
```

Reemplaza **ORCLPDB y 1521** por el servicio y puerto reales de tu conexión Oracle.

### Primera cuenta administradora

Si `USUARIO` aún no contiene ninguna cuenta `ADMINISTRADORA` activa, inicia **una sola vez**:

```powershell
.\iniciar-backend.ps1 -Servicio ORCLPDB -Puerto 1521 -InicializarAdmin
```

El script solicitará nombre, correo y contraseña inicial; el backend guardará solo el **hash bcrypt**. Después quita `-InicializarAdmin` y usa el formulario de login. Si ya existe administradora activa, el bootstrap no modifica su cuenta.

La cuenta `KARELY_BD2` es **usuario del esquema Oracle**, distinta a los usuarios de la aplicación que inician sesión desde la web.

## 4. Iniciar frontend

En **otra terminal PowerShell**:

```powershell
cd frontend
npm.cmd install
npm.cmd start
```

O ejecuta `frontend/iniciar-frontend.ps1`. Abre **http://localhost:4200**.

Angular tiene un proxy `/api` hacia **http://localhost:8080**. Para despliegue de producción necesitarás un proxy inverso que enrute `/api/` al backend y sirva `frontend/dist/` por HTTPS.

## 5. Rutas de la interfaz

| Página | Ruta | Rol |
|---|---|---|
| Login original adaptado | `/login` | Público |
| Inicio / módulos | `/home` | Sesión autenticada |
| Gestión de pacientes y admisión | `/pacientes` | Administradora, Recepcionista |
| Médicos, documentos, horarios | `/doctores` | Administradora, Recepcionista (operaciones privilegiadas: Admin) |
| Pre-reservas, cobros confirmados, gestión y cambios | `/citas` | Administradora, Recepcionista, Cajera |
| Ingresos, liquidaciones y pagos | `/finanzas` | Administradora, Tesorera (pagos: Tesorera) |
| Consultas, recetas y horarios del médico | `/doctor` | Doctor |
| Cuentas, parámetros y catálogos | `/admin` | Administradora |

Los permisos se vuelven a verificar en el **backend**, no se basan únicamente en esconder botones.

## 6. API REST

- `POST /api/v1/auth/login` devuelve JWT.
- `GET /api/v1/auth/me` devuelve usuario actual sin `PASSWORD_HASH`.
- `POST /api/v1/auth/logout` invalida la sesión registrada en Oracle.
- Los recursos REST están organizados por módulo: `/api/v1/pacientes`, `/api/v1/doctores`, `/api/v1/citas`, `/api/v1/atenciones`, `/api/v1/liquidaciones`, `/api/v1/usuarios`, `/api/v1/parametros`, `/api/v1/notificaciones` y `/api/v1/reportes`.
- Los catálogos se exponen en `/api/v1/especialidades`, `/api/v1/consultorios`, `/api/v1/franjas` y `/api/v1/catalogos/dni`.
- La carga y consulta de documentos médicos forma parte del recurso `/api/v1/doctores`.
- `GET /api/v1/health`: salud básica de API. No prueba por sí sola la BD.

Véase `db/CONTRATO_API_PL_SQL.md` para la correspondencia entre endpoints actuales y rutinas Oracle.

## 7. Decisiones de arquitectura

Los controladores, servicios y repositorios están organizados por dominio. Consulta la [matriz de los 22 casos de uso](docs/Arquitectura_y_trazabilidad.md).

- `@Transactional` controla `COMMIT`/`ROLLBACK`; los procedimientos de Karely no hacen `COMMIT` salvo el mantenimiento programado.
- `OracleJdbc.call()` ejecuta `DBMS_SESSION.SET_IDENTIFIER` y `CLEAR_IDENTIFIER` sobre la conexión de la transacción; **el usuario autenticado proviene del JWT verificado**, nunca del cuerpo HTTP.
- Se usa `JdbcTemplate/CallableStatement` para aprovechar los **procedimientos Oracle existentes**. No se usa JPA para recrear la DDL; se mantienen proyecciones de dominio en `entity/`.
- Se usa BCrypt para contraseñas de usuarios de la web; JWT HS256 con expiración y validación de la sesión de Oracle.
- Las contraseñas de Oracle y secreto JWT no están hardcodeados. El proyecto original llevaba una conexión distinta; queda aislado como referencia de diseño, no como código de ejecución.
- Ninguna página incrusta SQL ni conecta directamente a Oracle. El navegador se comunica con backend sobre `/api/v1`.

## 8. Limitaciones y pasos necesarios antes de producción

1. **Pruebas reales pendientes:** desde este entorno no se dispone de tu instancia Oracle ni de las dependencias Maven/npm, por lo que no se pudo certificar la compilación integrada ni el uso de los procedimientos instalados. Ejecutar `mvnw.cmd test`, `npm install`, `npm run build`, y el plan `docs/PRUEBAS_MANUALES.md`.
2. **Pagos:** el formulario `cita-confirmar` registra un cobro aprobado tras verificación externa. La pasarela bancaria/POS real **no está integrada**.
3. **Correo:** existe un trabajador SMTP opcional (`MailQueueWorker`), deshabilitado por defecto. Solo transmite mensajes reales al configurar un servidor SMTP, un operador con rol administradora y `APP_MAIL_ENABLED=true`. Su envío no puede comprobarse aquí y admite reintentos al menos una vez.
4. **Regla contradictoria:** cancelaciones tras reprogramación (RN27/RES14) requieren aprobación del negocio; la operación existe en backend, no se muestra como acción cotidiana.
5. **Infraestructura:** no hay HTTPS, despliegue, backups ni monitoreo certificados.
6. **Seguridad:** antes de producción, usar cuenta Oracle de mínimos privilegios en vez del propietario `KARELY_BD2`, protección avanzada de documentos, control de acceso clínico, rotación de JWT e integración con proveedor de pagos/correos.
7. **Diseño:** los CSS e imágenes originales se conservan exactamente; las vistas HTML antiguas están en `legacy-original/`. Al cambiar Thymeleaf por componentes Angular se rehicieron estructuras interactivas; verificar visualmente el resultado por pantalla para ajustar fidelidad fina.
8. **Cobertura:** la presencia de controladores no certifica el cumplimiento de los 112 RF, 27 RN y 19 RNF. Se necesita cotejo requisito por requisito.

## 9. Fuente original

Los 8 HTML, 8 CSS, JS e imágenes de la aplicación entregada están en `legacy-original/`. Se pueden comparar directamente con las nuevas vistas Angular sin modificar los diseños de referencia.

## 10. Correo SMTP (opcional)

Para activar el worker de `NOTIFICACION_SALIENTE` se deben establecer **todas** estas variables (nunca escribir credenciales SMTP en el código):

```text
APP_MAIL_ENABLED=true
APP_MAIL_OPERATOR_ID=<ID_USUARIO de cuenta ADMINISTRADORA activa>
APP_MAIL_FROM=<correo verificado por el proveedor>
MAIL_HOST=<servidor SMTP>
MAIL_PORT=587
MAIL_USERNAME=<usuario SMTP>
MAIL_PASSWORD=<contraseña o clave específica de aplicación>
```

El trabajo periódico sigue el protocolo del paso 22 (reclamar, confirmar, enviar y registrar resultado). Por defecto queda deshabilitado y las notificaciones continúan visibles como `PENDIENTE`. Para producción comprobar TLS, reputación del dominio, destinatarios, proveedor y políticas de privacidad.


## 11. Correcciones incluidas en v3

- `SecurityConfig.java`: importa y usa `AuthFilter` correctamente; se crea dentro de la cadena de Spring Security, sin doble registro Servlet.
- `AuthFilter.java`: no se declara `@Component` (no se registra dos veces como filtro).
- `ExceptionHandlerApi.java`: devuelve 401/403 al usuario en vez de convertir errores de autenticación en 500.
- `SchemaCheck.java`: comprueba por nombre las 24 tablas, las seis vistas y las rutinas PL/SQL válidas. **No crea ni altera el esquema Oracle**.
- `BootstrapAdmin.java`: se ejecuta después del diagnóstico de esquema.
- `backend/iniciar-backend.ps1`: compila antes de pedir secretos; verifica el código de salida y elimina las variables sensibles cuando finaliza.
- `frontend/iniciar-frontend.ps1`: usa `npm.cmd` para evitar el error de política de ejecución de PowerShell.
- `docs/CAMBIOS_V3_Y_PRUEBAS.md`: pasos de reemplazo sin afectar las tablas y comprobaciones reproducibles.

**Limitación de verificación**: La compilación Maven / Angular NO se ejecutó en el entorno que produjo el ZIP porque no hay acceso a Maven Central ni a npm y no está disponible la instancia Oracle del usuario. Se realizaron comprobaciones estáticas de archivos, símbolos y consistencia de los contratos API/PLSQL; se requiere ejecutar los comandos de prueba en Windows.


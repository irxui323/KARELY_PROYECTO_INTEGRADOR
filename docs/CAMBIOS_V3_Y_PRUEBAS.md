# KARELY LP2 — Actualización integral v3 / guía Windows

## Sustitución segura de la versión anterior

1. **No ejecutes los scripts SQL que crean las tablas.** Tus 29 tablas y particiones se mantienen tal cual en Oracle.
2. Detén los procesos de Java y Angular anteriores con `Ctrl+C`.
3. Conserva la carpeta anterior como respaldo. Extrae `KARELY_LP2_PHARMADB_CORREGIDO_v3.zip` a una **carpeta NUEVA**, no encima de los archivos antiguos.
4. En Windows, usa PowerShell dentro de `karely_moderno/backend`.
5. Verifica Java: `java -version` (JDK 21 recomendado; JDK 22 puede compilar usando `--release 21`).
6. Compila sin dar contraseñas: `./mvnw.cmd -DskipTests compile`.
7. Si aparece `BUILD SUCCESS`, inicia con tu puerto/servicio reales:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\iniciar-backend.ps1" -Servicio FREEPDB1 -Puerto 1521 -InicializarAdmin
```

`FREEPDB1` y `1521` son solo ejemplos. Usa exactamente los valores de SQL Developer. `-InicializarAdmin` es opcional: solo si aún NO existe una cuenta administradora en la aplicación.

8. Abre una SEGUNDA ventana PowerShell en `karely_moderno/frontend`:

```powershell
npm.cmd install
npm.cmd run build
npm.cmd start
```

9. Backend: <http://localhost:8080/api/v1/health>. Frontend: <http://localhost:4200/login>.
10. Inicia sesión con la cuenta de la **aplicación** (`administradora`), **no** con el usuario técnico `KARELY_BD2`.

## Si la compilación falla

- Copia las líneas bajo `COMPILATION ERROR` o `ERROR` y el nombre del archivo. No es necesario enviar contraseñas.
- Si el error contiene `ORA-`, revisa que la conexión `KARELY_BD2` use el mismo puerto y servicio que SQL Developer, y que estén presentes los pasos PL/SQL y vistas.
- Si falla `npm.ps1`, usa **`npm.cmd`** en PowerShell.
- La verificación `/health` responde si el backend arrancó; no sustituye las pruebas por módulos ni garantiza un cobro bancario real.

## Cambios técnicos de v3

| Archivo | Corrección |
|---|---|
| SecurityConfig.java | Filtro JWT insertado solo dentro de la cadena de seguridad |
| AuthFilter.java | Elimina el registro automático de filtro en el contenedor Servlet |
| ExceptionHandlerApi.java | Mantiene los estados HTTP para login y permisos |
| SchemaCheck.java | Detecta ausencia de tablas, vistas o procedimientos por nombre |
| BootstrapAdmin.java | Verificación de esquema antes del alta inicial |
| iniciar-backend.ps1 | Compilación previa a las credenciales y gestión de fallos |
| iniciar-frontend.ps1 | Invoca npm.cmd para evitar la política npm.ps1 |
| README.md | Instrucciones ajustadas a la versión corregida |

## Qué está verificado y qué no

- **Verificación estática:** estructura de fuentes, uso de AuthFilter, API vs PL/SQL, preservación de HTML/CSS/imágenes originales, integridad ZIP.
- **No verificado en este equipo:** compilación de Maven (dependencias no disponibles), `npm install / npm run build` (sin registro npm), conexión a tu base Oracle, operación integral multiusuario.
- **Pendiente para producción:** pasarela bancaria, facturación legal, correos SMTP configurados, pruebas de seguridad y requisitos no implementados por el backend.

## No repetir el alta inicial

Si ya se creó la cuenta de la aplicación, omite `-InicializarAdmin`. Tu contraseña de Oracle es **distinta** de la contraseña de la administradora web. No las incluyas en capturas ni las guardes en el repositorio.

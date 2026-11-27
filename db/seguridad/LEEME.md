# Usuarios roles y privilegios Oracle

Orden con F5 en la misma PDB del proyecto (no CDB$ROOT):

1. SYSTEM: 01_SYSTEM_USUARIOS_ROLES.sql. Pide seis claves NUEVAS, una por cuenta.
2. KARELY_BD2: 02_KARELY_PRIVILEGIOS.sql. Crea vistas filtradas, entradas de procedimientos y grants.
3. SYSTEM: 03_SYSTEM_REDACT.sql. Crea cinco politicas DBMS_REDACT y concede lectura de sus vistas de demostracion.
4. SYSTEM: 04_SYSTEM_VERIFICAR.sql.
5. Cada cuenta nueva: 05_PROBAR_ACCESOS.sql.
6. auditor.karely y luego admin01: 06_PROBAR_REDACT.sql.

Estos SQL son autocontenidos, sin @@ ni rutas relativas. No ejecutarlos desde el instalador de modulos.
No se ejecutaron en Oracle en esta entrega. Ejecutar primero en una copia para comprobar roles, redaccion y transacciones.

## Cuentas Oracle

- admin01: KARELY_R_ADMIN.
- dr.marcos.salas: KARELY_R_DOCTOR.
- recepcion.centro: KARELY_R_RECEPCION.
- tesoreria.centro: KARELY_R_TESORERIA.
- auditor.karely: KARELY_R_AUDITOR.
- desarrollo.karely: KARELY_R_DESARROLLO (consulta de estructura, sin DDL en el esquema operativo).

Las cuentas Oracle entre comillas son sensibles a mayusculas. Escribir exactamente el nombre en minusculas al conectar.
Las claves solicitadas son las de Oracle, independientes del login Angular. Usar claves fuertes y no incluir comillas dobles, ampersand ni saltos de linea en estos prompts SQL*Plus.
El archivo 01 se detiene si ya existe alguna cuenta o rol para evitar reutilizar privilegios desconocidos; no borra ni reinicia cuentas.
El usuario Oracle debe coincidir con USERNAME en USUARIO y tener un rol activo para ejecutar operaciones.
Los SQL asumen las cuatro cuentas de aplicacion anteriores existentes (datos actuales).
Para otros doctores crear cuentas Oracle con su USERNAME exacto y conceder KARELY_R_DOCTOR desde SYSTEM.
Los usuarios auditor y desarrollo no requieren cuenta en USUARIO: solo consultan sus vistas autorizadas.

## Permisos

Solo CREATE SESSION como privilegio de sistema; SELECT por objeto; EXECUTE en entradas SP_ORA_* por rol.
Las entradas usan SESSION_USER, resuelven el ID en USUARIO y luego invocan procedimientos existentes con ese actor.
No se concede EXECUTE en FN_ORA_ACTOR ni en procedimientos originales que reciben un ID elegible por el cliente.
Los triggers existentes siguen haciendo auditoria. Las entradas no hacen COMMIT: confirmar con COMMIT o deshacer con ROLLBACK tras revisar.
Oracle proporciona aislamiento de permisos entre los roles. La logica actual comprueba tambien el rol de aplicacion y la propiedad de citas.
No hay privilegios DBA, ANY, EXEMPT REDACTION POLICY, ADMIN OPTION ni GRANT OPTION para estas cuentas.
No se cambia el usuario ni la configuracion JDBC del backend.

## Redaccion

La redaccion se aplica a CINCO VISTAS NUEVAS V_S_RD_*, una por modulo, sin politicas en tablas operativas.
Se usa DBMS_REDACT.FULL como en la sesion docente. No se altera el valor global de FULL.
Administracion con su rol activo y el propietario ven valores originales; auditoria ve redaccion.
SYS o usuarios con EXEMPT REDACTION POLICY omiten la redaccion: no usarlos como prueba de lector.
DBMS_REDACT requiere que Oracle Advanced Security este disponible y autorizado para el entorno.
Si 03 falla por privilegios/disponibilidad, detenerlo y conservar el error; las vistas enmascaradas anteriores siguen disponibles para auditoria.
Las vistas V_S_RD_* no se conceden a lectores antes de que se creen las politicas.
No volver a ejecutar 02 sobre politicas ya instaladas sin revisar el comportamiento de CREATE OR REPLACE VIEW en la version Oracle usada.
La redaccion es demostracion de privacidad de salida; no sustituye grants ni filtrado por filas.

## Alcance

El backend conserva sus flujos de correo/PDF. Una ejecucion PL/SQL directa no genera PDF ni envia Gmail porque eso ocurre en Java.
Los procedimientos originales y tablas operativas no se reemplazan en estos scripts.
No implementa usuarios con DDL sobre produccion: el desarrollo con creacion de objetos requiere un esquema independiente.
Pruebas de escrituras y reglas de negocio deben realizarse con registros preparados y transacciones controladas antes de documentarlas como aprobadas.

## Fuentes

Sesion docente: codigo_licef2vpjg (1).zip, usuarios, privilegios, roles y DATAMASKING.
https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/DBMS_REDACT.html
https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/REDACTION_POLICIES.html


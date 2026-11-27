"""Empaqueta la instalación vigente sin ejecutar SQL ni incluir rutas @@."""
from pathlib import Path
import hashlib, json, re, zipfile

ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).parent/'orclpdb'
OUT.mkdir(exist_ok=True)

def read(path):return (ROOT/path).read_text(encoding='utf-8-sig')
manifest={}
def source(path):
    text=read(path)
    assert not re.search(r'^\s*@',text,re.M),path
    manifest[path]=hashlib.sha256(text.encode('utf8')).hexdigest()
    return '\nPROMPT Fuente: '+path+'\n'+text+'\n'

def guard(user):
    return f'''SET DEFINE OFF
SET SERVEROUTPUT ON SIZE UNLIMITED
WHENEVER OSERROR EXIT FAILURE
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK
DECLARE
BEGIN
    IF USER <> '{user}' OR SYS_CONTEXT('USERENV','CON_NAME') <> 'ORCLPDB' THEN
        RAISE_APPLICATION_ERROR(-20900,'Ejecutar como {user} en ORCLPDB.');
    END IF;
END;
/
'''

def save(name,sql):
    assert not re.search(r'^\s*@',sql,re.M),name
    (OUT/name).write_text(sql,encoding='utf-8-sig')

save('01_SYSTEM_CREAR_USUARIO.sql',guard('SYSTEM')+r'''
-- Rutas confirmadas en la instancia del usuario. No se usa REUSE.
-- Una instalacion existente provoca error antes de crear objetos nuevos.
DECLARE
    v_n NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_n FROM DBA_USERS
    WHERE USERNAME IN ('KARELY_BD2','KARELY_BD2_DESA');
    IF v_n > 0 THEN
        RAISE_APPLICATION_ERROR(-20901,'Todavia existe un usuario Karely. No reinstalar encima.');
    END IF;
    SELECT COUNT(*) INTO v_n FROM DBA_TABLESPACES
    WHERE TABLESPACE_NAME IN ('TBS_KARELY_BD2','TMP_KARELY_BD2');
    IF v_n > 0 THEN
        RAISE_APPLICATION_ERROR(-20902,'Todavia existe un tablespace Karely. Revisar antes de continuar.');
    END IF;
END;
/
SET DEFINE ON
SET VERIFY OFF
ACCEPT KARELY_PWD CHAR PROMPT 'Nueva clave Oracle de KARELY_BD2: ' HIDE

CREATE TABLESPACE TBS_KARELY_BD2
DATAFILE 'C:\Users\Administrator\Downloads\oradata\ORCL\ORCLPDB\TBS_KARELY_BD2_01.DBF'
SIZE 250M AUTOEXTEND ON NEXT 50M MAXSIZE 4G;

CREATE TEMPORARY TABLESPACE TMP_KARELY_BD2
TEMPFILE 'C:\Users\Administrator\Downloads\oradata\ORCL\ORCLPDB\TMP_KARELY_BD2_01.DBF'
SIZE 100M AUTOEXTEND ON NEXT 25M MAXSIZE 2G;

CREATE USER KARELY_BD2 IDENTIFIED BY "&KARELY_PWD"
DEFAULT TABLESPACE TBS_KARELY_BD2
TEMPORARY TABLESPACE TMP_KARELY_BD2 ACCOUNT UNLOCK;
UNDEFINE KARELY_PWD
SET DEFINE OFF
ALTER USER KARELY_BD2 QUOTA 3G ON TBS_KARELY_BD2;
GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, CREATE VIEW,
      CREATE PROCEDURE, CREATE TRIGGER TO KARELY_BD2;

SELECT USERNAME,ACCOUNT_STATUS,DEFAULT_TABLESPACE,TEMPORARY_TABLESPACE
FROM DBA_USERS WHERE USERNAME='KARELY_BD2';
PROMPT PASO 1 TERMINADO. Crear conexion KARELY_BD2 con servicio ORCLPDB.
'''.replace(r'\"','"'))

parts=[guard('KARELY_BD2')]
paths=[f'base de datos/{name}' for name in (
    '01_TABLAS_KARELY.sql','02_COMENTARIOS_INDICES.sql','03_TRIGGERS.sql',
    '04_FUNCIONES_PROCEDIMIENTOS.sql','05_VISTAS_REPORTES.sql')]
paths += [f'db/migraciones/{name}' for name in (
    '2026-11-22-recuperacion-password.sql','2026-11-22-disponibilidad-especialidad.sql',
    '2026-11-22-administradora-acceso-total.sql','2026-11-23-recibo-pdf.sql',
    '2026-11-23-cancelacion-citas-vencidas.sql','2026-11-23-numeracion-liquidaciones.sql')]
paths += ['db/migraciones/2026-11-23-complemento-entregable-bd2.sql']
paths += [f'db/modulos/{i:02}_{name}.sql' for i,name in enumerate(
    ['doctores','citas','pacientes','finanzas','recepcion_seguridad'],1)]
for path in paths: parts.append(source(path))

# Mantener la selección del entregable: 12 reportes y 3 SP clínicos originales.
expo=json.loads(read('db/exposicion/inventario.json'))
parts.append('\nPROMPT Instalando 12 reportes cortos de los otros cuatro modulos.\n')
for x in expo:
    if x['module']!='PACIENTES':parts.append(x['sql'])

parts.append('''
PROMPT Recompilando y comprobando estructura antes de cargar datos.
BEGIN
    DBMS_UTILITY.COMPILE_SCHEMA(schema=>USER,compile_all=>FALSE);
END;
/
SELECT NAME,TYPE,LINE,POSITION,TEXT FROM USER_ERRORS ORDER BY NAME,SEQUENCE;
DECLARE
    v_tablas NUMBER;
    v_invalidos NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_tablas FROM USER_TABLES;
    SELECT COUNT(*) INTO v_invalidos FROM USER_OBJECTS WHERE STATUS='INVALID';
    IF v_tablas <> 25 OR v_invalidos <> 0 THEN
        RAISE_APPLICATION_ERROR(-20903,'Se esperan 25 tablas y cero objetos invalidos. Revisar USER_ERRORS.');
    END IF;
END;
/

-- Administradora de aplicacion necesaria para la carga inicial.
-- Clave WEB inicial del entorno de presentacion: KarelyTest2026!
-- La clave ORACLE es la elegida en 01 y es independiente.
INSERT INTO USUARIO(ID_ROL,USERNAME,CORREO,PASSWORD_HASH,ESTADO,INTENTOS_FALLIDOS)
SELECT ID_ROL,'admin01','admin.karely@example.com',
       '$2a$10$F73MH.M57EzqweWrk7KiCOzvB4z5HTXl7esrODcS5LxjttIftHEvO',
       'ACTIVO',0
FROM ROL WHERE NOMBRE='ADMINISTRADORA';
COMMIT;
''')
seed=source('db/datos_prueba/reinicio/01_cargar_datos_iniciales_reales.sql')
seed=seed.replace('y 3 citas.','y 4 citas.')
parts.append(seed)
parts.append('''
-- Aplicar el mantenimiento vigente a la cita vencida preparada en la carga.
BEGIN
    SP_TAREA_MANTENIMIENTO;
END;
/
BEGIN
    DBMS_STATS.GATHER_SCHEMA_STATS(ownname=>USER,options=>'GATHER AUTO',cascade=>TRUE,degree=>1);
END;
/
SELECT OBJECT_TYPE,COUNT(*) TOTAL FROM USER_OBJECTS
WHERE STATUS='VALID' GROUP BY OBJECT_TYPE ORDER BY OBJECT_TYPE;
SELECT U.USERNAME,R.NOMBRE ROL,U.ESTADO
FROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL ORDER BY R.NOMBRE,U.USERNAME;
SELECT COUNT(*) AS TABLAS FROM USER_TABLES;
SELECT OBJECT_NAME,OBJECT_TYPE,STATUS FROM USER_OBJECTS WHERE STATUS='INVALID';
DECLARE
    v_n NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_n FROM USUARIO WHERE USERNAME='admin01' AND ESTADO='ACTIVO';
    IF v_n<>1 THEN RAISE_APPLICATION_ERROR(-20904,'Falta admin01.'); END IF;
    SELECT COUNT(*) INTO v_n FROM DOCTOR;
    IF v_n<>6 THEN RAISE_APPLICATION_ERROR(-20905,'Se esperan 6 doctores iniciales.'); END IF;
    SELECT COUNT(*) INTO v_n FROM USER_OBJECTS WHERE STATUS='INVALID';
    IF v_n<>0 THEN RAISE_APPLICATION_ERROR(-20906,'Hay objetos invalidos.'); END IF;
    DBMS_OUTPUT.PUT_LINE('PASO 2 TERMINADO: esquema y datos cargados.');
END;
/
''')
save('02_KARELY_ESQUEMA_MIGRACIONES_DATOS.sql','\n'.join(parts))

# Reparación para quien ya cargó los datos y falló al ejecutar el mantenimiento.
# Se publica fuera del ZIP de instalación nueva para evitar reinstalar el esquema.
repair=guard('KARELY_BD2')+'''
-- Aplicar despues del ORA-12899 de AUDITORIA.ACCION, sin repetir el 02.
DECLARE
    v_n NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_n FROM USUARIO WHERE USERNAME='admin01' AND ESTADO='ACTIVO';
    IF v_n<>1 THEN RAISE_APPLICATION_ERROR(-20910,'Falta la carga de admin01; revisar el error anterior.'); END IF;
    SELECT COUNT(*) INTO v_n FROM DOCTOR;
    IF v_n<>6 THEN RAISE_APPLICATION_ERROR(-20911,'La carga inicial no contiene los 6 doctores.'); END IF;
END;
/
'''
repair += source('db/migraciones/2026-11-23-cancelacion-citas-vencidas.sql')
repair += '''
SELECT NAME,TYPE,LINE,POSITION,TEXT FROM USER_ERRORS
WHERE NAME IN ('SP_MARCAR_CITAS_PERDIDAS','SP_TAREA_MANTENIMIENTO')
ORDER BY NAME,SEQUENCE;
DECLARE
    v_n NUMBER;
    v_limite NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_n FROM USER_OBJECTS
    WHERE OBJECT_TYPE='PROCEDURE' AND STATUS='VALID'
      AND OBJECT_NAME IN ('SP_MARCAR_CITAS_PERDIDAS','SP_TAREA_MANTENIMIENTO');
    IF v_n<>2 THEN RAISE_APPLICATION_ERROR(-20912,'Revisar la compilacion de los dos procedimientos.'); END IF;
    SELECT DATA_LENGTH INTO v_limite FROM USER_TAB_COLUMNS
    WHERE TABLE_NAME='AUDITORIA' AND COLUMN_NAME='ACCION';
    IF LENGTHB('CANCELACION_AUTO')>v_limite THEN
        RAISE_APPLICATION_ERROR(-20913,'ACCION es demasiado corta para el evento corregido.');
    END IF;
END;
/
'''
# Reanudar exactamente el mantenimiento, estadísticas y verificaciones pendientes.
repair += parts[-1]
(OUT.parent/'06_KARELY_CORREGIR_MANTENIMIENTO.sql').write_text(repair,encoding='utf-8-sig')

save('03_SYSTEM_ROLES_USUARIOS.sql',guard('SYSTEM')+
     source('db/seguridad/01_SYSTEM_USUARIOS_ROLES.sql')+
     '\nPROMPT PASO 3 TERMINADO. Continuar como KARELY_BD2 con el 04.\n')
save('04_KARELY_PRIVILEGIOS.sql',guard('KARELY_BD2')+
     source('db/seguridad/02_KARELY_PRIVILEGIOS.sql')+
     source('db/seguridad/07_KARELY_REAPLICAR_GRANTS.sql')+
     '\nPROMPT PASO 4 TERMINADO. Continuar como SYSTEM con el 05.\n')
save('05_SYSTEM_REDACT_VERIFICAR.sql',guard('SYSTEM')+
     source('db/seguridad/03_SYSTEM_REDACT.sql')+
     source('db/seguridad/04_SYSTEM_VERIFICAR.sql')+'''
DECLARE
    v_n NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_n FROM DBA_TABLES WHERE OWNER='KARELY_BD2';
    IF v_n<>25 THEN RAISE_APPLICATION_ERROR(-20907,'Se esperan 25 tablas de Karely.'); END IF;
    SELECT COUNT(*) INTO v_n FROM DBA_OBJECTS WHERE OWNER='KARELY_BD2' AND STATUS='INVALID';
    IF v_n<>0 THEN RAISE_APPLICATION_ERROR(-20908,'Hay objetos invalidos en Karely.'); END IF;
    SELECT COUNT(*) INTO v_n FROM REDACTION_POLICIES
    WHERE OBJECT_OWNER='KARELY_BD2'
      AND POLICY_NAME IN ('DMSK_KARELY_DOCTOR','DMSK_KARELY_CITA','DMSK_KARELY_PACIENTE','DMSK_KARELY_PAGO','DMSK_KARELY_USUARIO')
      AND ENABLE='YES';
    IF v_n<>5 THEN RAISE_APPLICATION_ERROR(-20909,'Se esperan 5 politicas de redaccion activas.'); END IF;
    DBMS_OUTPUT.PUT_LINE('INSTALACION COMPLETA: 25 tablas, cero objetos invalidos y 5 politicas activas.');
END;
/
''')

readme=r'''INSTALACION NUEVA KARELY EN ORCLPDB

Abrir cada SQL en SQL Developer. Ejecutar cada archivo COMPLETO con F5.
No pegar el contenido mezclando conexiones. No ejecutar sobre datos existentes.
Los 5 archivos son independientes de rutas externas; no utilizan @ ni @@.

ORDEN OBLIGATORIO
01_SYSTEM_CREAR_USUARIO.sql                    SYSTEM / ORCLPDB
02_KARELY_ESQUEMA_MIGRACIONES_DATOS.sql         KARELY_BD2 / ORCLPDB
03_SYSTEM_ROLES_USUARIOS.sql                   SYSTEM / ORCLPDB
04_KARELY_PRIVILEGIOS.sql                      KARELY_BD2 / ORCLPDB
05_SYSTEM_REDACT_VERIFICAR.sql                 SYSTEM / ORCLPDB

CONEXIONES SQL DEVELOPER
Host: localhost. Puerto: 1521. Nombre de servicio: ORCLPDB. Rol: predeterminado.
En 01 eliges la clave Oracle de KARELY_BD2. Crear su conexion antes del paso 02.
En 03 eliges las claves de las otras seis cuentas ORACLE; son independientes
de las cuentas web. Los nombres Oracle se crean en minusculas entre comillas.

RUTAS DEL PASO 01
C:\Users\Administrator\Downloads\oradata\ORCL\ORCLPDB\TBS_KARELY_BD2_01.DBF
C:\Users\Administrator\Downloads\oradata\ORCL\ORCLPDB\TMP_KARELY_BD2_01.DBF
Son las rutas confirmadas en tu captura. La carpeta debe seguir existiendo.
No se usa REUSE ni se sobrescriben archivos existentes. No crea KARELY_BD2_DESA.

CONTENIDO
25 tablas, indices, restricciones, comentarios, parametros, procedimientos,
funciones, triggers, vistas y migraciones actuales. Incluye recuperacion,
especialidad de disponibilidad, administracion autorizada, PDF de recibos,
cancelacion de vencidas, secuencia de liquidaciones y objetos del entregable.
Pacientes conserva SP_INICIAR_ATENCION, SP_REGISTRAR_DIAGNOSTICO y SP_CREAR_RECETA.
Doctores, Citas, Finanzas y Recepcion/seguridad incorporan sus 12 SP_EXP_ cortos.
Tambien se crean 6 roles Oracle, 6 cuentas de acceso y 5 politicas DBMS_REDACT.

DATOS DE PRESENTACION INCLUIDOS EN 02
6 doctores con archivos ficticios, 8 pacientes, disponibilidad, citas, receta,
recibo y una liquidacion. No equivale a restaurar los datos que borraste.
Las fechas dependen de SYSDATE de Oracle. No se envian correos desde los scripts.
Las direcciones de correo de ejemplo no garantizan recuperacion real.

CUENTAS WEB - CLAVE INICIAL COMUN: KarelyTest2026!
Administradora: admin01
Recepcion: recepcion.centro
Tesoreria: tesoreria.centro
Doctores: dra.elena.rojas, dr.marcos.salas, dra.valeria.torres,
          dr.daniel.castro, dra.sofia.mendoza, dr.renato.paredes
Cambiar las claves al terminar la presentacion. La clave web NO es la de 01.

BACKEND EN ESTA PDB
cd C:\UNIVERSIDAD\LP2\SEMANA11\karely_moderno\backend
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\iniciar-backend.ps1 -Servicio ORCLPDB
Introducir la clave ORACLE elegida en 01. Agregar -CorreoGmail si deseas
configurar SMTP; el inicio solicitara sus credenciales por separado.

VERIFICACION
El paso 05 debe terminar indicando 25 tablas, cero objetos invalidos y cinco
politicas activas. Cada etapa se detiene ante errores SQL; no seguir al archivo
siguiente si aparece ORA-. Los CREATE de Oracle producen commits implicitos.
La preparacion del paquete se verifico de forma estatica; no se ejecuto contra
tu instancia Oracle. La comprobacion real ocurre al ejecutar estos archivos.
'''
(OUT/'LEEME.txt').write_text(readme,encoding='utf-8-sig')
(OUT/'fuentes.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
archive=OUT.parent/'Karely_instalacion_ORCLPDB.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for file in sorted(OUT.iterdir()):
        if file.suffix in ('.sql','.txt','.json'):z.write(file,file.name)
print(json.dumps({'zip':str(archive),'scripts':[p.name for p in sorted(OUT.glob('*.sql'))],
                  'sources':len(manifest)},ensure_ascii=False))

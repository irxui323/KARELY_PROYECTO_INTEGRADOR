from pathlib import Path
from io import BytesIO
import re, json
from reportlab.pdfgen import canvas
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).parent
template=OUT/'10_DATOS_PRACTICA_COMPLETA.sql.in'
schema=(ROOT/'base de datos/01_TABLAS_KARELY.sql').read_text(encoding='utf-8-sig')
tables=re.findall(r'\bCREATE TABLE\s+(\w+)',schema,re.I)+['TOKEN_RECUPERACION']
assert len(tables)==25 and len(set(tables))==25

buf=BytesIO()
c=canvas.Canvas(buf,pagesize=(420,300),invariant=1,pageCompression=1)
c.setTitle('Documento ficticio para practica SQL')
c.setFont('Helvetica-Bold',16)
c.drawString(24,250,'Karely - Documento ficticio')
c.setFont('Helvetica',11)
c.drawString(24,215,'Archivo de ejemplo para consultas BLOB en Oracle.')
c.drawString(24,190,'No corresponde a una identidad o comprobante real.')
c.drawString(24,165,'Material sintetico para ejercicios de base de datos.')
c.save()
pdf=buf.getvalue()
assert len(pdf)<=2000,len(pdf)
assert len(PdfReader(BytesIO(pdf)).pages)==1
sql=template.read_text(encoding='utf8').replace('__PDF_HEX__',pdf.hex().upper())
sql=sql.replace('__TABLE_NAMES__',','.join("'"+t.upper()+"'" for t in tables))
counts='\nUNION ALL\n'.join(
    "SELECT '"+t.upper()+"' AS TABLA,COUNT(*) AS REGISTROS FROM "+t.upper()
    for t in sorted(tables))+'\nORDER BY TABLA;\n'
sql=sql.replace('__TABLE_COUNTS__',counts)
assert not re.search(r'__[A-Z_]+__',sql)
path=OUT/'10_DATOS_PRACTICA_COMPLETA.sql'
path.write_text(sql,encoding='utf-8-sig')

guide=r'''DATOS DE PRACTICA KARELY - ORCLPDB

Ejecutar 10_DATOS_PRACTICA_COMPLETA.sql completo con F5 como KARELY_BD2.
No ejecutar como SYSTEM. Usar una hoja sin transacciones de trabajo pendientes.
El bloque confirma los datos con COMMIT al terminar. En error revierte la carga.
No borra datos anteriores. No usa IDs fijos para las FK; usa RETURNING INTO.
Si vuelves a ejecutarlo, detecta su marca y no duplica la carga.

QUE AGREGA
9 doctores ficticios: 6 activos completos, 1 incompleto, 1 rechazado y 1 inactivo.
Sus usuarios, documentos PDF validos de ejemplo y asociaciones de especialidad.
18 pacientes ficticios, incluidos inactivos y pacientes sin cita.
4 consultorios nuevos; reutiliza o crea franjas sin cambiar las existentes.
18 citas atendidas, con 18 atenciones cerradas, 18 recetas, 36 medicamentos
y 18 recibos con contenido PDF de ejemplo.
18 citas futuras programadas, 1 reprogramada, 2 canceladas, 1 perdida historica,
1 vencida pendiente del mantenimiento, 1 para registrar asistencia y 3 en atencion.
Reservas confirmadas, una bloqueada vigente y una expirada; un pago rechazado.
4 liquidaciones: pagos parciales y pago completo, con otros doctores sin pago.
Notificaciones simuladas, 3 sesiones en diferentes estados y 2 tokens vencidos.
Los roles y parametros operativos ya instalados se conservan; se agrega una
marca de carga en PARAMETRO_SISTEMA. Los triggers generan auditoria.
Al finalizar se comprueba que cada una de las 25 tablas tenga datos.

CLAVE DE LOS NUEVOS USUARIOS DE APLICACION
KarelyTest2026!
Son filas en USUARIO, no cuentas Oracle nuevas. En esta instancia trabajas
desde KARELY_BD2. Los usuarios Oracle limitados previamente instalados siguen
con sus permisos y con los datos que les correspondan por pertenencia.
Todos los nombres, documentos, correos y archivos nuevos son ficticios.
No se envia correo. La cola de ejemplo tiene DESTINATARIO NULL para impedirlo.
Los tokens estan vencidos: no sirven para recuperar una cuenta.

COMO ELEGIR QUE PROBAR
La salida final muestra IDs reales y referencias de pago:
PRACTICA-INGRESO-AHORA: registrar asistencia en los 30 minutos previos al turno.
PRACTICA-CLINICA-INICIO: tiene asistencia, EN_ATENCION, aun sin ATENCION_MEDICA.
PRACTICA-CLINICA-ABIERTA: atencion ABIERTA sin diagnostico ni receta.
PRACTICA-RECETA-PARCIAL: tiene diagnostico y receta; falta emitir/entregar recibo.
PRACTICA-VENCIDA: comprobar que mantenimiento cambia PROGRAMADA a CANCELADA.
PRACTICA-REPROGRAMADA: consultar historial y rechazar segunda reprogramacion.
PRACTICA-FUT-*: reprogramar o consultar agendas.
PRACTICA-AT-*: consultar detalle, medicamentos, recibo y reportes financieros.

ACTOR PARA LOS SP CLINICOS ORIGINALES
Conectado como KARELY_BD2, obtener el ID de admin01 y establecer contexto:

DECLARE
    v_admin NUMBER;
BEGIN
    SELECT ID_USUARIO INTO v_admin FROM USUARIO WHERE USERNAME='admin01';
    DBMS_SESSION.SET_IDENTIFIER(TO_CHAR(v_admin));
    DBMS_OUTPUT.PUT_LINE('ID administrativo: '||v_admin);
END;
/

Usar ese ID en los SP que lo soliciten; el ID de cita se obtiene de las
consultas incluidas. Para probar sin conservar cambios:
SAVEPOINT ensayo;
-- ejecutar la llamada deseada, sin COMMIT dentro de la prueba
ROLLBACK TO ensayo;

EXCEPCION: SP_TAREA_MANTENIMIENTO contiene COMMIT propio; no se revierte
con el SAVEPOINT del llamador. Ejecutarlo solo si deseas persistir vencimientos.
Las secuencias e identidades consumidas tampoco se recuperan por ROLLBACK.
Para terminar la sesion de ensayo:
BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;
/

LIMITES
La carga prepara fixtures directamente; tener filas no demuestra que el flujo
completo de cada SP haya sido probado. Conserva triggers y restricciones.
Los datos se basan en SYSDATE/SYSTIMESTAMP del servidor Oracle al cargar.
La cita de asistencia es util durante su ventana real, no indefinidamente.
Si pasa esa ventana, se debe preparar otra cita antes de probar la recepcion.
Preparacion validada estaticamente; la ejecucion real se comprueba en Oracle.
'''
(OUT/'10_LEEME_DATOS_PRACTICA.txt').write_text(guide,encoding='utf-8-sig')
print(json.dumps({'sql':str(path),'tables':len(tables),'pdf_bytes':len(pdf),
                  'lines':len(sql.splitlines()),'oracle_execution':False},ensure_ascii=False))

from pathlib import Path
import re, json, hashlib, textwrap, copy
from collections import OrderedDict
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).parent / 'pacientes_originales'
REF = Path(r'C:/Users/jomac/Downloads/diccionario de base de datos_trabajo final_yrdlsmxtrm.docx')
PRIOR = Path(r'C:/Users/jomac/Downloads/diccionario02_zplihxzzjnfp (1).docx')
OUT.mkdir(exist_ok=True)

def read(p): return (ROOT / p).read_text(encoding='utf-8-sig')

modules = OrderedDict([
 ('DOCTORES', ('Doctores', 'Jose Mariano Carlos Condori', ['DOCTOR','DOCUMENTO_DOCTOR','ESPECIALIDAD','DOCTOR_ESPECIALIDAD','DISPONIBILIDAD_DOCTOR','FRANJA_HORARIA'])),
 ('CITAS', ('Citas', 'Sebastián Hernan Quispe', ['PRE_RESERVA_CITA','CITA','REPROGRAMACION_CITA','CONSULTORIO'])),
 ('PACIENTES', ('Pacientes y atención clínica', 'Reynaldo Eleazar Cauna Ochoa', ['PACIENTE','ATENCION_MEDICA','RECETA','RECETA_DETALLE'])),
 ('FINANZAS', ('Finanzas', 'Carlos Daniel Almonacid Tapia', ['PAGO_CITA','RECIBO_HONORARIO','LIQUIDACION','PARAMETRO_SISTEMA','NOTIFICACION_SALIENTE'])),
 ('RECEPCION_SEGURIDAD', ('Recepción y seguridad', 'Andrés Luis Céspedes Ramirez', ['ASISTENCIA','ROL','USUARIO','SESION_USUARIO','TOKEN_RECUPERACION','AUDITORIA']))
])
assignment = {}
for m,t,n in re.findall(r"SELECT '([^']+)' MODULO, '([^']+)' TIPO, '([^']+)' NOMBRE", read('db/modulos/06_verificar_modulos.sql')):
 assignment.setdefault(m,{}).setdefault(t,[]).append(n)
selection = {m:{t:n[:{'PROCEDURE':3,'FUNCTION':2,'TRIGGER':2,'VIEW':3}[t]] for t,n in ts.items()} for m,ts in assignment.items()}
expo=json.loads(read('db/exposicion/inventario.json'))
expo_by_name={x['name']:x for x in expo}
for m in selection:
 selection[m]['PROCEDURE']=(['SP_INICIAR_ATENCION','SP_REGISTRAR_DIAGNOSTICO','SP_CREAR_RECETA']
                            if m=='PACIENTES' else [x['name'] for x in expo if x['module']==m])
 assert len(selection[m]['PROCEDURE'])==3

# Read the original schema and later definitions in execution order, excluding seeds.
source_paths = [f'base de datos/{n}' for n in ['01_TABLAS_KARELY.sql','02_COMENTARIOS_INDICES.sql','03_TRIGGERS.sql','04_FUNCIONES_PROCEDIMIENTOS.sql','05_VISTAS_REPORTES.sql']]
source_paths += [f'db/migraciones/{n}' for n in ['2026-11-22-recuperacion-password.sql','2026-11-22-disponibilidad-especialidad.sql','2026-11-22-administradora-acceso-total.sql','2026-11-23-recibo-pdf.sql','2026-11-23-cancelacion-citas-vencidas.sql','2026-11-23-numeracion-liquidaciones.sql','2026-11-23-complemento-entregable-bd2.sql']]
source_paths += [f'db/modulos/0{i}_{n}.sql' for i,n in enumerate(['doctores','citas','pacientes','finanzas','recepcion_seguridad'],1)]
source_paths += ['db/seguridad/02_KARELY_PRIVILEGIOS.sql','db/seguridad/07_KARELY_REAPLICAR_GRANTS.sql','db/exposicion/SOLO_PROCEDIMIENTOS.sql']
definitions = {}
for path in source_paths:
 sql=read(path)
 for match in re.finditer(r'(?ims)^CREATE OR REPLACE (PROCEDURE|FUNCTION|TRIGGER)\s+(\w+)\b.*?^/\s*$', sql):
  definitions[match[2]]=(match[1],match[0].rstrip(),path)
 for match in re.finditer(r'(?ims)^CREATE OR REPLACE VIEW\s+(\w+)\b.*?;',sql):
  definitions[match[1]]=('VIEW',match[0],path)

def split_sql(s):
 result=[]; start=0; level=0; quote=False; i=0
 while i<len(s):
  c=s[i]
  if c=="'":
   if quote and i+1<len(s) and s[i+1]=="'": i+=2; continue
   quote=not quote
  elif not quote:
   if c=='(': level+=1
   elif c==')': level-=1
   elif c==',' and level==0: result.append(s[start:i].strip()); start=i+1
  i+=1
 result.append(s[start:].strip()); return result

schema=re.sub(r'--[^\n]*','',read('base de datos/01_TABLAS_KARELY.sql'))
tables=OrderedDict()
for m in re.finditer(r'(?is)CREATE TABLE\s+(\w+)\s*\(',schema):
 start=m.end(); level=1; quote=False; i=start
 while level:
  c=schema[i]
  if c=="'": quote=not quote
  elif not quote:
   if c=='(': level+=1
   elif c==')': level-=1
  i+=1
 tail=schema[i:schema.index(';',i)+1]
 tables[m[1].upper()]={'parts':split_sql(schema[start:i-1]),'partition':tail.strip(),'ddl':schema[m.start():schema.index(';',i)+1]}
token=read('db/migraciones/2026-11-22-recuperacion-password.sql')
match=re.search(r'(?is)CREATE TABLE TOKEN_RECUPERACION\s*\((.*?)\)\s*\n\s*\]',token)
tables['TOKEN_RECUPERACION']={'parts':split_sql(match[1]),'partition':'Sin particionamiento explícito.','ddl':'CREATE TABLE TOKEN_RECUPERACION ('+match[1]+');'}
tables['AUDITORIA']['parts'] += ['ESTADO_ANTERIOR VARCHAR2(30)','ESTADO_NUEVO VARCHAR2(30)',"ORIGEN VARCHAR2(12) DEFAULT 'USUARIO' NOT NULL CHECK(ORIGEN IN ('USUARIO','SISTEMA'))"]
tables['DISPONIBILIDAD_DOCTOR']['parts'] += ['ID_ESPECIALIDAD NUMBER REFERENCES ESPECIALIDAD(ID_ESPECIALIDAD)']
tables['RECIBO_HONORARIO']['parts'] += ['ARCHIVO_PDF BLOB','CORREO_ENVIO VARCHAR2(150)']
comments=dict(re.findall(r"(?i)COMMENT ON TABLE (\w+) IS '([^']*)'",read('base de datos/02_COMENTARIOS_INDICES.sql')))
comments['TOKEN_RECUPERACION']='Tokens de recuperación de contraseña almacenados como hash, con expiración y control de uso.'
tables={k:dict(v,parts=[p.upper() for p in v['parts']]) for k,v in tables.items()}
relations=[]
for name,info in tables.items():
 for part in info['parts']:
  r=re.search(r'^(\w+)\s+.*?REFERENCES\s+(\w+)\s*\((\w+)\)',part,re.S)
  if r: relations.append((name,r[1],r[2],r[3],'Sí' if 'NOT NULL' in part else 'No'))

queries={
 'DOCTORES':[
 ('Especialidades de cada doctor',"SELECT D.ID_DOCTOR, D.NOMBRES, D.APELLIDOS, E.NOMBRE AS ESPECIALIDAD\nFROM DOCTOR D JOIN DOCTOR_ESPECIALIDAD DE ON DE.ID_DOCTOR=D.ID_DOCTOR\nJOIN ESPECIALIDAD E ON E.ID_ESPECIALIDAD=DE.ID_ESPECIALIDAD\nWHERE D.ESTADO='ACTIVO' ORDER BY D.APELLIDOS,E.NOMBRE;",'INNER JOIN y filtro de estado'),
 ('Cantidad de documentos por doctor',"SELECT D.ID_DOCTOR,D.NOMBRES,COUNT(DD.ID_DOCUMENTO) AS DOCUMENTOS\nFROM DOCTOR D LEFT JOIN DOCUMENTO_DOCTOR DD ON DD.ID_DOCTOR=D.ID_DOCTOR\nGROUP BY D.ID_DOCTOR,D.NOMBRES ORDER BY DOCUMENTOS DESC;",'LEFT JOIN, COUNT y GROUP BY'),
 ('Doctores con varias especialidades',"SELECT D.ID_DOCTOR,D.NOMBRES,COUNT(*) AS ESPECIALIDADES\nFROM DOCTOR D JOIN DOCTOR_ESPECIALIDAD DE ON DE.ID_DOCTOR=D.ID_DOCTOR\nGROUP BY D.ID_DOCTOR,D.NOMBRES HAVING COUNT(*)>1;",'GROUP BY y HAVING')],
 'CITAS':[
 ('Agenda del día',"SELECT C.ID_CITA,F.HORA_INICIO,P.NOMBRES AS PACIENTE,D.NOMBRES AS DOCTOR\nFROM CITA C JOIN PACIENTE P ON P.ID_PACIENTE=C.ID_PACIENTE\nJOIN DOCTOR D ON D.ID_DOCTOR=C.ID_DOCTOR\nJOIN FRANJA_HORARIA F ON F.ID_FRANJA=C.ID_FRANJA\nWHERE C.FECHA_CITA=TRUNC(SYSDATE) ORDER BY F.HORA_INICIO;",'JOIN y ORDER BY'),
 ('Resumen por fecha',"SELECT FECHA_CITA,COUNT(*) AS TOTAL,\nSUM(CASE WHEN ESTADO='ATENDIDA' THEN 1 ELSE 0 END) AS ATENDIDAS\nFROM CITA GROUP BY FECHA_CITA ORDER BY FECHA_CITA;",'CASE, SUM y GROUP BY'),
 ('Citas de importe superior al promedio',"SELECT ID_CITA,FECHA_CITA,MONTO_TOTAL FROM CITA\nWHERE MONTO_TOTAL>(SELECT AVG(MONTO_TOTAL) FROM CITA)\nORDER BY MONTO_TOTAL DESC;",'Subconsulta y AVG')],
 'PACIENTES':[
 ('Pacientes sin citas',"SELECT P.ID_PACIENTE,P.NOMBRES,P.APELLIDOS\nFROM PACIENTE P LEFT JOIN CITA C ON C.ID_PACIENTE=P.ID_PACIENTE\nWHERE C.ID_CITA IS NULL;",'LEFT JOIN e IS NULL'),
 ('Atenciones cerradas por paciente',"SELECT P.ID_PACIENTE,P.NOMBRES,COUNT(A.ID_ATENCION) AS ATENCIONES\nFROM ATENCION_MEDICA A JOIN CITA C ON C.ID_CITA=A.ID_CITA\nJOIN PACIENTE P ON P.ID_PACIENTE=C.ID_PACIENTE\nWHERE A.ESTADO='CERRADA' GROUP BY P.ID_PACIENTE,P.NOMBRES;",'JOIN, COUNT y GROUP BY'),
 ('Cantidad de citas incluyendo pacientes sin reservas',"SELECT P.ID_PACIENTE,P.NOMBRES,COUNT(C.ID_CITA) AS CITAS\nFROM CITA C RIGHT JOIN PACIENTE P ON P.ID_PACIENTE=C.ID_PACIENTE\nGROUP BY P.ID_PACIENTE,P.NOMBRES ORDER BY P.ID_PACIENTE;",'RIGHT JOIN y GROUP BY')],
 'FINANZAS':[
 ('Total pagado por doctor',"SELECT D.ID_DOCTOR,D.NOMBRES,SUM(L.MONTO) AS TOTAL_PAGADO\nFROM LIQUIDACION L JOIN DOCTOR D ON D.ID_DOCTOR=L.ID_DOCTOR\nGROUP BY D.ID_DOCTOR,D.NOMBRES HAVING SUM(L.MONTO)>0;",'JOIN, SUM y HAVING'),
 ('Ingresos mensuales de la gestora',"SELECT TO_CHAR(FECHA_CITA,'YYYY-MM') AS MES,CONCEPTO,\nSUM(MONTO_INGRESO) AS INGRESO FROM VW_INGRESOS_GESTORA\nGROUP BY TO_CHAR(FECHA_CITA,'YYYY-MM'),CONCEPTO ORDER BY MES;",'Vista, SUM y agrupación mensual'),
 ('Saldo actual por doctor',"SELECT ID_DOCTOR,NOMBRES,FN_SALDO_DOCTOR(ID_DOCTOR,TRUNC(SYSDATE)) AS SALDO\nFROM DOCTOR WHERE ESTADO='ACTIVO' ORDER BY ID_DOCTOR;",'Función financiera y filtro')],
 'RECEPCION_SEGURIDAD':[
 ('Cuentas activas por rol',"SELECT U.USERNAME,R.NOMBRE AS ROL,U.ESTADO\nFROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL\nWHERE U.ESTADO='ACTIVO' ORDER BY R.NOMBRE,U.USERNAME;",'JOIN sin exponer contraseñas'),
 ('Control de asistencia del día',"SELECT C.ID_CITA,C.FECHA_CITA,\nCASE WHEN A.ID_ASISTENCIA IS NULL THEN 'PENDIENTE' ELSE 'PRESENTE' END AS ASISTENCIA\nFROM CITA C LEFT JOIN ASISTENCIA A ON A.ID_CITA=C.ID_CITA\nWHERE C.FECHA_CITA=TRUNC(SYSDATE);",'LEFT JOIN y CASE'),
 ('Sesiones por estado',"SELECT DECODE(ESTADO,'ACTIVA','En uso','CERRADA','Cerrada','EXPIRADA','Vencida',ESTADO)\nAS ESTADO_DESCRIPTIVO,COUNT(*) AS TOTAL\nFROM SESION_USUARIO GROUP BY ESTADO;",'DECODE y GROUP BY')]
}

# Template-derived document, preserving its institutional cover resources and styles.
doc=Document(REF)
body=doc._element.body
cover=[]
for element in list(body):
 if element.tag==qn('w:sectPr'): continue
 txt=''.join(element.itertext())
 if 'INTRODUCCI' in txt: break
 cover.append(copy.deepcopy(element))
for e in list(body):
 if e.tag!=qn('w:sectPr'): body.remove(e)
for e in cover: body.insert(len(body)-1,e)
names=[v[1] for v in modules.values()]
nameidx=0
for p in list(doc.paragraphs):
 if '[Título del proyecto]' in p.text: p.text='Karely sistema de gestión del centro integral'
 if '[Nombres y apellidos]' in p.text:
  p.text=names[nameidx]; nameidx+=1
  if nameidx==4:
   new=OxmlElement('w:p'); p._p.addnext(new)
   from docx.text.paragraph import Paragraph
   last_name=Paragraph(new,p._parent)
   last_name.text=names[4]
   last_name.alignment=WD_ALIGN_PARAGRAPH.CENTER
for para in list(doc.paragraphs):
 for br in para._p.xpath('.//w:br[@w:type="page"]'):
  br.getparent().remove(br)
 if not para.text.strip() and not para._p.xpath('.//w:drawing | .//w:pict'):
  para._p.getparent().remove(para._p)
 else:
  para.paragraph_format.space_before=Pt(0)
  para.paragraph_format.space_after=Pt(6)
  para.paragraph_format.line_spacing=1.1
  para.paragraph_format.page_break_before=False
for style in ['Normal','BD_TITULO1','BD_TITULO2','BD_TITULO3','Title']:
 s=doc.styles[style];s.font.name='Times New Roman';s.font.color.rgb=RGBColor(0,0,0)
 if style=='Normal': s.font.size=Pt(11);s.paragraph_format.space_after=Pt(5)
 elif style.startswith('BD_'): s.font.size=Pt(12);s.font.bold=True;s.paragraph_format.keep_with_next=True;s.paragraph_format.space_before=Pt(10);s.paragraph_format.space_after=Pt(5)
if 'SQL Karely' not in doc.styles:
 from docx.enum.style import WD_STYLE_TYPE
 s=doc.styles.add_style('SQL Karely',WD_STYLE_TYPE.PARAGRAPH)
 s.font.name='Consolas';s.font.size=Pt(8);s.font.color.rgb=RGBColor(0,0,0)
 s.paragraph_format.space_after=Pt(0);s.paragraph_format.line_spacing=1

def p(text,style=None): return doc.add_paragraph(text,style)
def h(text,level=1): return p(text,['BD_TITULO1','BD_TITULO2','BD_TITULO3'][level-1])
def code(sql):
 para=p(sql.strip(),'SQL Karely');para.paragraph_format.keep_together=(len(sql.strip().splitlines())<=26)
 return para
def table(headers,rows,widths=None):
 t=doc.add_table(rows=1,cols=len(headers));t.autofit=False
 for i,a in enumerate(headers): t.rows[0].cells[i].text=str(a)
 for row in rows:
  cells=t.add_row().cells
  for c,a in zip(cells,row): c.text=str(a)
 for ri,row in enumerate(t.rows):
  trpr=row._tr.get_or_add_trPr()
  if ri==0:
   repeat=OxmlElement('w:tblHeader');trpr.append(repeat)
  for ci,c in enumerate(row.cells):
   if widths:c.width=Inches(widths[ci])
   pr=c._tc.get_or_add_tcPr();b=OxmlElement('w:tcBorders')
   for side in ['top','left','bottom','right']:
    v=OxmlElement('w:'+side);v.set(qn('w:val'),'single');v.set(qn('w:sz'),'4');v.set(qn('w:color'),'D9D9D9');b.append(v)
   pr.append(b)
   if ri==0:
    shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'E7E6E6');pr.append(shade)
   for par in c.paragraphs:
    par.paragraph_format.space_after=Pt(3);par.paragraph_format.space_before=Pt(3)
    for run in par.runs:
     run.font.name='Times New Roman';run.font.size=Pt(9);run.bold=(ri==0)
 p('')
 return t

def diagram():
 im=Image.new('RGB',(1680,1040),'white');dr=ImageDraw.Draw(im)
 fontpath='C:/Windows/Fonts/arial.ttf';font=ImageFont.truetype(fontpath,26)
 boxes={'PACIENTE':(40,50),'CITA':(610,50),'DOCTOR':(1190,50),
 'PAGO_CITA':(40,390),'ATENCION_MEDICA':(610,390),'ESPECIALIDAD':(1190,390),
 'RECIBO_HONORARIO':(40,740),'RECETA':(610,740),'LIQUIDACION':(1190,740)}
 edges=[('PACIENTE','CITA','1 a N'),('CITA','DOCTOR','N a 1'),('CITA','PAGO_CITA','1 a 1'),('CITA','ATENCION_MEDICA','1 a 0..1'),('DOCTOR','ESPECIALIDAD','N a M'),('ATENCION_MEDICA','RECETA','1 a 0..1'),('CITA','RECIBO_HONORARIO','1 a 0..1'),('DOCTOR','LIQUIDACION','1 a N')]
 for a,b,label in edges:
  ax,ay=boxes[a];bx,by=boxes[b];ax+=210;ay+=70;bx+=210;by+=70
  dr.line((ax,ay,bx,by),fill='#777777',width=3)
  mx=(ax+bx)//2;my=(ay+by)//2
  dr.rectangle((mx-60,my-18,mx+65,my+18),fill='white');dr.text((mx-48,my-15),label,font=font,fill='black')
 for n,(x,y) in boxes.items():
  dr.rounded_rectangle((x,y,x+420,y+140),radius=10,fill='#EEF1F4',outline='#444444',width=3)
  bbox=dr.textbbox((0,0),n,font=font);dr.text((x+(420-(bbox[2]-bbox[0]))/2,y+55),n,font=font,fill='black')
 path=OUT/'modelo_conceptual.png';im.save(path);return path

rf=[
 ('RF01','Gestionar doctores','Registrar identificación y contacto; asignar especialidades.','Doctores'),
 ('RF02','Validar documentación','Consultar adjuntos y validar DNI y título antes de habilitar disponibilidad.','Doctores'),
 ('RF03','Registrar disponibilidad','Registrar fecha, especialidad y franja sin cruces de un mismo doctor.','Doctores'),
 ('RF04','Registrar pacientes','Registrar y editar datos; evitar duplicados por tipo y número de documento.','Pacientes'),
 ('RF05','Reservar citas','Consultar disponibilidad y crear pre-reserva temporal para un paciente.','Citas'),
 ('RF06','Confirmar cita pagada','Registrar pago aprobado y confirmar cita de forma transaccional.','Citas'),
 ('RF07','Reprogramar citas','Cambiar a un turno libre con aceptación del paciente y límite de reprogramaciones.','Citas'),
 ('RF08','Registrar asistencia','Validar pago y registrar presencia durante la ventana previa al turno.','Recepción y seguridad'),
 ('RF09','Registrar atención','Iniciar atención, guardar diagnóstico y observaciones del doctor asignado.','Pacientes'),
 ('RF10','Emitir receta','Registrar indicaciones y medicamentos de una atención abierta.','Pacientes'),
 ('RF11','Emitir y entregar recibo','Registrar comprobante y entrega; generar PDF y correo desde la aplicación.','Finanzas'),
 ('RF12','Cerrar atención','Cerrar al cumplir requisitos y actualizar cita y montos devengados.','Pacientes'),
 ('RF13','Pagar al doctor','Calcular saldo y registrar liquidación sin exceder el devengo pendiente.','Finanzas'),
 ('RF14','Consultar ingresos','Consultar ingresos derivados y reportes por periodo.','Finanzas'),
 ('RF15','Gestionar seguridad','Controlar cuentas, roles, sesiones y recuperación de contraseña.','Recepción y seguridad'),
 ('RF16','Auditar operaciones','Conservar trazas de cambios y consultas autorizadas de auditoría.','Recepción y seguridad'),
 ('RF17','Restringir acceso Oracle','Conceder SELECT y EXECUTE por objeto a usuarios individuales.','Recepción y seguridad'),
 ('RF18','Redactar datos sensibles','Aplicar cinco políticas DBMS_REDACT en vistas dedicadas según rol.','Todos')]
rn=[
 ('RN01','Unicidad de paciente','El par tipo_documento y numero_documento no se repite.','RF04'),
 ('RN02','Habilitación documental','La disponibilidad requiere doctor activo y documentación completa.','RF02 RF03'),
 ('RN03','Exclusividad de turno','No se duplica doctor ni consultorio en fecha y franja de citas activas.','RF05 RF06 RF07'),
 ('RN04','Pago y reserva','El pago aprobado debe coincidir con paciente e importe de la pre-reserva.','RF06'),
 ('RN05','Reprogramación limitada','Solo una reprogramación por cita, con aceptación; el nuevo turno no puede estar en el pasado.','RF07'),
 ('RN06','Ventana de recepción','La asistencia se registra desde 30 minutos antes hasta el inicio del turno.','RF08'),
 ('RN07','Propiedad clínica','Solo el doctor asignado o administración autorizada registra la atención.','RF09 RF10'),
 ('RN08','Requisitos de cierre','Se exige diagnóstico, receta con medicamentos y recibo entregado antes del cierre.','RF12'),
 ('RN09','Devengo y pago','El cierre congela montos de doctor y gestora; una liquidación es un pago efectivo, no un porcentaje anticipado.','RF12 RF13'),
 ('RN10','Límite financiero','El pago no puede exceder el saldo del doctor al corte; montos positivos y hasta dos decimales.','RF13'),
 ('RN11','Inmutabilidad financiera','Los cobros aprobados y liquidaciones se protegen frente a modificación o eliminación.','RF06 RF13'),
 ('RN12','Separación de identidades','JWT y rol de aplicación controlan el backend; SESSION_USER identifica la cuenta Oracle en SP_ORA.','RF15 RF17'),
 ('RN13','Privacidad de contraseñas','Se almacena hash BCrypt, sin exponerlo en vistas de lectores.','RF15'),
 ('RN14','Caducidad operativa','El mantenimiento cancela citas vencidas sin asistencia y expira reservas/sesiones según reglas vigentes.','RF05 RF08 RF15')]

from requisitos_actualizados import ampliar_requisitos, actores, actores_especificos, casos, calidad_adicional
rf,rn=ampliar_requisitos(rf,rn)
doc.add_page_break()
h('INTRODUCCIÓN')
p('Karely es un sistema interno para gestionar profesionales de salud, pacientes, citas, atención clínica y pagos del centro integral. La base Oracle KARELY_BD2 conserva las relaciones, restricciones y reglas transaccionales; Angular presenta las operaciones y Spring Boot coordina autenticación, permisos y persistencia.')
p('El trabajo se distribuye en cinco módulos. Se documentan 25 tablas de negocio, los objetos seleccionados por integrante y la seguridad Oracle aplicada mediante roles, privilegios y redacción de datos. Las tablas SYS_EXPORT_SCHEMA_01 y SYS_EXPORT_SCHEMA_02 son metadatos de trabajos Data Pump y no forman parte del modelo funcional.')
table(['Módulo','Responsable'],[(v[0],v[1]) for v in modules.values()],[2.45,3.8])
h('REQUERIMIENTOS')
p('La especificación adapta el enfoque por actores y casos de uso del diccionario del ciclo anterior al esquema vigente. Se mantienen RF01 a RF18 para conservar las referencias de esta entrega; RF19 a RF36 detallan operaciones adicionales. La numeración no equivale a los RF_ del ciclo pasado.')
h('Alcance y actores',2)
p('El sistema es de uso interno para administración, recepción, médicos y tesorería. El paciente aporta información y acepta cambios, pero no se le atribuye un portal de acceso que el proyecto no implementa. Auditor y desarrollo son perfiles de consulta Oracle con alcance restringido.')
table(['Actor','Responsabilidad'],[
 ('Administradora','Administra doctores, documentación, pacientes, citas, cuentas y parámetros; realiza operaciones autorizadas de supervisión.'),
 ('Recepcionista','Registra o consulta pacientes, reserva y reprograma citas, y registra llegada dentro de la ventana permitida.'),
 ('Doctor','Consulta sus citas y horarios y registra la información clínica y comprobantes de citas bajo su responsabilidad.'),
 ('Tesorero','Consulta información financiera y registra pagos a doctores sin exceder su saldo disponible.'),
 ('Auditor y desarrollo Oracle','Auditor consulta trazas y datos redactados; desarrollo consulta estructura sin DDL operativo.')],[1.35,4.9])
h('REQUERIMIENTOS FUNCIONALES',2)
p('Cada requisito define un resultado observable. Los permisos específicos se validan en las capas y procedimientos de la operación; mencionar un actor no concede por sí solo un privilegio Oracle.')
for label in list(dict.fromkeys(x[3] for x in rf)):
 h(label,3)
 table(['Código y requisito','Actor','Especificación'],[(a+' '+b,actores_especificos.get(a,actores[d]),'El sistema debe '+c[0].lower()+c[1:]) for a,b,c,d in rf if d==label],[1.55,1.4,3.3])
h('REQUERIMIENTOS NO FUNCIONALES',2)
p('Los requisitos de calidad se verifican mediante pruebas y evidencia. Las metas de tiempo, disponibilidad y respaldo no se declaran aprobadas solo por figurar en esta especificación.')
table(['Código','Requisito','Aplicación'],[
 ('RNF01','Integridad','PK, FK, UNIQUE, CHECK e índices de exclusión de turnos.'),
 ('RNF02','Transacciones','Confirmación y rollback ante fallos; pruebas técnicas con SAVEPOINT y ROLLBACK.'),
 ('RNF03','Seguridad','Roles de aplicación y Oracle separados; concesiones por objeto y menor privilegio.'),
 ('RNF04','Privacidad','Hash de contraseñas, vistas enmascaradas y políticas DBMS_REDACT.'),
 ('RNF05','Trazabilidad','AUDITORIA con fecha, objeto, acción e identidad cuando está disponible.'),
 ('RNF06','Mantenibilidad','Separación de capas y módulos; migraciones SQL incrementales.'),
 ('RNF07','Consulta eficiente','Meta de referencia: consultas habituales en 3 segundos o menos, con entorno y volumen de prueba documentados. Medir tiempos y planes; índices y particiones no acreditan por sí solos el resultado.'),
 ('RNF08','Mensajes claros','Errores de validación y conflictos HTTP comprensibles sin mostrar detalles internos de Oracle. Verificar especialmente documento duplicado y campos inválidos.')],[.65,1.5,4.1])
table(['Código','Atributo','Especificación y verificación'],calidad_adicional,[.65,1.5,4.1])
h('REGLAS DE NEGOCIO',2)
table(['Código','Regla','Descripción y alcance'],[(a,b,c+' Referencia: '+d) for a,b,c,d in rn],[.65,1.6,4])
h('Casos de uso y trazabilidad',2)
p('Los casos agrupan operaciones completas. Los procedimientos SP_EXP_ son reportes para consultar información de esas operaciones y exponerla; no sustituyen los procedimientos transaccionales del backend.')
table(['Caso','Actor','Requisitos y tablas'],[(a,b,c+'. '+d) for a,b,c,d in casos],[1.9,1.4,2.95])
h('Adaptación del documento del ciclo anterior',2)
p('Se mantiene la organización por actores, validaciones y resultados. El esquema conserva las 25 tablas actuales; no se trasladan PERSONA, ESTADO_CITA, CONFIGURACION_COMISION, COMISION ni DETALLE_COMISION del modelo anterior.')
p('Las comisiones se configuran en PARAMETRO_SISTEMA; LIQUIDACION registra pagos efectivos y las vistas calculan ingresos. Reprogramar permite fechas desde hoy y conserva el pago. La inasistencia vencida pasa a CANCELADA mediante mantenimiento; el nombre heredado SP_MARCAR_CITAS_PERDIDAS no cambia ese resultado.')

h('REFERENCIA')
h('DESCRIPCIÓN DE ESTÁNDAR DE BASE DE DATOS',2)
table(['Elemento','Implementación actual','Contraste con la guía'],[
 ('Tablas','Singular, mayúsculas y guion bajo: ATENCION_MEDICA.','Coincide con singular y mayúsculas.'),
 ('Columnas','snake_case sin comillas; Oracle registra nombres en mayúsculas.','La guía propone camelCase; no se renombra el esquema operativo.'),
 ('Restricciones','Prefijos CK_, UQ_, FK_ y nombres SYS_C… para restricciones sin nombre explícito.','La guía propone sufijos _pk, _fk, _chk y _unq; se documentan nombres reales.'),
 ('Vistas','Conviven VW_ históricas y V_S_/V_M_ añadidas. Todas son vistas normales.','V_M_ es una convención de nombre, no CREATE MATERIALIZED VIEW.'),
 ('Procedimientos y funciones','SP_ y FN_; SP_ORA_ delimita acceso directo autenticado a Oracle.','Se conserva el prefijo solicitado.'),
 ('Triggers','TR_ para validación, protección y auditoría.','Se identifican tabla, evento y finalidad.')],[1.1,2.6,2.55])
p('Las diferencias de nomenclatura son limitaciones respecto de la plantilla, no errores de compilación. No se presentan los 25 objetos como si fueran 27 tablas del modelo ni se confunde hash BCrypt con redacción de datos.')

h('SERVIDOR DE BASE DE DATOS')
table(['Dato','Configuración'],[
 ('SGBD','Oracle Database 19c Enterprise Edition, versión reportada durante la exportación.'),
 ('Sistema operativo','Windows; versión exacta y características del equipo por confirmar por el equipo.'),
 ('Conexión de desarrollo local','localhost, puerto 1521, servicio/SID orcl según la conexión usada en SQL Developer.'),
 ('Esquema propietario','KARELY_BD2; conexión JDBC usada por el backend.'),
 ('Tablespace de datos','TBS_KARELY_BD2.'),('Tablespace temporal','TMP_KARELY_BD2.'),
 ('Producción y desarrollo','No se ha acreditado un esquema de producción separado. desarrollo.karely tiene acceso de consulta de estructura.'),
 ('CPU RAM almacenamiento IP de red','Por completar con las características reales del servidor de la entrega.'),
 ('Claves','No se incluyen. Se solicitan al ejecutar los scripts y se configuran fuera del repositorio.')],[1.6,4.65])

h('USUARIOS Y ROLES')
p('Los roles de la aplicación se almacenan en ROL y se relacionan con USUARIO. Los roles Oracle se crean con CREATE ROLE y se asignan a cuentas de conexión independientes. El backend mantiene su sesión técnica KARELY_BD2; conceder un rol Oracle a una cuenta externa no sustituye las comprobaciones JWT del backend.')
h('Registro de usuarios y roles',2)
users=[('admin01','KARELY_R_ADMIN','Administración autorizada mediante vistas y entradas de procedimientos.'),('dr.marcos.salas','KARELY_R_DOCTOR','Lectura propia y ejecución de operaciones clínicas autorizadas.'),('recepcion.centro','KARELY_R_RECEPCION','Pacientes, citas y asistencia.'),('tesoreria.centro','KARELY_R_TESORERIA','Reportes y pagos a doctores.'),('auditor.karely','KARELY_R_AUDITOR','Lectura de auditoría y datos redactados.'),('desarrollo.karely','KARELY_R_DESARROLLO','Consulta de estructura, sin DDL sobre el esquema operativo.')]
table(['Usuario Oracle','Rol Oracle','Función'],users,[1.35,1.85,3.05])
p('Las cuentas se crean entre comillas en minúsculas. En SQL Developer se usaron, por ejemplo, "admin01" y "dr.marcos.salas". Sus contraseñas Oracle son independientes de las credenciales del login web.')
h('Asignación de privilegios',2)
grants=re.findall(r'(?im)^GRANT (SELECT|EXECUTE) ON (\w+) TO ([^;]+);',read('db/seguridad/02_KARELY_PRIVILEGIOS.sql')+'\n'+read('db/seguridad/07_KARELY_REAPLICAR_GRANTS.sql'))
grants=list(dict.fromkeys(g for g in grants if g[1]!='V_S_ORA_ESTRUCTURA'))
table(['Rol','Sistema','Objetos autorizados'],[(rol,'CREATE SESSION','; '.join(priv+' '+obj for priv,obj,to in grants if rol in [x.strip() for x in to.split(',')])) for _,rol,_ in users],[1.7,.85,3.7])
p('No se otorgan DBA, privilegios ANY, EXEMPT REDACTION POLICY, WITH ADMIN OPTION ni WITH GRANT OPTION a estas cuentas. No se concede EXECUTE público a FN_ORA_ACTOR. SP_ORA_CONSULTAR_ESTRUCTURA consulta metadatos con derechos del propietario; evita delegar SELECT sobre una vista dependiente de SYS.USER_OBJECTS.')
h('Asignación de roles a usuarios',2)
code('\n'.join(f'GRANT {role} TO "{user}";' for user,role,_ in users))
p('Las entradas SP_ORA_* resuelven SESSION_USER contra USUARIO y comprueban el rol de aplicación activo. Después establecen CLIENT_IDENTIFIER para ejecutar la lógica existente y lo limpian al terminar. El operador no elige el ID del actor. Las vistas del doctor filtran por su cuenta, evitando que un SELECT genérico exponga citas de otros médicos.')

h('ESQUEMA CONCEPTUAL DE BASE DE DATOS')
p('Un paciente solicita citas con un doctor y una especialidad. La pre-reserva se confirma con un pago. La asistencia habilita la atención médica, que puede tener receta, medicamentos y recibo. Al cerrar la atención se determinan los importes devengados; las liquidaciones registran pagos efectivos al doctor. Usuarios, sesiones y auditoría atraviesan los módulos.')
doc.add_picture(str(diagram()),width=Inches(6.2))
p('Figura 1. Relaciones principales. La relación doctor–especialidad se resuelve con DOCTOR_ESPECIALIDAD. La figura resume el dominio; las FK completas se detallan en el modelo lógico.')
h('ESQUEMA LÓGICO DE BASE DE DATOS')
for key,(label,person,tabs) in modules.items():
 h(label,2);p('Responsable: '+person+'. Tablas: '+', '.join(tabs)+'.')
 table(['Tabla y columna','Referencia','Obligatoria'],[(a+'.'+b,c+'.'+d,e) for a,b,c,d,e in relations if a in tabs],[2.5,2.9,.85])
p('Los identificadores sustitutos simplifican las FK. Las restricciones UNIQUE complementan las PK en documentos, reservas confirmadas y referencias financieras. CITA conserva especialidad y precio de su operación; los devengos se congelan al cierre para no recalcular el pasado con comisiones futuras.')
h('ESQUEMA FÍSICO DE BASE DE DATOS')
p('El esquema utiliza NUMBER para identificadores e importes, VARCHAR2 para textos acotados, DATE para fechas civiles, TIMESTAMP para eventos, CLOB para diagnóstico y observaciones y BLOB para documentos y PDF. Las claves numéricas principales usan IDENTITY. TOKEN_RECUPERACION usa TOKEN_HASH como PK.')
table(['Grupo físico','Implementación'],[('22 tablas','HASH por identificador, 2 o 4 particiones según el catálogo o transacción.'),('AUDITORIA y SESION_USUARIO','RANGE/INTERVAL mensual por fecha; partición inicial anterior a 2026.'),('TOKEN_RECUPERACION','Sin particionamiento explícito; índice por ID_USUARIO.'),('Documentos y recibos','ARCHIVO de DOCUMENTO_DOCTOR y ARCHIVO_PDF de RECIBO_HONORARIO son BLOB.'),('Índices de integridad','UQ_CITA_DOCTOR_TURNO y UQ_CITA_CONSULTORIO_TURNO se aplican a estados activos.'),('Numeración financiera','SQ_LIQUIDACION_REFERENCIA se usa para referencias automáticas OP-/BOL-.')],[1.7,4.55])
p('Particionar catálogos pequeños responde al ejercicio académico; no se afirma que mejore su rendimiento. En tablas intervaladas, PARTITION_COUNT puede mostrar un límite técnico como 1048575; no significa que existan ese número de particiones físicas. El número materializado se consulta en USER_TAB_PARTITIONS.')

h('DISEÑO DE TABLAS')
h('TABLAS',2)
p('Se incluyen las 24 tablas originales y TOKEN_RECUPERACION. Se conserva el modelo actual, con ampliaciones de auditoría, especialidad de disponibilidad y archivo/correo de recibo. El documento del ciclo anterior orienta los requisitos y no se usa como fuente de columnas. Las fechas reales de creación y nombres SYS_C… se consultan en Oracle; no se inventan nombres generados.')
gloss={'ID':'Identificador','ESTADO':'Estado permitido por sus restricciones','ARCHIVO':'Contenido binario del documento','ARCHIVO_PDF':'Contenido PDF del recibo','PASSWORD_HASH':'Hash BCrypt de la contraseña','TOKEN_HASH':'Hash del token de recuperación','VERSION_CREDENCIAL':'Huella de la versión de credenciales','MONTO_DOCTOR_DEVENGADO':'Honorario monetario congelado al cierre','MONTO_GESTORA_DEVENGADO':'Comisión monetaria congelada al cierre','VALOR':'Valor textual del parámetro','HASH':'Huella de integridad del archivo'}
for key,(label,person,tabs) in modules.items():
 h(label,2)
 for name in tabs:
  info=tables[name];h(name,3);p(comments.get(name,'Tabla del módulo '+label)+'.')
  columns=[];constraints=[]
  for part in info['parts']:
   cm=re.match(r'^(\w+)\s+(NUMBER(?:\s*\([^)]*\))?|VARCHAR2\s*\([^)]*\)|CHAR\s*\([^)]*\)|DATE|TIMESTAMP|BLOB|CLOB)',part,re.S)
   # Regex boundary after ')' is intentionally optional; validate the match below.
   if not cm:
    constraints.append(part);continue
   col,typ=cm[1],cm[2]
   pk='Sí' if 'PRIMARY KEY' in part else ''
   fk=next((c+'.'+d for a,b,c,d,e in relations if a==name and b==col),'')
   null='No' if pk or 'NOT NULL' in part else 'Sí'
   desc=gloss.get(col,('Identificador de '+col[3:].lower().replace('_',' ')) if col.startswith('ID_') else col.lower().replace('_',' ').capitalize())
   columns.append((col,pk,'Sí' if fk else '',typ,null,desc))
   if any(x in part for x in ['PRIMARY KEY','REFERENCES','UNIQUE','CHECK(']):constraints.append(part)
  assert columns,(name,info)
  p('Número de columnas: '+str(len(columns))+'.')
  table(['Columna','PK','FK','Tipo y tamaño','Nulo','Descripción'],columns,[1.65,.3,.3,1.05,.4,2.55])
  for constraint in constraints:
   p('Restricción: '+re.sub(r'\s+',' ',constraint)+'.')
  if name=='DISPONIBILIDAD_DOCTOR':p('ID_ESPECIALIDAD se añadió como columna nullable con FK FK_DISP_ESPECIALIDAD. El procedimiento valida la especialidad al registrar disponibilidad; los horarios históricos pueden requerir completar este dato.')
  if name=='AUDITORIA':p('ORIGEN restringe los valores a USUARIO y SISTEMA.')

# Object sheets follow the exact requirement order, retaining real SQL bodies.
types=[('PROCEDURE','PROCEDIMIENTOS ALMACENADOS',3),('FUNCTION','FUNCIONES',2),('TRIGGER','TRIGGERS',2)]
refs={'DOCTORES':'RF01 RF02 RF03; RN02','CITAS':'RF05 RF06 RF07; RN03 RN04 RN05','PACIENTES':'RF04 RF09 RF10 RF12; RN01 RN07 RN08','FINANZAS':'RF11 RF13 RF14; RN09 RN10 RN11','RECEPCION_SEGURIDAD':'RF08 RF15 RF16 RF17; RN06 RN12 RN13'}
def explanation(name,typ):
 if name in expo_by_name:return expo_by_name[name]['purpose']
 special={
 'SP_PRE_RESERVAR_CITA':'Valida actor, paciente, doctor, especialidad y disponibilidad; bloquea temporalmente un turno sin confirmar todavía el pago.',
 'SP_CONFIRMAR_CITA_PAGADA':'Verifica vigencia de la reserva y exclusividad del turno; registra pago aprobado y cita en la misma transacción.',
 'SP_REPROGRAMAR_CITA':'Aplica aceptación, límite de reprogramación, fecha válida y comprobación de disponibilidad antes de actualizar la cita.',
 'SP_VALIDAR_DOCUMENTACION':'Comprueba los documentos requeridos del doctor y actualiza su habilitación documental.',
 'SP_REGISTRAR_DISPONIBILIDAD':'Valida documentación, especialidad y cruces del turno antes de guardar disponibilidad.',
 'SP_CONSULTAR_HORARIOS_DOCTOR':'Devuelve un cursor con horarios de un doctor dentro de un periodo validado.',
 'SP_INICIAR_ATENCION':'Abre o recupera la atención de una cita con asistencia, controlando actor y doctor asignado.',
 'SP_REGISTRAR_DIAGNOSTICO':'Guarda diagnóstico y observaciones de una atención abierta después de validar propiedad y estado.',
 'SP_CREAR_RECETA':'Crea una receta única para la atención abierta y conserva su identificador para agregar medicamentos.',
 'SP_PAGAR_DOCTOR':'Compara el importe con el saldo devengado, registra una liquidación y encola una notificación; no envía correo por sí mismo.',
 'SP_GENERAR_LIQUIDACION':'Mantiene compatibilidad y delega el registro financiero con sus parámetros al procedimiento de pago.',
 'SP_EMITIR_RECIBO':'Registra el recibo de una cita atendida por el médico autorizado; la generación del PDF corresponde al backend.',
 'SP_REGISTRAR_ASISTENCIA':'Comprueba pago aprobado, paciente activo y ventana de treinta minutos; registra presencia y cambia la cita a EN_ATENCION.',
 'SP_CREAR_USUARIO':'Valida administración y crea una cuenta de aplicación con rol y hash de contraseña.',
 'SP_CERRAR_SESION':'Registra el cierre de una sesión del usuario autorizado y su auditoría.',
 'FN_EDAD_PACIENTE':'Calcula años cumplidos desde la fecha de nacimiento; devuelve NULL si falta el paciente o su fecha.',
 'FN_TOTAL_ATENCIONES_PACIENTE':'Cuenta atenciones cerradas vinculadas al paciente mediante CITA.',
 'FN_ROL_USUARIO':'Verifica que CLIENT_IDENTIFIER coincida con el actor y consulta su rol activo.',
 'FN_SESIONES_ACTIVAS_USUARIO':'Cuenta sesiones con estado ACTIVA; no sustituye la comprobación temporal del token.',
 'FN_MONTO_DOCTOR':'Lee las comisiones activas, comprueba que sumen cien y calcula el honorario redondeado.',
 'FN_SALDO_DOCTOR':'Suma devengos hasta el corte y resta todos los pagos efectivos para evitar sobrepagos por periodos solapados.',
 'FN_DOCUMENTACION_COMPLETA':'Determina la validez documental usando los documentos correspondientes del profesional.',
 'FN_TOTAL_ESPECIALIDADES':'Cuenta especialidades asociadas al doctor.',
 'FN_INICIO_TURNO':'Combina fecha y hora de la franja en un TIMESTAMP.',
 'FN_ESTADO_CITA':'Consulta el estado actual de una cita; devuelve NULL si no existe.'}
 if name in special:return special[name]
 if typ=='TRIGGER':return 'Se ejecuta automáticamente sobre su tabla y evento declarados. '+('Registra trazabilidad en AUDITORIA dentro de la misma transacción.' if 'AUD' in name else 'Aplica la regla de integridad documental descrita en el cuerpo del trigger.')
 return 'Expone una consulta reutilizable de '+name.replace('V_S_','').replace('V_M_','').replace('VW_','').lower().replace('_',' ')+'. No almacena filas adicionales.'

annex=OUT/'sql_por_modulo';annex.mkdir(exist_ok=True)
for m in modules:
 full=[]
 for typ in ['PROCEDURE','FUNCTION','TRIGGER','VIEW']:
  for name in selection[m][typ]:
   assert name in definitions,name
   full.append('-- Fuente: '+definitions[name][2]+'\n'+definitions[name][1])
 (annex/(m.lower()+'.sql')).write_text('\n\n'.join(full)+'\n',encoding='utf-8')

for typ,title,minimum in types:
 h(title)
 p(f'Se presentan {minimum} objetos por integrante, asignados a un solo módulo. En Pacientes se documentan SP_INICIAR_ATENCION, SP_REGISTRAR_DIAGNOSTICO y SP_CREAR_RECETA completos. Los otros cuatro módulos conservan sus SP_EXP_ cortos de consulta. Las entradas SP_ORA se documentan aparte.')
 for m,(label,person,tabs) in modules.items():
  h(label,2);p('Responsable: '+person+'.')
  for name in selection[m][typ]:
   sheet_start=len(doc.paragraphs)
   h(name,3);p(explanation(name,typ));p('Referencia: '+refs[m]+'. Fuente: '+definitions[name][2]+'.')
   if typ=='PROCEDURE' and name in expo_by_name:
    info=expo_by_name[name]
    p('Qué cumple: procedimiento almacenado con parámetros de entrada, validación IF y salida OUT SYS_REFCURSOR. '+info['concepts'])
    p('Referencia específica: '+info['refs']+'. Es un reporte asociado a esos requisitos; no registra la operación de negocio ni impone todas sus reglas. AUTHID CURRENT_USER usa los privilegios del invocador; no se conceden nuevos GRANT.')
   elif typ=='PROCEDURE':
    clinical={
     'SP_INICIAR_ATENCION':('RF09; RN06 RN07','Recibe usuario y cita, comprueba autorización y asistencia, y devuelve el identificador de atención por parámetro OUT. Mantiene la lógica original de inicio de consulta.'),
     'SP_REGISTRAR_DIAGNOSTICO':('RF09; RN07 RN08','Recibe usuario, cita, diagnóstico y observaciones. Verifica la atención abierta y el actor autorizado antes de actualizar información clínica y registrar auditoría.'),
     'SP_CREAR_RECETA':('RF10; RN07 RN24','Recibe usuario, cita e indicaciones, comprueba autorización y atención abierta, e inserta la cabecera de receta devolviendo su identificador. Los medicamentos se agregan mediante otra operación.')}
    reference,detail=clinical[name]
    p('Qué cumple: uno de los tres procedimientos de Pacientes, con parámetros, validaciones y operación de negocio sobre las tablas clínicas. '+detail)
    p('Referencia específica: '+reference+'. Se conserva el código transaccional completo, incluidos SAVEPOINT, excepciones y controles de propiedad; el actor se valida mediante FN_ROL_USUARIO.')
   elif typ=='FUNCTION':p('Qué cumple: una de las dos funciones del integrante. Recibe parámetros y devuelve un valor mediante RETURN, según la finalidad y tipo declarados en el código.')
   elif typ=='TRIGGER':p('Qué cumple: uno de los dos triggers seleccionados del integrante. Se activa automáticamente sobre el evento declarado; FOR EACH ROW indica ejecución por fila y su ausencia indica ejecución por sentencia.')
   for sheet_para in doc.paragraphs[sheet_start:]:sheet_para.paragraph_format.keep_with_next=True
   code(definitions[name][1])

h('CONSULTAS')
p('Tres consultas por módulo. Se usan JOIN, LEFT JOIN, RIGHT JOIN, GROUP BY, HAVING, CASE, DECODE y subconsultas. Son consultas de demostración sobre el esquema y no reemplazan SQL de los endpoints.')
for m,(label,person,tabs) in modules.items():
 h(label,2);p('Responsable: '+person+'. Referencia: '+refs[m]+'.')
 for title,sql,tech in queries[m]:h(title,3);p('Elementos: '+tech+'.');code(sql)
 (annex/(m.lower()+'_consultas.sql')).write_text('\n\n'.join('-- '+a+'\n'+b for a,b,c in queries[m])+'\n',encoding='utf-8')

h('VISTAS')
p('Se documentan tres vistas por módulo. Las vistas con prefijo V_M_ siguen siendo vistas normales, no materializadas. Las cinco políticas DBMS_REDACT se aplican a proyecciones V_S_RD_* distintas, descritas en enmascaramiento.')
for m,(label,person,tabs) in modules.items():
 h(label,2);p('Responsable: '+person+'.')
 for name in selection[m]['VIEW']:
  h(name,3);p(explanation(name,'VIEW'));p('Referencia: '+refs[m]+'. Fuente: '+definitions[name][2]+'.');code(definitions[name][1])

h('PARTICIONAMIENTO')
for m,name in zip(modules,['DOCTOR','CITA','PACIENTE','LIQUIDACION','SESION_USUARIO']):
 h(modules[m][0],2);p('Responsable: '+modules[m][1]+'. Tabla representativa: '+name+'. Referencia: '+refs[m]+'.')
 p('Clave de partición y definición física:');code(tables[name]['partition'])
 p('La estrategia HASH distribuye claves entre particiones; RANGE/INTERVAL organiza eventos por mes. Su conveniencia debe evaluarse con planes y volumen real; aquí se acredita la implementación académica.')
 code("SELECT TABLE_NAME,PARTITIONING_TYPE,PARTITION_COUNT FROM USER_PART_TABLES\nWHERE TABLE_NAME='"+name+"';\nSELECT TABLE_NAME,PARTITION_NAME FROM USER_TAB_PARTITIONS\nWHERE TABLE_NAME='"+name+"' ORDER BY PARTITION_POSITION;")

h('ENMASCARAMIENTO')
p('Se distinguen dos mecanismos. Las vistas V_S_*_ENMASCARADO aplican expresiones de texto; las proyecciones V_S_RD_* tienen políticas Oracle DBMS_REDACT.FULL, como en la sesión docente. El segundo mecanismo se verificó comparando auditor y administrador. BCrypt protege contraseñas, pero no se cuenta como política de redacción.')
policy_source=read('db/seguridad/03_SYSTEM_REDACT.sql')
for m,tag,col in zip(modules,['DOCTOR','CITA','PACIENTE','PAGO','USUARIO'],['CORREO','NUMERO_DOCUMENTO','NUMERO_DOCUMENTO','REFERENCIA_PAGO','CORREO']):
 h(modules[m][0],2);p('Responsable: '+modules[m][1]+f'. Vista: V_S_RD_{tag}. Columna: {col}. Política: DMSK_KARELY_{tag}.')
 p('FULL oculta el valor de salida para el auditor. El administrador con KARELY_R_ADMIN activo y el propietario conservan lectura original. Los datos almacenados no se sobrescriben.')
 code(definitions['V_S_RD_'+tag][1])
 policy=re.search(r"(?s)DECLARE v_n NUMBER;\s*BEGIN\s*SELECT COUNT\(\*\).*?OBJECT_NAME='V_S_RD_"+tag+r"'.*?\n/",policy_source)
 # Extract a precise policy call rather than a block that also contains other policies.
 start=policy_source.index("object_schema=>'KARELY_BD2',object_name=>'V_S_RD_"+tag+"'")
 a=policy_source.rfind('DBMS_REDACT.ADD_POLICY(',0,start);b=policy_source.index('\n  );',start)+5
 code('BEGIN\n '+policy_source[a:b]+'\nEND;\n/')
 code('SELECT * FROM KARELY_BD2.V_S_RD_'+tag+' FETCH FIRST 3 ROWS ONLY;')
p('Las políticas se instalaron sobre vistas dedicadas que no usa el backend. No se concedió EXEMPT REDACTION POLICY a lectores. La demostración debe realizarse con auditor.karely, no con SYS ni SYSTEM. DBMS_REDACT pertenece a Oracle Advanced Security; su uso requiere disponibilidad y autorización en el entorno.')

h('AUDITORÍA A TABLAS')
p('AUDITORIA registra fecha, tabla, acción, identificador del registro cuando corresponde y origen. Las operaciones de aplicación agregan su actor; los triggers nuevos de sentencia pueden dejar ID_USUARIO nulo y registrar SESSION_USER y CLIENT_IDENTIFIER en el detalle. Esto no equivale a identificar a la persona de aplicación en todas las escrituras JPA.')
table(['Módulo','Tabla o evento representativo','Objeto'],[
 ('Doctores','Cambio de habilitación del doctor','TR_AUD_DOCTOR_ESTADO'),
 ('Citas','Estado y reprogramación','TR_AUD_CITA_ESTADO; TR_AUD_REPROGRAMACION'),
 ('Pacientes','Datos y estado de atención','TR_AUD_PACIENTE_DATOS; TR_AUD_ATENCION_ESTADO'),
 ('Finanzas','Cobros y liquidaciones','TR_AUD_PAGO_CITA; TR_AUD_LIQUIDACION'),
 ('Recepción y seguridad','Asistencia, cuentas y sesiones','TR_AUD_ASISTENCIA_REGISTRO; TR_AUD_USUARIO_DATOS; TR_AUD_SESION_ESTADO')],[1.25,2.0,3.0])
code("SELECT TABLA_AFECTADA,ACCION,FECHA_OPERACION,ORIGEN\nFROM AUDITORIA ORDER BY FECHA_OPERACION DESC FETCH FIRST 20 ROWS ONLY;")

h('EVIDENCIAS DE VALIDACIÓN')
p('Los resultados de Oracle corresponden a las ejecuciones compartidas por el equipo entre el 23 y 24 de noviembre de 2026. Las pruebas SQL de escritura son técnicas, con datos preparados y rollback; no acreditan por sí solas el recorrido completo de la interfaz.')
table(['Comprobación','Resultado acreditado'],[
 ('Inventario inicial de objetos','13 funciones, 29 procedimientos, 16 triggers y 23 vistas válidos en la consulta compartida antes de agregar SP_ORA.'),
 ('Tablas','25 tablas del proyecto y 24 particionadas; 2 tablas SYS_EXPORT_SCHEMA_* externas al modelo funcional.'),
 ('Lecturas por rol','Seis conexiones con lecturas permitidas y accesos directos prohibidos rechazados.'),
 ('Redacción','Cinco proyecciones con datos sensibles vacíos para auditor y originales para administrador.'),
 ('Paciente temporal','Registro permitido y revertido por recepción.'),
 ('Atención propia y ajena','Diagnóstico/receta propios confirmados por el equipo; cita ajena rechazada con código esperado.'),
 ('Asistencia','Registro y cambio a EN_ATENCION verificados; cambios revertidos.'),
 ('Pago','Monto superior al saldo rechazado; pago de S/ 1 permitido y revertido junto con la notificación.'),
 ('Limpieza','Escenarios técnicos eliminados; auditoría conservada y protecciones restauradas según los scripts.'),
 ('Pruebas automáticas','151 pruebas backend y 51 frontend aprobadas en la ejecución del 24 de noviembre; compilación Angular correcta.'),
 ('Interfaz y corrección de duplicado','Se identificó DNI duplicado; GlobalExceptionHandler se corrigió para HTTP 409 y mensaje específico. Confirmación visual posterior pendiente.')],[1.6,4.65])
p('Las cifras anteriores son evidencia histórica, no el inventario final. La selección contiene 12 reportes SP_EXP_ y los 3 procedimientos clínicos originales de Pacientes. El paquete de reportes se verifica con db/exposicion/06_verificar.sql y 07_probar_consultas.sql; los SP originales se incluyen en db/modulos/06_verificar_modulos.sql. No se ejecutó SQL en Oracle al preparar esta versión.')
evidence=[
 ('Permisos del doctor','8a27db7e-1545-4df8-9239-0e99a678c1e7'),
 ('Permisos de recepción','dfa85459-e5d5-4959-b7e6-08479abe78ab'),
 ('Permisos de tesorería','d68b793d-4a32-4e48-bf88-7736bdbdf7d1'),
 ('Permisos de auditoría','5ad00024-42bf-4b3f-9e01-dcaafcb7c107'),
 ('Permisos de desarrollo','8fe00ca0-26ac-4a62-a00f-f675aef4db90'),
 ('Permisos de administración','acfb070a-5bfa-408f-b7a2-2e4de0cce701'),
 ('Rechazo de cita ajena','ffbbaae8-231d-410a-903d-920c9689c580'),
 ('Asistencia autorizada y revertida','cd65b5ff-2460-4b11-b6ba-cb1f613af771'),
 ('Pago válido y rechazo de sobrepago','a8011b82-e33b-49d7-bed5-ad93c74122bf'),
 ('Limpieza de los escenarios','b373ad1c-ad7a-409e-ac30-08d470efb86f')]
for title,ident in evidence:
 file=Path('C:/Users/jomac/AppData/Local/Temp')/('codex-clipboard-'+ident+'.png')
 if file.exists():
  h(title,2)
  image=Image.open(file)
  # Crop to Script Output: preserve identity/role and the actual result, not editor boilerplate.
  crop=image.crop((0,int(image.height*.56),image.width,image.height))
  ep=OUT/('evidencia_'+ident+'.png');crop.save(ep)
  doc.add_picture(str(ep),width=Inches(6.2));p('Evidencia compartida por el equipo en SQL Developer.')

h('REFERENCIAS Y ARCHIVOS DE ENTREGA').paragraph_format.page_break_before=True
p('Universidad Peruana Unión. Plantilla de entregable de Administración de Base de Datos II, docente Mg. Cynthia Acuña Salinas, noviembre de 2026.')
p('Equipo Karely. Diccionario del ciclo anterior diccionario02_zplihxzzjnfp (1).docx, julio de 2026. Referencia para organizar actores, requerimientos y reglas; no se reutiliza su modelo de tablas ni sus reglas reemplazadas.')
p('Sesión docente. Archivo codigo_licef2vpjg (1).zip: gestión de usuarios, privilegios de sistema y objeto, roles y DBMS_REDACT.')
p('Oracle. PL/SQL Packages and Types Reference 19c, DBMS_REDACT. https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/DBMS_REDACT.html')
p('Oracle. Database Reference 19c, REDACTION_POLICIES. https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/REDACTION_POLICIES.html')
p('Scripts del proyecto: base de datos/01_TABLAS_KARELY.sql a 08_CBO_ESTADISTICAS.sql; db/migraciones; db/modulos y db/seguridad. Se adjunta código SQL seleccionado por módulo en sql_por_modulo. Es material de lectura y evidencia; no es un instalador para reejecutar sobre producción.')
h('Datos por completar antes de la entrega',2)
p('Confirmar CPU, RAM, almacenamiento y dirección de red del servidor; verificar nombres completos de portada; actualizar el inventario final de USER_OBJECTS y adjuntar la evidencia visual del flujo completo de la página. Las diferencias de nomenclatura frente a la plantilla se han descrito expresamente y no se ocultan.')

# Footer page fields only; normal content stays within source A4 margins.
for section in doc.sections:
 footer=section.footer.paragraphs[0];footer.alignment=WD_ALIGN_PARAGRAPH.CENTER
 f=OxmlElement('w:fldSimple');f.set(qn('w:instr'),'PAGE');footer._p.append(f)
settings=doc.settings.element;upd=OxmlElement('w:updateFields');upd.set(qn('w:val'),'true');settings.append(upd)
doc.core_properties.title='Karely documentación de base de datos por módulos'
doc.core_properties.author='Equipo Karely'
path=OUT/'Entregable_BD2_Karely.docx';doc.save(path)
metadata={'template_sha256':hashlib.sha256(REF.read_bytes()).hexdigest(),'prior_content_reference':str(PRIOR),'prior_sha256':hashlib.sha256(PRIOR.read_bytes()).hexdigest(),'tables':len(tables),'relations':len(relations),'selected':selection,'source_paths':source_paths,'output':str(path),'requirements':len(rf),'business_rules':len(rn)}
(OUT/'inventario_documentacion.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'output':str(path),'tables':len(tables),'relations':len(relations)},ensure_ascii=False))

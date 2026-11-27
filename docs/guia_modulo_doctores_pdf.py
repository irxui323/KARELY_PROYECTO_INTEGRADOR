from pathlib import Path
import re
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "Guia_Modulo_Doctores_Karely.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

SOURCES = {
    "business": ROOT / "base de datos" / "04_FUNCIONES_PROCEDIMIENTOS.sql",
    "module": ROOT / "db" / "modulos" / "01_doctores.sql",
    "expo": ROOT / "db" / "exposicion" / "01_doctores.sql",
    "security": ROOT / "db" / "seguridad" / "02_KARELY_PRIVILEGIOS.sql",
    "schema": ROOT / "db" / "instalacion" / "orclpdb" / "02_KARELY_ESQUEMA_MIGRACIONES_DATOS.sql",
}
TEXT = {k: v.read_text(encoding="utf-8-sig") for k, v in SOURCES.items()}

def object_code(source, name, kind=None):
    # Read a complete CREATE OR REPLACE object through its SQL*Plus slash terminator.
    if kind == "VIEW":
        pat = rf"(?ims)^CREATE\s+OR\s+REPLACE\s+VIEW\s+{re.escape(name)}\b.*?;"
        m = re.search(pat, TEXT[source])
        if not m:
            raise RuntimeError(f"No se encontro {name} en {source}")
        return m.group(0).strip()
    pat = rf"(?ims)^CREATE\s+OR\s+REPLACE\s+{kind or r'(?:FUNCTION|PROCEDURE|TRIGGER|VIEW)'}\s+{re.escape(name)}\b.*?^/\s*$"
    m = re.search(pat, TEXT[source])
    if not m:
        raise RuntimeError(f"No se encontro {name} en {source}")
    return m.group(0).strip()

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=25, leading=30, textColor=colors.HexColor("#075985"), alignment=TA_CENTER, spaceAfter=12))
styles.add(ParagraphStyle(name="Subtitle", parent=styles["Normal"], fontSize=11, leading=16, textColor=colors.HexColor("#334155"), alignment=TA_CENTER))
styles.add(ParagraphStyle(name="H1x", parent=styles["Heading1"], fontSize=17, leading=21, textColor=colors.HexColor("#075985"), spaceBefore=7, spaceAfter=8))
styles.add(ParagraphStyle(name="H2x", parent=styles["Heading2"], fontSize=12, leading=15, textColor=colors.HexColor("#0c4a6e"), spaceBefore=6, spaceAfter=4))
styles.add(ParagraphStyle(name="Bodyx", parent=styles["BodyText"], fontSize=9.3, leading=13, spaceAfter=5))
styles.add(ParagraphStyle(name="CodeLine", fontName="Courier", fontSize=7.6, leading=9.2, leftIndent=2, rightIndent=2, textColor=colors.HexColor("#172033"), splitLongWords=True, wordWrap="CJK"))
styles.add(ParagraphStyle(name="Smallx", parent=styles["BodyText"], fontSize=8, leading=10, textColor=colors.HexColor("#475569")))
styles.add(ParagraphStyle(name="TableHeader", parent=styles["Smallx"], textColor=colors.white, fontName="Helvetica-Bold"))

class GuideDoc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(str(filename), pagesize=A4, rightMargin=17*mm, leftMargin=17*mm, topMargin=19*mm, bottomMargin=18*mm, title="Guía del módulo Doctores - Karely", author="Karely")
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="normal")
        self.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=self.decorate)])
    def decorate(self, canvas, doc):
        canvas.saveState()
        w, h = A4
        canvas.setStrokeColor(colors.HexColor("#bae6fd")); canvas.line(17*mm, h-12*mm, w-17*mm, h-12*mm)
        canvas.setFont("Helvetica", 8); canvas.setFillColor(colors.HexColor("#475569"))
        canvas.drawString(17*mm, h-9*mm, "KARELY  |  BASE DE DATOS  |  MODULO DOCTORES")
        canvas.line(17*mm, 13*mm, w-17*mm, 13*mm)
        canvas.drawRightString(w-17*mm, 8*mm, f"Guia de estudio  |  {doc.page}")
        canvas.restoreState()

story=[]
def P(text, style="Bodyx"):
    story.append(Paragraph(text, styles[style]))
def H(text, level=1):
    P(escape(text), "H1x" if level==1 else "H2x")
def code_block(source, name, kind, purpose):
    H(f"{kind}: {name}", 2)
    P(f"<b>Para que sirve:</b> {escape(purpose)}", "Bodyx")
    P(f"<b>Origen:</b> {escape(str(SOURCES[source].relative_to(ROOT)))}", "Smallx")
    lines=object_code(source,name,kind).splitlines()
    for line in lines:
        story.append(Paragraph(escape(line) if line else "&nbsp;", styles["CodeLine"]))
    story.append(Spacer(1,5))

story += [Spacer(1,35*mm), Paragraph("GUIA DEL MODULO<br/>DOCTORES", styles["CoverTitle"]),
          Paragraph("Objetos SQL clasificados, propósito y código fuente", styles["Subtitle"]), Spacer(1,15*mm)]
P("<b>Responsable:</b> Mariano. Esta guía explica el módulo del esquema Karely y diferencia las operaciones reales de los reportes cortos preparados para exposición.")
P("Los bloques de código se transcriben de los SQL del proyecto. Los procedimientos SP_EXP_ son reportes adicionales; no sustituyen las operaciones existentes. No ejecutes los fragmentos de esta guía para instalar: usa los archivos de instalación completos del proyecto.")
H("1. Requisitos del módulo")
rows=[ ["ID", "Que pide", "Regla asociada"],
 ["RF01", "Gestionar doctores y asignar especialidades.", "Datos del profesional y su relación con especialidades."],
 ["RF02", "Revisar y validar DNI y título profesional.", "Solo documentos vigentes con archivo válido."],
 ["RF03", "Registrar disponibilidad sin cruces de turnos.", "Solo doctor activo y documentación completa (RN02)."],
 ["RF19", "Consultar documentos y su estado.", "Distinguir recibido, validado y rechazado."],
 ["RF20", "Seleccionar doctores habilitados.", "Activo y documentación completa."],
 ["RF21", "Consultar horarios propios.", "El doctor ve solo sus horarios mediante la vista de su sesión."] ]
t=Table([[Paragraph(escape(str(c)),styles["TableHeader" if ri==0 else "Smallx"]) for c in row] for ri,row in enumerate(rows)], colWidths=[18*mm,67*mm,93*mm], repeatRows=1)
t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.HexColor("#0369a1")),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.4,colors.HexColor("#cbd5e1")),("VALIGN",(0,0),(-1,-1),"TOP"),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,colors.HexColor("#f0f9ff")]),("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
story.append(t)
H("2. Tablas del modulo")
P("DOCTOR (profesional y estado); DOCUMENTO_DOCTOR (archivos y validación); ESPECIALIDAD (catálogo y precio); DOCTOR_ESPECIALIDAD (relación muchos-a-muchos); FRANJA_HORARIA (turnos); DISPONIBILIDAD_DOCTOR (asignación de fecha y turno). El DDL vigente está en db/instalacion/orclpdb/02_KARELY_ESQUEMA_MIGRACIONES_DATOS.sql.")
P("Relación principal: DOCTOR 1:N DOCUMENTO_DOCTOR; DOCTOR N:M ESPECIALIDAD por DOCTOR_ESPECIALIDAD; DOCTOR 1:N DISPONIBILIDAD_DOCTOR, que enlaza con FRANJA_HORARIA.")
story.append(PageBreak())

H("3. Procedimientos de operación")
code_block("business","SP_VALIDAR_DOCUMENTACION","PROCEDURE","La administradora valida los documentos recientes DNI y TITULO. Verifica identidad de sesión, rol, doctor activo y archivos; luego marca documentos validados y documentación completa.")
code_block("business","SP_REGISTRAR_DISPONIBILIDAD","PROCEDURE","Registra un horario. Valida identidad, rol, pertenencia del doctor al usuario cuando actúa un doctor, documentación completa, fecha no pasada, franja activa y ausencia de solapamiento.")
code_block("module","SP_CONSULTAR_HORARIOS_DOCTOR","PROCEDURE","Consulta horarios por doctor y rango de fechas. Devuelve las filas por un cursor SYS_REFCURSOR y rechaza un rango inválido.")

H("4. Funciones")
code_block("business","FN_DOCUMENTACION_COMPLETA","FUNCTION","Devuelve 1 cuando el documento más reciente de DNI y TITULO está VALIDADO y tiene archivo; devuelve 0 si no se cumple.")
code_block("module","FN_TOTAL_ESPECIALIDADES","FUNCTION","Devuelve cuántas especialidades están relacionadas con el doctor en DOCTOR_ESPECIALIDAD.")

H("5. Triggers")
code_block("business","TR_DOCUMENTO_REVALIDACION","TRIGGER","Después de insertar, actualizar o borrar un documento, marca como INCOMPLETO al doctor afectado para exigir una nueva validación.")
code_block("business","TR_DOCTOR_ESTADO_VALIDADO","TRIGGER","Antes de cambiar la documentación a COMPLETO, llama a FN_DOCUMENTACION_COMPLETA. Si la función devuelve 0, cancela la operación con error.")
code_block("module","TR_AUD_DOCTOR_ESTADO","TRIGGER","Después de actualizar ESTADO o ESTADO_DOCUMENTACION en DOCTOR, registra el cambio en AUDITORIA junto con el usuario Oracle y CLIENT_IDENTIFIER de la sesión.")

H("6. Vistas")
code_block("module","V_S_DOCUMENTACION_DOCTOR","VIEW","Resume por doctor la cantidad de documentos y cuántos están validados.")
code_block("module","V_S_HORARIOS_DOCTOR","VIEW","Une disponibilidad, especialidad y franja para mostrar el horario completo.")
code_block("security","V_S_ORA_MIS_HORARIOS","VIEW","Filtra los horarios para el doctor asociado al usuario Oracle conectado. Esta es la vista que aplica el alcance de datos propios.")
code_block("schema","V_S_DOCTOR_ENMASCARADO","VIEW","Oculta parte del documento y del correo para entregar una proyección de datos protegida a roles autorizados.")

H("7. Seguridad Oracle")
code_block("security","SP_ORA_VALIDAR_DOCUMENTACION","PROCEDURE","Capa AUTHID DEFINER autorizada para el rol administrador. Obtiene el ID del actor mediante FN_ORA_ACTOR, fija temporalmente CLIENT_IDENTIFIER, llama al procedimiento de negocio y limpia el identificador incluso si ocurre error.")
P("El rol KARELY_R_DOCTOR recibe SELECT sobre V_S_ORA_MIS_CITAS, V_S_ORA_MIS_HORARIOS y V_S_ORA_MIS_ATENCIONES; no debe recibir acceso directo indiscriminado a todas las tablas. El GRANT y las vistas están definidos en db/seguridad/02_KARELY_PRIVILEGIOS.sql.")
P("Ejemplos de privilegios del módulo:", "Bodyx")
for line in [
    "GRANT EXECUTE ON SP_ORA_VALIDAR_DOCUMENTACION TO KARELY_R_ADMIN;",
    "GRANT SELECT ON V_S_ORA_MIS_HORARIOS TO KARELY_R_DOCTOR;",
    "GRANT SELECT ON V_S_HORARIOS_DOCTOR TO KARELY_R_RECEPCION;",
    "GRANT SELECT ON V_S_DOCTOR_ENMASCARADO TO KARELY_R_RECEPCION;",
    "GRANT SELECT ON V_S_DOCUMENTACION_DOCTOR TO KARELY_R_ADMIN;",
]: story.append(Paragraph(escape(line), styles["CodeLine"]))
P("Importante: los procedimientos SP_EXP_ aceptan un ID para filtrar, pero eso no autentica al solicitante. Para datos privados propios se usa la vista V_S_ORA_MIS_HORARIOS, que filtra con SESSION_USER.")

H("8. Procedimientos cortos de consulta para exposición")
P("La plantilla de exposición del proyecto selecciona tres procedimientos por integrante. Estos tres son reportes de solo lectura: validan el ID y abren un cursor con SQL fijo. No sustituyen SP_VALIDAR_DOCUMENTACION ni SP_REGISTRAR_DISPONIBILIDAD.")
code_block("expo","SP_EXP_ESPECIALIDADES_DOC","PROCEDURE","Lista especialidades asignadas, precio vigente y estado.")
code_block("expo","SP_EXP_DOCUMENTOS_DOC","PROCEDURE","Lista tipo, estado y fecha de validación de documentos, sin exponer el BLOB del archivo.")
code_block("expo","SP_EXP_HORARIOS_DOC","PROCEDURE","Lista fechas y franjas de disponibilidad de un doctor para una consulta demostrativa.")

H("9. Particionamiento y verificación")
P("DOCTOR tiene particionamiento HASH según el esquema de instalación. Su objetivo es distribuir físicamente filas para administrar y consultar volúmenes de datos. No reemplaza los índices ni las reglas de autorización.")
P("Consulta de verificación para ejecutar como KARELY_BD2:")
verify="""SELECT OBJECT_NAME, OBJECT_TYPE, STATUS
FROM USER_OBJECTS
WHERE OBJECT_NAME IN (
 'FN_DOCUMENTACION_COMPLETA','FN_TOTAL_ESPECIALIDADES',
 'TR_DOCUMENTO_REVALIDACION','TR_DOCTOR_ESTADO_VALIDADO',
 'TR_AUD_DOCTOR_ESTADO','SP_VALIDAR_DOCUMENTACION',
 'SP_REGISTRAR_DISPONIBILIDAD','SP_CONSULTAR_HORARIOS_DOCTOR',
 'SP_EXP_ESPECIALIDADES_DOC','SP_EXP_DOCUMENTOS_DOC','SP_EXP_HORARIOS_DOC',
 'SP_ORA_VALIDAR_DOCUMENTACION','V_S_DOCUMENTACION_DOCTOR',
 'V_S_HORARIOS_DOCTOR','V_S_ORA_MIS_HORARIOS','V_S_DOCTOR_ENMASCARADO'
)
ORDER BY OBJECT_TYPE, OBJECT_NAME;"""
for line in verify.splitlines(): story.append(Paragraph(escape(line) or "&nbsp;",styles["CodeLine"]))
P("Para estudiar el flujo, recuerda: documentos -> FN_DOCUMENTACION_COMPLETA -> trigger de protección -> SP_VALIDAR_DOCUMENTACION -> disponibilidad. En la exposición, explica el objetivo, validaciones y resultado de cada objeto; no es necesario memorizar cada palabra del cuerpo.")

GuideDoc(OUT).build(story)
print(OUT)

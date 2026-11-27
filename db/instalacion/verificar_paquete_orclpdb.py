"""Comprobaciones del paquete; no reemplazan la compilación en Oracle."""
from pathlib import Path
import hashlib, json, re, zipfile

ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).parent/'orclpdb'
files=sorted(OUT.glob('*.sql'))
assert len(files)==5
texts={p.name:p.read_text(encoding='utf-8-sig') for p in files}
for name,text in texts.items():
    assert not re.search(r'^\s*@',text,re.M),name
    assert not re.search(r'^\s*(?:DROP|TRUNCATE)\s',text,re.M|re.I),name
    assert "CON_NAME') <> 'ORCLPDB'" in text,name
    assert not any(ord(c)<32 and c not in '\n\r\t' for c in text),name
one=texts[files[0].name]
for path in [
 r'C:\Users\Administrator\Downloads\oradata\ORCL\ORCLPDB\TBS_KARELY_BD2_01.DBF',
 r'C:\Users\Administrator\Downloads\oradata\ORCL\ORCLPDB\TMP_KARELY_BD2_01.DBF']:
    assert "'"+path+"'" in one,path
assert 'REUSE;' not in one
two=texts[files[1].name]
schema=(ROOT/'base de datos/01_TABLAS_KARELY.sql').read_text(encoding='utf-8-sig')
max_action=int(re.search(r'\baccion\s+VARCHAR2\((\d+)\)',schema,re.I)[1])
maintenance=(ROOT/'db/migraciones/2026-11-23-cancelacion-citas-vencidas.sql').read_text(encoding='utf-8-sig')
event=re.search(r"'CITA',\s*R.ID_CITA,\s*'([^']+)'",maintenance)[1]
assert len(event.encode('utf8'))<=max_action,(event,len(event.encode('utf8')),max_action)
# La regresión de instalación era cargar personas sin crear primero admin01.
assert two.index("SELECT ID_ROL,'admin01'") < two.index('DECLARE\n    c_hash CONSTANT')
assert two.index('ALTER TABLE AUDITORIA ADD') < two.index('CREATE OR REPLACE TRIGGER TR_AUD_PAGO_CITA')
assert two.index('ADD ID_ESPECIALIDAD NUMBER') < two.index('CREATE OR REPLACE VIEW V_S_HORARIOS_DOCTOR')
assert two.index('COMPILE_SCHEMA') < two.index("SELECT ID_ROL,'admin01'")
tables=set(re.findall(r'\bCREATE TABLE\s+(\w+)',two,re.I))
assert len(tables)==25,(len(tables),sorted(tables))
selected=json.loads((ROOT/'docs/entregable_bd2/pacientes_originales/inventario_documentacion.json').read_text(encoding='utf8'))
definitions={}
for match in re.finditer(r'(?ims)^CREATE OR REPLACE (PROCEDURE|FUNCTION|TRIGGER)\s+(\w+)\b.*?^\s*/\s*$',two):
    definitions[match[2]]=match[1]
for match in re.finditer(r'(?ims)^CREATE OR REPLACE VIEW\s+(\w+)\b.*?;',two):
    definitions[match[1]]='VIEW'
for group in selected['selected'].values():
    for kind,names in group.items():
        for name in names:assert definitions.get(name)==kind,(kind,name)
assert len([n for n in definitions if n.startswith('SP_EXP_')])==12
assert 'CREATE OR REPLACE PROCEDURE SP_EXP_BUSCAR_PACIENTE' not in two
assert "v_tablas <> 25" in two
assert 'v_tab<>24 OR v_proc<>28' not in two
four=texts[files[3].name]
assert not re.search(r'^GRANT SELECT ON V_S_ORA_ESTRUCTURA',four,re.M)
assert 'GRANT EXECUTE ON SP_ORA_CONSULTAR_ESTRUCTURA' in four
assert 'FROM ALL_OBJECTS' in four
assert "AND ENABLE='YES'" in texts[files[4].name]
manifest=json.loads((OUT/'fuentes.json').read_text(encoding='utf8'))
for rel,digest in manifest.items():
    src=(ROOT/rel).read_text(encoding='utf-8-sig')
    assert hashlib.sha256(src.encode('utf8')).hexdigest()==digest,rel
readme=(OUT/'LEEME.txt').read_text(encoding='utf-8-sig')
assert r'.\iniciar-backend.ps1 -Servicio ORCLPDB' in readme
with zipfile.ZipFile(OUT.parent/'Karely_instalacion_ORCLPDB.zip') as archive:
    assert len(archive.namelist())==7
    assert archive.testzip() is None
    for path in files:assert archive.read(path.name)==path.read_bytes(),path.name
print(json.dumps({'scripts':5,'tables_defined':len(tables),'selected_objects':'todos presentes',
                  'sources_verified':len(manifest),'paths':'coinciden con captura',
                  'admin_before_seed':True,'zip':'integro','oracle_execution':False},ensure_ascii=False))

from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
modulos = ROOT / "db" / "modulos"
expo = ROOT / "db" / "exposicion"
out = ROOT / "db" / "pruebas_modulares"
out.mkdir(parents=True, exist_ok=True)

verifica = (modulos / "06_verificar_modulos.sql").read_text(encoding="utf-8-sig")
requeridos = {}
for modulo, tipo, nombre in re.findall(
    r"SELECT\s+'([^']+)'\s+MODULO,\s*'([^']+)'\s+TIPO,\s*'([^']+)'\s+NOMBRE\s+FROM\s+DUAL",
    verifica, re.I,
):
    requeridos.setdefault(modulo, []).append((tipo.upper(), nombre.upper()))

inventario = json.loads((expo / "inventario.json").read_text(encoding="utf-8"))
by_module = {}
for item in inventario:
    by_module.setdefault(item["module"], []).append(item["name"])

test_text = (expo / "07_probar_consultas.sql").read_text(encoding="utf-8-sig")
parts = re.split(r"(?m)^PROMPT\s+(SP_EXP_[A-Z_]+)\s*$", test_text)
tests = {parts[i]: parts[i + 1].strip() for i in range(1, len(parts), 2)}

names = {
    "DOCTORES": "01_doctores.sql",
    "CITAS": "02_citas.sql",
    "PACIENTES": "03_pacientes.sql",
    "FINANZAS": "04_finanzas.sql",
    "RECEPCION_SEGURIDAD": "05_recepcion_seguridad.sql",
}
views = {
    "DOCTORES": ["V_S_DOCTOR_ENMASCARADO", "V_S_DOCUMENTACION_DOCTOR", "V_S_HORARIOS_DOCTOR"],
    "CITAS": ["VW_AGENDA_CITAS", "VW_RESUMEN_CITAS_DIARIAS", "V_M_CITAS_ESPECIALIDAD", "V_M_CITAS_CONSULTORIO", "V_S_CITA_ENMASCARADA"],
    "PACIENTES": ["V_S_PACIENTE_ENMASCARADO", "V_S_HISTORIAL_PACIENTE", "V_S_RECETAS_PACIENTE"],
    "FINANZAS": ["VW_PAGOS_CITA", "VW_INGRESOS_GESTORA", "VW_SALDOS_LIQUIDACIONES", "V_S_PAGO_ENMASCARADO"],
    "RECEPCION_SEGURIDAD": ["V_S_USUARIO_ENMASCARADO", "V_S_RECEPCION_ASISTENCIA", "V_S_SEGURIDAD_SESIONES"],
}
functions = {
    "DOCTORES": [
        "SELECT MIN(ID_DOCTOR) INTO v_id FROM DOCTOR;",
        "DBMS_OUTPUT.PUT_LINE('FN_DOCUMENTACION_COMPLETA='||FN_DOCUMENTACION_COMPLETA(v_id));",
        "DBMS_OUTPUT.PUT_LINE('FN_TOTAL_ESPECIALIDADES='||FN_TOTAL_ESPECIALIDADES(v_id));",
    ],
    "CITAS": [
        "SELECT MIN(ID_CITA) INTO v_id FROM CITA;",
        "DBMS_OUTPUT.PUT_LINE('FN_ESTADO_CITA='||NVL(FN_ESTADO_CITA(v_id),'(sin citas)'));",
        "SELECT MIN(ID_FRANJA) INTO v_franja FROM FRANJA_HORARIA WHERE ESTADO='ACTIVO';",
        "DBMS_OUTPUT.PUT_LINE('FN_INICIO_TURNO='||TO_CHAR(FN_INICIO_TURNO(TRUNC(SYSDATE),v_franja),'YYYY-MM-DD HH24:MI'));",
    ],
    "PACIENTES": [
        "SELECT MIN(ID_PACIENTE) INTO v_id FROM PACIENTE;",
        "DBMS_OUTPUT.PUT_LINE('FN_EDAD_PACIENTE='||NVL(TO_CHAR(FN_EDAD_PACIENTE(v_id)),'(sin pacientes)'));",
        "DBMS_OUTPUT.PUT_LINE('FN_TOTAL_ATENCIONES_PACIENTE='||FN_TOTAL_ATENCIONES_PACIENTE(v_id));",
    ],
    "FINANZAS": [
        "SELECT MIN(ID_DOCTOR) INTO v_id FROM DOCTOR;",
        "DBMS_OUTPUT.PUT_LINE('FN_MONTO_DOCTOR(100)='||FN_MONTO_DOCTOR(100));",
        "DBMS_OUTPUT.PUT_LINE('FN_SALDO_DOCTOR='||FN_SALDO_DOCTOR(v_id));",
        "SELECT MIN(ID_LIQUIDACION) INTO v_liq FROM LIQUIDACION;",
        "IF v_liq IS NOT NULL THEN DBMS_OUTPUT.PUT_LINE('FN_SALDO_LIQUIDACION='||FN_SALDO_LIQUIDACION(v_liq)); END IF;",
    ],
    "RECEPCION_SEGURIDAD": [
        "SELECT MIN(ID_USUARIO) INTO v_id FROM USUARIO;",
        "DBMS_OUTPUT.PUT_LINE('FN_SESIONES_ACTIVAS_USUARIO='||FN_SESIONES_ACTIVAS_USUARIO(v_id));",
        "DBMS_SESSION.SET_IDENTIFIER(TO_CHAR(v_id));",
        "DBMS_OUTPUT.PUT_LINE('FN_ROL_USUARIO='||FN_ROL_USUARIO(v_id));",
        "DBMS_SESSION.CLEAR_IDENTIFIER;",
    ],
}

titulo = {
    "DOCTORES": "DOCTORES",
    "CITAS": "CITAS",
    "PACIENTES": "PACIENTES",
    "FINANZAS": "FINANZAS",
    "RECEPCION_SEGURIDAD": "RECEPCION Y SEGURIDAD",
}

for module, filename in names.items():
    rows = requeridos[module] + [("PROCEDURE", n) for n in by_module[module]]
    lines = [
        "-- PRUEBA DE MODULO: " + titulo[module],
        "-- Ejecutar con F5 como KARELY_BD2. Solo realiza consultas; no modifica filas.",
        "SET DEFINE OFF", "SET SERVEROUTPUT ON", "WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK", "",
        "DECLARE", "BEGIN",
        "  IF USER <> 'KARELY_BD2' THEN RAISE_APPLICATION_ERROR(-20994,'Ejecutar como KARELY_BD2.'); END IF;",
        "END;", "/", "",
        "PROMPT === Estado de procedimientos, funciones, triggers y vistas ===",
        "WITH REQUERIDOS AS (",
    ]
    for i, (kind, name) in enumerate(rows):
        lines.append(("  " if i == 0 else "  UNION ALL ") + f"SELECT '{kind}' TIPO, '{name}' NOMBRE FROM DUAL")
    lines += [
        ")", "SELECT R.TIPO,R.NOMBRE,NVL(O.STATUS,'FALTA') STATUS",
        "FROM REQUERIDOS R LEFT JOIN USER_OBJECTS O",
        "ON O.OBJECT_TYPE=R.TIPO AND O.OBJECT_NAME=R.NOMBRE",
        "ORDER BY R.TIPO,R.NOMBRE;", "",
        "PROMPT === Funciones del modulo ===", "DECLARE",
        "  v_id NUMBER; v_franja NUMBER; v_liq NUMBER;", "BEGIN",
    ]
    lines.extend("  " + statement for statement in functions[module])
    lines += ["EXCEPTION WHEN NO_DATA_FOUND THEN DBMS_OUTPUT.PUT_LINE('PENDIENTE: faltan filas para evaluar alguna funcion.');",
              "WHEN OTHERS THEN DBMS_SESSION.CLEAR_IDENTIFIER; RAISE;", "END;", "/", "",
              "PROMPT === Consultas de vistas del modulo (conteo) ==="]
    for view in views[module]:
        lines.append(f"SELECT '{view}' VISTA, COUNT(*) FILAS FROM {view};")
    lines.append("")
    for proc in by_module[module]:
        if proc not in tests:
            raise RuntimeError(f"Falta bloque de prueba para {proc}")
        lines.append(f"PROMPT === Prueba de {proc}: resultado y rechazo de parametro invalido ===")
        lines.append(tests[proc])
        lines.append("")
    lines += [
        "PROMPT === Fin de pruebas de lectura del modulo ===",
        "PROMPT Los triggers se verifican por estado aqui; su comportamiento se prueba al ejecutar DML autorizado en los scripts db/seguridad.",
    ]
    (out / filename).write_text("\n".join(lines) + "\n", encoding="utf-8")

readme = """PRUEBAS SQL SEPARADAS POR MODULO
================================

Ejecuta los cinco archivos con F5 desde una conexion KARELY_BD2. Cada uno:
- verifica objetos requeridos VALID (incluye triggers);
- evalua funciones y consulta vistas del modulo;
- invoca sus tres procedimientos SP_EXP_ con un filtro real y prueba un parametro invalido;
- no inserta, actualiza ni elimina filas.

Las pruebas de operaciones que escriben datos y de permisos se ejecutan con las cuentas Oracle correspondientes:
- DOCTORES: db/seguridad/09_PROBAR_ESCRITURA_DOCTOR.sql (doctor), 13_PROBAR_CITA_AJENA.sql (doctor); validacion documental mediante SP_ORA_VALIDAR_DOCUMENTACION (admin).
- CITAS y RECEPCION: 08_PROBAR_ESCRITURA_RECEPCION.sql, 12_PROBAR_ASISTENCIA.sql (recepcion); incluyen los flujos de asistencia/reserva segun los datos disponibles.
- PACIENTES: 08_PROBAR_ESCRITURA_RECEPCION.sql (registro); 09_PROBAR_ESCRITURA_DOCTOR.sql (diagnostico/receta).
- FINANZAS: 10_PROBAR_ESCRITURA_TESORERIA.sql (tesoreria; requiere saldo positivo).
- SEGURIDAD / DENEGACIONES: 05_PROBAR_ACCESOS.sql (cada usuario), 06_PROBAR_REDACT.sql (auditor y admin), 11_PROBAR_ESCRITURA_DENEGADA.sql (auditor y desarrollo).

Los triggers no se invocan con EXEC; Oracle los dispara al ocurrir su evento DML. Las pruebas de solo lectura verifican que estén VALID. Los casos de escritura existentes activan algunos triggers y revierten los cambios con SAVEPOINT/ROLLBACK. El flujo de cada trigger puede requerir filas que cumplan sus condiciones; si aparece PENDIENTE, no se ha probado su comportamiento, solo su compilacion.

No se ejecutaron contra la instancia local del usuario; ejecutar con F5 en SQL Developer. Las pruebas de finanzas pueden consumir valores de secuencias aun cuando luego se haga ROLLBACK.
"""
(out / "LEEME.txt").write_text(readme, encoding="utf-8")
print(f"Generadas {len(names)} pruebas en {out}")

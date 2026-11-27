SET SERVEROUTPUT ON
SET DEFINE OFF
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

-- Conectar como "recepcion.centro". Registro temporal: se revierte.
DECLARE
 v_id NUMBER; v_total NUMBER;
 v_documento VARCHAR2(20):='QA'||SUBSTR(RAWTOHEX(SYS_GUID()),1,18);
BEGIN
 SAVEPOINT prueba_recepcion;
 IF SYS_CONTEXT('USERENV','SESSION_USER')<>'recepcion.centro' THEN
  RAISE_APPLICATION_ERROR(-20994,'Probar como recepcion.centro.'); END IF;
 KARELY_BD2.SP_ORA_REGISTRAR_PACIENTE(
  'OTRO',v_documento,'Validacion','Temporal',DATE '2000-01-01',
  NULL,NULL,NULL,v_id);
 SELECT COUNT(*) INTO v_total FROM KARELY_BD2.PACIENTE
 WHERE ID_PACIENTE=v_id AND NUMERO_DOCUMENTO=v_documento;
 IF v_total<>1 THEN RAISE_APPLICATION_ERROR(-20995,'No se verifico el registro.'); END IF;
 ROLLBACK TO prueba_recepcion;
 SELECT COUNT(*) INTO v_total FROM KARELY_BD2.PACIENTE WHERE ID_PACIENTE=v_id;
 IF v_total<>0 THEN RAISE_APPLICATION_ERROR(-20995,'Persistio el registro temporal.'); END IF;
 DBMS_OUTPUT.PUT_LINE('CORRECTO: registro autorizado y revertido.');
EXCEPTION WHEN OTHERS THEN
 ROLLBACK TO prueba_recepcion; RAISE;
END;
/


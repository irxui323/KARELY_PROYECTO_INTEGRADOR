-- Como KARELY_BD2, obtener primero una cita EN_ATENCION ajena a dr.marcos.salas:
-- SELECT C.ID_CITA FROM CITA C JOIN DOCTOR D ON D.ID_DOCTOR=C.ID_DOCTOR
-- JOIN USUARIO U ON U.ID_USUARIO=D.ID_USUARIO
-- WHERE C.ESTADO='EN_ATENCION' AND U.USERNAME<>'dr.marcos.salas';
-- Ejecutar este archivo como "dr.marcos.salas". Introducir 0 si no hay candidata.
SET SERVEROUTPUT ON
SET DEFINE ON
SET VERIFY OFF
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK
ACCEPT CITA_AJENA NUMBER PROMPT 'ID de cita ajena EN_ATENCION (0 si no hay): '
DECLARE
 v_cita NUMBER:=&CITA_AJENA;
 v_total NUMBER; v_denegado BOOLEAN:=FALSE;
BEGIN
 SAVEPOINT prueba_cita_ajena;
 IF SYS_CONTEXT('USERENV','SESSION_USER')<>'dr.marcos.salas' THEN
  RAISE_APPLICATION_ERROR(-20994,'Probar como dr.marcos.salas.'); END IF;
 IF v_cita=0 THEN
  DBMS_OUTPUT.PUT_LINE('PENDIENTE: preparar cita ajena EN_ATENCION.');
 ELSE
  SELECT COUNT(*) INTO v_total FROM KARELY_BD2.V_S_ORA_MIS_CITAS WHERE ID_CITA=v_cita;
  IF v_total>0 THEN RAISE_APPLICATION_ERROR(-20995,'La cita elegida es propia; usar una ajena.'); END IF;
  BEGIN
   KARELY_BD2.SP_ORA_DIAGNOSTICO(v_cita,'Validacion tecnica temporal',NULL);
  EXCEPTION WHEN OTHERS THEN
   IF SQLCODE=-20404 THEN v_denegado:=TRUE; ELSE RAISE; END IF;
  END;
  IF NOT v_denegado THEN RAISE_APPLICATION_ERROR(-20995,'FALLO: no se rechazo la cita ajena.'); END IF;
  DBMS_OUTPUT.PUT_LINE('CORRECTO: escritura clinica de cita ajena rechazada por pertenencia.');
 END IF;
 ROLLBACK TO prueba_cita_ajena;
EXCEPTION WHEN OTHERS THEN ROLLBACK TO prueba_cita_ajena; RAISE;
END;
/
UNDEFINE CITA_AJENA


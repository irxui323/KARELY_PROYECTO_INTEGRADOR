SET SERVEROUTPUT ON
SET DEFINE OFF
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

-- Conectar como "dr.marcos.salas".
-- Requiere cita propia EN_ATENCION y atencion ABIERTA. Si no existe, informa PENDIENTE.
DECLARE
 v_cita NUMBER; v_receta NUMBER; v_detalle NUMBER; v_total NUMBER;
BEGIN
 SAVEPOINT prueba_doctor;
 IF SYS_CONTEXT('USERENV','SESSION_USER')<>'dr.marcos.salas' THEN
  RAISE_APPLICATION_ERROR(-20994,'Probar como dr.marcos.salas.'); END IF;
 SELECT MIN(A.ID_CITA) INTO v_cita
 FROM KARELY_BD2.V_S_ORA_MIS_ATENCIONES A JOIN KARELY_BD2.V_S_ORA_MIS_CITAS C ON C.ID_CITA=A.ID_CITA
 WHERE A.ESTADO='ABIERTA' AND C.ESTADO='EN_ATENCION';
 IF v_cita IS NULL THEN
  DBMS_OUTPUT.PUT_LINE('PENDIENTE: no hay cita propia con atencion abierta.');
 ELSE
  KARELY_BD2.SP_ORA_DIAGNOSTICO(v_cita,'Validacion tecnica temporal','Registro que se revierte');
  SELECT COUNT(*) INTO v_total FROM KARELY_BD2.V_S_ORA_MIS_ATENCIONES
  WHERE ID_CITA=v_cita AND DBMS_LOB.SUBSTR(DIAGNOSTICO,100,1)='Validacion tecnica temporal';
  IF v_total<>1 THEN RAISE_APPLICATION_ERROR(-20995,'Diagnostico no verificado.'); END IF;
  DBMS_OUTPUT.PUT_LINE('CORRECTO: diagnostico autorizado.');
  BEGIN
   KARELY_BD2.SP_ORA_CREAR_RECETA(v_cita,'Validacion tecnica; se revierte',v_receta);
   KARELY_BD2.SP_ORA_AGREGAR_MEDICAMENTO(v_receta,'Registro tecnico temporal',
    'No aplica','No aplica','No aplica',v_detalle,'No es una prescripcion real');
   IF v_receta IS NULL OR v_detalle IS NULL THEN
    RAISE_APPLICATION_ERROR(-20995,'Receta o detalle sin identificador.'); END IF;
   DBMS_OUTPUT.PUT_LINE('CORRECTO: receta y detalle autorizados.');
  EXCEPTION WHEN DUP_VAL_ON_INDEX THEN
   DBMS_OUTPUT.PUT_LINE('PENDIENTE receta: ya existe una receta para esta atencion.');
  END;
 END IF;
 ROLLBACK TO prueba_doctor;
 DBMS_OUTPUT.PUT_LINE('Cambios de prueba revertidos.');
EXCEPTION WHEN OTHERS THEN
 ROLLBACK TO prueba_doctor; RAISE;
END;
/


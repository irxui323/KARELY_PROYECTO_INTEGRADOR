SET SERVEROUTPUT ON
SET DEFINE OFF
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

-- Conectar como "tesoreria.centro".
-- No envia correo: el pago y su notificacion se revierten en la misma transaccion.
-- Los numeros de secuencia consumidos no se recuperan con ROLLBACK.
DECLARE
 v_doctor NUMBER; v_fin DATE; v_saldo NUMBER; v_id NUMBER; v_rechazado BOOLEAN:=FALSE;
BEGIN
 SAVEPOINT prueba_tesoreria;
 IF SYS_CONTEXT('USERENV','SESSION_USER')<>'tesoreria.centro' THEN
  RAISE_APPLICATION_ERROR(-20994,'Probar como tesoreria.centro.'); END IF;
 BEGIN
  SELECT ID_DOCTOR,PERIODO_FIN,SALDO_PENDIENTE INTO v_doctor,v_fin,v_saldo
  FROM KARELY_BD2.VW_SALDOS_LIQUIDACIONES
  WHERE SALDO_PENDIENTE>0 AND PERIODO_FIN<=TRUNC(SYSDATE)
  ORDER BY PERIODO_FIN DESC FETCH FIRST 1 ROW ONLY;
 EXCEPTION WHEN NO_DATA_FOUND THEN
  DBMS_OUTPUT.PUT_LINE('PENDIENTE: la vista no contiene un saldo positivo para probar.');
  ROLLBACK TO prueba_tesoreria; RETURN;
 END;
 BEGIN
  KARELY_BD2.SP_ORA_PAGAR_DOCTOR(v_doctor,v_fin,v_fin,v_saldo+1,'EFECTIVO',v_id);
 EXCEPTION WHEN OTHERS THEN
  IF SQLCODE=-20514 THEN v_rechazado:=TRUE;
  ELSE RAISE; END IF;
 END;
 IF NOT v_rechazado THEN
  RAISE_APPLICATION_ERROR(-20995,'FALLO: no se rechazo el pago superior al saldo.'); END IF;
 DBMS_OUTPUT.PUT_LINE('CORRECTO: monto superior al saldo rechazado.');
 KARELY_BD2.SP_ORA_PAGAR_DOCTOR(v_doctor,v_fin,v_fin,LEAST(1,v_saldo),'EFECTIVO',v_id);
 IF v_id IS NULL THEN RAISE_APPLICATION_ERROR(-20995,'Pago sin identificador.'); END IF;
 DBMS_OUTPUT.PUT_LINE('CORRECTO: pago autorizado con identificador '||v_id);
 ROLLBACK TO prueba_tesoreria;
 DBMS_OUTPUT.PUT_LINE('Pago y notificacion de prueba revertidos.');
EXCEPTION WHEN OTHERS THEN
 ROLLBACK TO prueba_tesoreria; RAISE;
END;
/


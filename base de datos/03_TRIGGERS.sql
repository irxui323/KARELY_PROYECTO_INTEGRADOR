-- ============================================================================
-- KARELY / ORACLE DATABASE 19c
-- ARCHIVO 03 - SESION 2 / TRIGGERS DML Y AUDITORIA
-- ESTILO: material del curso BD2 (S1-S8), adaptado a Karely.
-- CONEXION: KARELY_BD2 en la PDB (no CDB$ROOT).
-- EJECUCION: SQL Developer, F5 / Run Script, en el orden del LEEME.
-- NOTA: instalacion NUEVA, no migracion de datos.
-- ============================================================================
SET DEFINE OFF
SET SERVEROUTPUT ON SIZE UNLIMITED
WHENEVER SQLERROR EXIT SQL.SQLCODE

-- Resguardar pagos efectivos contra mutaciones y auditoria de cobros.
CREATE OR REPLACE TRIGGER TR_NO_EDITAR_LIQUIDACION
BEFORE UPDATE OR DELETE ON LIQUIDACION
BEGIN
 RAISE_APPLICATION_ERROR(-20870,
   'Pago registrado inmutable: corregir mediante proceso formal de reverso');
END;
/
SHOW ERRORS TRIGGER TR_NO_EDITAR_LIQUIDACION;

CREATE OR REPLACE TRIGGER TR_NO_EDITAR_PAGO_APROBADO
BEFORE UPDATE OR DELETE ON PAGO_CITA
FOR EACH ROW
BEGIN
 IF :OLD.estado='APROBADO' THEN
  RAISE_APPLICATION_ERROR(-20871,
    'No modificar un cobro aprobado; se requiere operacion de reversion');
 END IF;
END;
/
SHOW ERRORS TRIGGER TR_NO_EDITAR_PAGO_APROBADO;

CREATE OR REPLACE TRIGGER TR_AUD_PAGO_CITA
AFTER INSERT ON PAGO_CITA
FOR EACH ROW
DECLARE
 v_actor NUMBER;
BEGIN
 BEGIN v_actor:=TO_NUMBER(SYS_CONTEXT('USERENV','CLIENT_IDENTIFIER'));
 EXCEPTION WHEN VALUE_ERROR THEN v_actor:=NULL; END;
 INSERT INTO AUDITORIA(id_usuario,tabla_afectada,id_registro,accion,detalle,origen)
 VALUES (v_actor,'PAGO_CITA',:NEW.id_pago,'REGISTRAR',
  SUBSTR('Cobro paciente '||:NEW.id_paciente||' importe S/ '||TO_CHAR(:NEW.monto),1,500),
  'USUARIO');
END;
/
SHOW ERRORS TRIGGER TR_AUD_PAGO_CITA;

-- Validar que el paciente y el monto del cobro coincidan con la pre-reserva.
CREATE OR REPLACE TRIGGER TR_VALIDAR_PAGO_CITA
BEFORE INSERT OR UPDATE OF ID_PRE_RESERVA,ID_PACIENTE,MONTO ON PAGO_CITA
FOR EACH ROW
DECLARE
 v_paciente PRE_RESERVA_CITA.ID_PACIENTE%TYPE;
 v_monto PRE_RESERVA_CITA.MONTO%TYPE;
BEGIN
 SELECT id_paciente,monto INTO v_paciente,v_monto
 FROM PRE_RESERVA_CITA WHERE id_pre_reserva=:NEW.id_pre_reserva;
 IF :NEW.id_paciente<>v_paciente OR :NEW.monto<>v_monto THEN
  RAISE_APPLICATION_ERROR(-20860,'El paciente o el importe no coincide con la reserva');
 END IF;
END;
/
SHOW ERRORS TRIGGER TR_VALIDAR_PAGO_CITA;

-- Registro de cambios en la tabla de parametros sin historial financiero separado.
CREATE OR REPLACE TRIGGER TR_AUD_PARAMETRO
AFTER UPDATE OF VALOR,ESTADO ON PARAMETRO_SISTEMA
FOR EACH ROW
DECLARE
 v_actor NUMBER;
BEGIN
 BEGIN v_actor:=TO_NUMBER(SYS_CONTEXT('USERENV','CLIENT_IDENTIFIER'));
 EXCEPTION WHEN VALUE_ERROR THEN v_actor:=NULL; END;
 INSERT INTO AUDITORIA(id_usuario,tabla_afectada,id_registro,accion,detalle,
       estado_anterior,estado_nuevo,origen)
 VALUES (v_actor,'PARAMETRO_SISTEMA',:NEW.id_parametro,'MODIFICAR',
         SUBSTR(:NEW.nombre||': '||:OLD.valor||' -> '||:NEW.valor,1,500),
         :OLD.estado,:NEW.estado,'USUARIO');
END;
/
SHOW ERRORS TRIGGER TR_AUD_PARAMETRO;

CREATE OR REPLACE TRIGGER TR_AUD_LIQUIDACION
AFTER INSERT ON LIQUIDACION
FOR EACH ROW
DECLARE
 v_actor NUMBER;
BEGIN
 v_actor:=:NEW.id_usuario_registro;
 INSERT INTO AUDITORIA(id_usuario,tabla_afectada,id_registro,accion,detalle,origen)
 VALUES (v_actor,'LIQUIDACION',:NEW.id_liquidacion,'PAGAR',
         SUBSTR('Pago al doctor '||:NEW.id_doctor||
           ', monto S/ '||TO_CHAR(:NEW.monto),1,500),'USUARIO');
END;
/
SHOW ERRORS TRIGGER TR_AUD_LIQUIDACION;

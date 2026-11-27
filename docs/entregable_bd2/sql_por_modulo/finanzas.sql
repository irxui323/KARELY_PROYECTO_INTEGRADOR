-- Fuente: db/migraciones/2026-11-22-administradora-acceso-total.sql
CREATE OR REPLACE PROCEDURE SP_PAGAR_DOCTOR (
 p_id_usuario       IN USUARIO.ID_USUARIO%TYPE,
 p_id_doctor        IN DOCTOR.ID_DOCTOR%TYPE,
 p_periodo_inicio   IN DATE,
 p_periodo_fin      IN DATE,
 p_monto            IN NUMBER,
 p_metodo_pago      IN LIQUIDACION.METODO_PAGO%TYPE,
 p_numero_operacion IN LIQUIDACION.NUMERO_OPERACION%TYPE,
 p_numero_boleta    IN LIQUIDACION.NUMERO_BOLETA%TYPE,
 p_id_liquidacion   OUT LIQUIDACION.ID_LIQUIDACION%TYPE
) IS
 v_doc DOCTOR.ID_DOCTOR%TYPE;
 v_correo DOCTOR.CORREO%TYPE;
 v_saldo NUMBER(16,2);
 v_notif_estado NOTIFICACION_SALIENTE.ESTADO%TYPE;
 v_error VARCHAR2(500);
BEGIN
 p_id_liquidacion := NULL;
 SAVEPOINT sv_pagar_doctor;
 
 IF p_id_usuario IS NULL OR SYS_CONTEXT('USERENV','CLIENT_IDENTIFIER') IS NULL
    OR SYS_CONTEXT('USERENV','CLIENT_IDENTIFIER') <> TO_CHAR(p_id_usuario) THEN
  RAISE_APPLICATION_ERROR(-20509,'Identidad de sesion no coincide');
 END IF;
 IF NVL(FN_ROL_USUARIO(p_id_usuario),'SIN_ROL') NOT IN ('TESORERA','ADMINISTRADORA') THEN
  RAISE_APPLICATION_ERROR(-20510,'Solo tesoreria o administracion puede pagar a un doctor');
 END IF;
 IF p_periodo_inicio IS NULL OR p_periodo_fin IS NULL OR
    p_periodo_inicio<>TRUNC(p_periodo_inicio) OR
    p_periodo_fin<>TRUNC(p_periodo_fin) OR
    p_periodo_fin < p_periodo_inicio OR p_periodo_fin > TRUNC(SYSDATE) THEN
  RAISE_APPLICATION_ERROR(-20511,'Periodo invalido o futuro');
 END IF;
 IF p_monto IS NULL OR p_monto <= 0 OR p_monto<>ROUND(p_monto,2) THEN
  RAISE_APPLICATION_ERROR(-20512,'Monto positivo con maximo dos decimales');
 END IF;
 IF TRIM(p_metodo_pago) IS NULL OR TRIM(p_numero_operacion) IS NULL OR
    TRIM(p_numero_boleta) IS NULL THEN
  RAISE_APPLICATION_ERROR(-20513,'Metodo, operacion y boleta obligatorios');
 END IF;
 
 SELECT id_doctor,correo INTO v_doc,v_correo FROM DOCTOR
 WHERE id_doctor=p_id_doctor FOR UPDATE;
 v_saldo := FN_SALDO_DOCTOR(p_id_doctor,p_periodo_fin);
 IF v_saldo <= 0 OR p_monto>v_saldo THEN
  RAISE_APPLICATION_ERROR(-20514,'Pago excede el devengo pendiente al corte');
 END IF;
 INSERT INTO LIQUIDACION (id_doctor,id_usuario_registro,periodo_inicio,
   periodo_fin,monto,metodo_pago,numero_operacion,numero_boleta)
 VALUES (p_id_doctor,p_id_usuario,p_periodo_inicio,p_periodo_fin,p_monto,
         TRIM(p_metodo_pago),TRIM(p_numero_operacion),TRIM(p_numero_boleta))
 RETURNING id_liquidacion INTO p_id_liquidacion;
 IF TRIM(v_correo) IS NULL THEN
  v_notif_estado:='FALLIDA'; v_error:='Doctor sin correo; registrar direccion valida';
 ELSE
  v_notif_estado:='PENDIENTE'; v_error:=NULL;
 END IF;
 INSERT INTO NOTIFICACION_SALIENTE (
  tipo,canal,destinatario,id_liquidacion,id_usuario_creacion,codigo_evento,
  estado,ultimo_error)
 VALUES ('PAGO_DOCTOR','EMAIL',v_correo,p_id_liquidacion,p_id_usuario,
         'PAGO_DOCTOR-'||TO_CHAR(p_id_liquidacion),v_notif_estado,v_error);
 DBMS_OUTPUT.PUT_LINE('Pago en LIQUIDACION='||p_id_liquidacion||
  ' | S/ '||TO_CHAR(p_monto)||' | saldo=S/ '||TO_CHAR(v_saldo-p_monto));
 
EXCEPTION
 WHEN NO_DATA_FOUND THEN ROLLBACK TO sv_pagar_doctor;
  RAISE_APPLICATION_ERROR(-20515,'Doctor no encontrado');
 WHEN DUP_VAL_ON_INDEX THEN ROLLBACK TO sv_pagar_doctor;
  RAISE_APPLICATION_ERROR(-20516,'Operacion o boleta ya registrada');
 WHEN OTHERS THEN ROLLBACK TO sv_pagar_doctor; RAISE;
END SP_PAGAR_DOCTOR;
/

-- Fuente: base de datos/04_FUNCIONES_PROCEDIMIENTOS.sql
CREATE OR REPLACE PROCEDURE SP_GENERAR_LIQUIDACION (
 p_id_usuario       IN USUARIO.ID_USUARIO%TYPE,
 p_id_doctor        IN DOCTOR.ID_DOCTOR%TYPE,
 p_periodo_inicio   IN DATE,
 p_periodo_fin      IN DATE,
 p_monto            IN NUMBER,
 p_metodo_pago      IN LIQUIDACION.METODO_PAGO%TYPE,
 p_numero_operacion IN LIQUIDACION.NUMERO_OPERACION%TYPE,
 p_numero_boleta    IN LIQUIDACION.NUMERO_BOLETA%TYPE,
 p_id_liquidacion   OUT LIQUIDACION.ID_LIQUIDACION%TYPE
) IS
BEGIN
 SP_PAGAR_DOCTOR(p_id_usuario,p_id_doctor,p_periodo_inicio,p_periodo_fin,
  p_monto,p_metodo_pago,p_numero_operacion,p_numero_boleta,p_id_liquidacion);
END SP_GENERAR_LIQUIDACION;
/

-- Fuente: db/migraciones/2026-11-22-administradora-acceso-total.sql
CREATE OR REPLACE PROCEDURE SP_EMITIR_RECIBO (
    P_ID_USUARIO IN USUARIO.ID_USUARIO%TYPE,
    P_ID_CITA IN CITA.ID_CITA%TYPE,
    P_NUMERO_RECIBO IN RECIBO_HONORARIO.NUMERO_RECIBO%TYPE,
    P_ID_RECIBO OUT RECIBO_HONORARIO.ID_RECIBO%TYPE
)
IS
    V_ID_DOCTOR CITA.ID_DOCTOR%TYPE;
    V_ESTADO_CITA CITA.ESTADO%TYPE;
    V_ID_PAGO CITA.ID_PAGO%TYPE;
    V_MONTO CITA.MONTO_TOTAL%TYPE;
    V_CANTIDAD NUMBER;
    V_ESTADO_ATENCION ATENCION_MEDICA.ESTADO%TYPE;
BEGIN
    P_ID_RECIBO := NULL;
    SAVEPOINT SV_EMITIR_RECIBO;

    IF NVL(FN_ROL_USUARIO(P_ID_USUARIO),'SIN_ROL') NOT IN ('DOCTOR','ADMINISTRADORA') THEN
        RAISE_APPLICATION_ERROR(-20420,'Solo el doctor asignado emite el recibo.');
    END IF;
    IF TRIM(P_NUMERO_RECIBO) IS NULL THEN
        RAISE_APPLICATION_ERROR(-20421,'El numero de recibo es obligatorio.');
    END IF;

    SELECT ID_DOCTOR,ESTADO,ID_PAGO,MONTO_TOTAL
      INTO V_ID_DOCTOR,V_ESTADO_CITA,V_ID_PAGO,V_MONTO
      FROM CITA WHERE ID_CITA=P_ID_CITA FOR UPDATE;

    IF V_ESTADO_CITA <> 'EN_ATENCION' THEN
        RAISE_APPLICATION_ERROR(-20422,'La cita no esta EN_ATENCION.');
    END IF;
    IF V_MONTO <= 0 THEN
        RAISE_APPLICATION_ERROR(-20423,'La cita no tiene un monto positivo.');
    END IF;

    SELECT COUNT(*) INTO V_CANTIDAD FROM DOCTOR
     WHERE ID_DOCTOR=V_ID_DOCTOR AND (ID_USUARIO = P_ID_USUARIO OR FN_ROL_USUARIO(P_ID_USUARIO) = 'ADMINISTRADORA') AND ESTADO='ACTIVO';
    IF V_CANTIDAD <> 1 THEN
        RAISE_APPLICATION_ERROR(-20424,'El usuario no es el doctor asignado.');
    END IF;

    SELECT ESTADO INTO V_ESTADO_ATENCION FROM ATENCION_MEDICA
     WHERE ID_CITA=P_ID_CITA AND ID_DOCTOR=V_ID_DOCTOR FOR UPDATE;
    IF V_ESTADO_ATENCION <> 'ABIERTA' THEN
        RAISE_APPLICATION_ERROR(-20425,'La atencion ya fue cerrada.');
    END IF;

    SELECT COUNT(*) INTO V_CANTIDAD
      FROM PAGO_CITA WHERE ID_PAGO=V_ID_PAGO AND ESTADO='APROBADO' AND MONTO=V_MONTO;
    IF V_CANTIDAD <> 1 THEN
        RAISE_APPLICATION_ERROR(-20426,'No existe un pago aprobado por el monto de la cita.');
    END IF;

    INSERT INTO RECIBO_HONORARIO (
        ID_CITA,NUMERO_RECIBO,MONTO,ID_DOCTOR_EMISOR
    ) VALUES (
        P_ID_CITA,TRIM(P_NUMERO_RECIBO),V_MONTO,V_ID_DOCTOR
    ) RETURNING ID_RECIBO INTO P_ID_RECIBO;

    INSERT INTO AUDITORIA (ID_USUARIO,TABLA_AFECTADA,ID_REGISTRO,ACCION,DETALLE,ORIGEN)
    VALUES (P_ID_USUARIO,'RECIBO_HONORARIO',P_ID_RECIBO,'EMITIR',
            'Registro de recibo del doctor para cita '||P_ID_CITA,'USUARIO');

    DBMS_OUTPUT.PUT_LINE('Recibo registrado: '||P_ID_RECIBO);
    DBMS_OUTPUT.PUT_LINE('La emision fiscal externa debe verificarse en la aplicacion.');
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK TO SV_EMITIR_RECIBO;
        RAISE_APPLICATION_ERROR(-20427,'La cita ya tiene recibo o el numero esta duplicado.');
    WHEN NO_DATA_FOUND THEN
        ROLLBACK TO SV_EMITIR_RECIBO;
        RAISE_APPLICATION_ERROR(-20428,'Cita o atencion no encontrada.');
    WHEN OTHERS THEN
        ROLLBACK TO SV_EMITIR_RECIBO;
        RAISE;
END SP_EMITIR_RECIBO;
/

-- Fuente: base de datos/04_FUNCIONES_PROCEDIMIENTOS.sql
CREATE OR REPLACE FUNCTION FN_MONTO_DOCTOR (
 p_monto IN NUMBER
) RETURN NUMBER IS
 v_doc_text PARAMETRO_SISTEMA.VALOR%TYPE;
 v_adm_text PARAMETRO_SISTEMA.VALOR%TYPE;
 v_doc NUMBER;
 v_adm NUMBER;
BEGIN
 IF p_monto IS NULL OR p_monto < 0 THEN
  RAISE_APPLICATION_ERROR(-20850,'Monto de consulta invalido');
 END IF;
 SELECT MAX(CASE WHEN nombre='COMISION_DOCTOR' THEN valor END),
        MAX(CASE WHEN nombre='COMISION_GESTORA' THEN valor END)
 INTO v_doc_text,v_adm_text
 FROM PARAMETRO_SISTEMA
 WHERE nombre IN ('COMISION_DOCTOR','COMISION_GESTORA') AND estado='ACTIVO';
 IF v_doc_text IS NULL OR v_adm_text IS NULL OR
    NOT REGEXP_LIKE(v_doc_text, '^([0-9]{1,2}|100)(\.[0-9]{1,2})?$') OR
    NOT REGEXP_LIKE(v_adm_text, '^([0-9]{1,2}|100)(\.[0-9]{1,2})?$') THEN
  RAISE_APPLICATION_ERROR(-20851,'Las comisiones deben ser numericas y estar activas');
 END IF;
 v_doc := TO_NUMBER(v_doc_text,'999D99','NLS_NUMERIC_CHARACTERS=''.,''');
 v_adm := TO_NUMBER(v_adm_text,'999D99','NLS_NUMERIC_CHARACTERS=''.,''');
 IF v_doc + v_adm <> 100 THEN
  RAISE_APPLICATION_ERROR(-20852,'Las comisiones deben sumar exactamente 100');
 END IF;
 RETURN ROUND(p_monto*v_doc/100,2);
END FN_MONTO_DOCTOR;
/

-- Fuente: base de datos/04_FUNCIONES_PROCEDIMIENTOS.sql
CREATE OR REPLACE FUNCTION FN_SALDO_DOCTOR (
 p_id_doctor IN DOCTOR.ID_DOCTOR%TYPE,
 p_hasta IN DATE DEFAULT TRUNC(SYSDATE)
) RETURN NUMBER IS
 v_devengado NUMBER(16,2);
 v_pagado NUMBER(16,2);
BEGIN
 IF p_hasta IS NULL THEN
  RAISE_APPLICATION_ERROR(-20855,'Fecha de corte obligatoria');
 END IF;
 SELECT NVL(SUM(c.monto_doctor_devengado),0)
 INTO v_devengado FROM CITA c
 WHERE c.id_doctor=p_id_doctor AND c.estado='ATENDIDA'
 AND c.fecha_cita < TRUNC(p_hasta)+1;
 SELECT NVL(SUM(l.monto),0) INTO v_pagado
 FROM LIQUIDACION l WHERE l.id_doctor=p_id_doctor;
 -- Los pagos historicos se descuentan integramente para impedir sobrepago
 -- al usar rangos contables solapados. Los cortes pasados son orientativos:
 -- no equivalen a reconstruccion cronologica al instante de cada pago.
 RETURN v_devengado-v_pagado;
END FN_SALDO_DOCTOR;
/

-- Fuente: base de datos/03_TRIGGERS.sql
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

-- Fuente: base de datos/03_TRIGGERS.sql
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

-- Fuente: base de datos/05_VISTAS_REPORTES.sql
CREATE OR REPLACE VIEW VW_PAGOS_CITA AS
SELECT pc.id_pago,pc.id_pre_reserva,pc.id_paciente,
 p.tipo_documento,p.numero_documento,p.nombres,p.apellidos,
 pc.fecha_pago,pc.monto,pc.metodo_pago,pc.referencia_pago,pc.estado
FROM PAGO_CITA pc JOIN PACIENTE p ON p.id_paciente=pc.id_paciente;

-- Fuente: base de datos/05_VISTAS_REPORTES.sql
CREATE OR REPLACE VIEW VW_INGRESOS_GESTORA AS
SELECT c.id_cita,c.id_doctor,c.fecha_cita,
 CAST('COMISION_ATENCION' AS VARCHAR2(35)) AS concepto,
 c.monto_gestora_devengado AS monto_ingreso
FROM CITA c WHERE c.estado='ATENDIDA' AND c.monto_gestora_devengado IS NOT NULL
UNION ALL
SELECT c.id_cita,c.id_doctor,c.fecha_cita,
 CAST('CANCELACION_REPROGRAMADA' AS VARCHAR2(35)) AS concepto,
 c.monto_total AS monto_ingreso
FROM CITA c WHERE c.estado='CANCELADA' AND c.reprogramaciones=1;

-- Fuente: base de datos/05_VISTAS_REPORTES.sql
CREATE OR REPLACE VIEW VW_SALDOS_LIQUIDACIONES AS
SELECT l.id_liquidacion,l.id_doctor,
 d.nombres||' '||d.apellidos AS nombre_doctor,
 l.periodo_inicio,l.periodo_fin,l.monto AS monto_pagado,
 l.metodo_pago,l.numero_operacion,l.numero_boleta,l.fecha_pago,
 FN_SALDO_DOCTOR(l.id_doctor,l.periodo_fin) AS saldo_pendiente
FROM LIQUIDACION l JOIN DOCTOR d ON d.id_doctor=l.id_doctor;

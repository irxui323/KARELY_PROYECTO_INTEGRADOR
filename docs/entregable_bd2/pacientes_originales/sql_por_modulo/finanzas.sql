-- Fuente: db/exposicion/SOLO_PROCEDIMIENTOS.sql
CREATE OR REPLACE PROCEDURE SP_EXP_COBROS_PERIODO(
    p_desde DATE, p_hasta DATE,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF p_desde IS NULL OR p_hasta IS NULL OR TRUNC(p_hasta) < TRUNC(p_desde) THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT METODO_PAGO, COUNT(*) AS TOTAL_PAGOS,
           SUM(MONTO) AS TOTAL_COBRADO
    FROM PAGO_CITA
    WHERE ESTADO = 'APROBADO'
      AND FECHA_PAGO >= CAST(TRUNC(p_desde) AS TIMESTAMP)
      AND FECHA_PAGO < CAST(TRUNC(p_hasta) + 1 AS TIMESTAMP)
    GROUP BY METODO_PAGO
    ORDER BY METODO_PAGO;
END;
/

-- Fuente: db/exposicion/SOLO_PROCEDIMIENTOS.sql
CREATE OR REPLACE PROCEDURE SP_EXP_PAGOS_DOCTOR(
    p_id NUMBER,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF p_id IS NULL OR p_id <= 0 OR p_id <> TRUNC(p_id) THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT ID_LIQUIDACION, PERIODO_INICIO, PERIODO_FIN,
           MONTO, METODO_PAGO, FECHA_PAGO
    FROM LIQUIDACION
    WHERE ID_DOCTOR = p_id
    ORDER BY FECHA_PAGO DESC, ID_LIQUIDACION DESC;
END;
/

-- Fuente: db/exposicion/SOLO_PROCEDIMIENTOS.sql
CREATE OR REPLACE PROCEDURE SP_EXP_INGRESOS_GESTORA(
    p_desde DATE, p_hasta DATE,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF p_desde IS NULL OR p_hasta IS NULL OR TRUNC(p_hasta) < TRUNC(p_desde) THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT CONCEPTO, COUNT(*) AS TOTAL_MOVIMIENTOS,
           SUM(MONTO_INGRESO) AS TOTAL_INGRESO
    FROM VW_INGRESOS_GESTORA
    WHERE FECHA_CITA >= TRUNC(p_desde)
      AND FECHA_CITA < TRUNC(p_hasta) + 1
    GROUP BY CONCEPTO
    ORDER BY CONCEPTO;
END;
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

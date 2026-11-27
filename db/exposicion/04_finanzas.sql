-- Exposicion Karely: procedimientos NUEVOS de consulta.
-- Ejecutar como KARELY_BD2 con F5. No instala datos ni reemplaza SP existentes.
-- AUTHID CURRENT_USER usa los privilegios de quien ejecuta; no se conceden GRANT.
SET DEFINE OFF
SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

-- Cobros aprobados por método
-- Resume los cobros aprobados del periodo separándolos por método de pago.
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

-- Pagos realizados al doctor
-- Lista las liquidaciones ya registradas para un doctor; no genera pagos nuevos.
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

-- Ingresos de la gestora por concepto
-- Resume por concepto los ingresos definidos por la vista vigente del proyecto.
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

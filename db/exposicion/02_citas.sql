-- Exposicion Karely: procedimientos NUEVOS de consulta.
-- Ejecutar como KARELY_BD2 con F5. No instala datos ni reemplaza SP existentes.
-- AUTHID CURRENT_USER usa los privilegios de quien ejecuta; no se conceden GRANT.
SET DEFINE OFF
SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

-- Agenda de citas por día
-- Consulta las citas de una fecha con paciente, hora, estado e importe.
CREATE OR REPLACE PROCEDURE SP_EXP_AGENDA_DIA(
    p_fecha DATE,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF p_fecha IS NULL THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT C.ID_CITA, P.NOMBRES, P.APELLIDOS, C.ESTADO,
           F.HORA_INICIO, C.MONTO_TOTAL
    FROM CITA C
    JOIN PACIENTE P ON P.ID_PACIENTE = C.ID_PACIENTE
    JOIN FRANJA_HORARIA F ON F.ID_FRANJA = C.ID_FRANJA
    WHERE C.FECHA_CITA = TRUNC(p_fecha)
    ORDER BY F.HORA_INICIO, C.ID_CITA;
END;
/

-- Cantidad de citas por estado
-- Cuenta las citas programadas, atendidas, canceladas y demás estados de un periodo.
CREATE OR REPLACE PROCEDURE SP_EXP_RESUMEN_CITAS(
    p_desde DATE, p_hasta DATE,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF p_desde IS NULL OR p_hasta IS NULL OR TRUNC(p_hasta) < TRUNC(p_desde) THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT ESTADO, COUNT(*) AS TOTAL_CITAS
    FROM CITA
    WHERE FECHA_CITA >= TRUNC(p_desde)
      AND FECHA_CITA < TRUNC(p_hasta) + 1
    GROUP BY ESTADO
    ORDER BY ESTADO;
END;
/

-- Consultar la reprogramación de una cita
-- Consulta la fecha anterior, la nueva fecha y el motivo de una reprogramación.
CREATE OR REPLACE PROCEDURE SP_EXP_CAMBIO_CITA(
    p_id NUMBER,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF p_id IS NULL OR p_id <= 0 OR p_id <> TRUNC(p_id) THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT ID_CITA, FECHA_ORIGINAL, FECHA_NUEVA, MOTIVO,
           ACEPTACION_PACIENTE, FECHA_REGISTRO
    FROM REPROGRAMACION_CITA
    WHERE ID_CITA = p_id;
END;
/

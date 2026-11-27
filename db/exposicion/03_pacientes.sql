-- Exposicion Karely: procedimientos NUEVOS de consulta.
-- Ejecutar como KARELY_BD2 con F5. No instala datos ni reemplaza SP existentes.
-- AUTHID CURRENT_USER usa los privilegios de quien ejecuta; no se conceden GRANT.
SET DEFINE OFF
SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

-- Buscar paciente por documento
-- Localiza al paciente usando su tipo y número de documento, respetando la clave de búsqueda compuesta.
CREATE OR REPLACE PROCEDURE SP_EXP_BUSCAR_PACIENTE(
    p_tipo VARCHAR2, p_documento VARCHAR2,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF TRIM(p_tipo) IS NULL OR TRIM(p_documento) IS NULL THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT ID_PACIENTE, NOMBRES, APELLIDOS, ESTADO
    FROM PACIENTE
    WHERE TIPO_DOCUMENTO = UPPER(TRIM(p_tipo))
      AND NUMERO_DOCUMENTO = TRIM(p_documento);
END;
/

-- Historial de atenciones del paciente
-- Muestra las atenciones que tiene un paciente y si están abiertas o cerradas.
CREATE OR REPLACE PROCEDURE SP_EXP_HISTORIAL_PAC(
    p_id NUMBER,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF p_id IS NULL OR p_id <= 0 OR p_id <> TRUNC(p_id) THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT C.ID_CITA, C.FECHA_CITA, A.ID_ATENCION,
           A.ESTADO, A.FECHA_INICIO, A.FECHA_CIERRE
    FROM CITA C
    JOIN ATENCION_MEDICA A ON A.ID_CITA = C.ID_CITA
    WHERE C.ID_PACIENTE = p_id
    ORDER BY C.FECHA_CITA DESC, C.ID_CITA DESC;
END;
/

-- Medicamentos de una receta
-- Consulta las indicaciones de cada medicamento registrado en una receta.
CREATE OR REPLACE PROCEDURE SP_EXP_DETALLE_RECETA(
    p_id NUMBER,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF p_id IS NULL OR p_id <= 0 OR p_id <> TRUNC(p_id) THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT MEDICAMENTO, DOSIS, FRECUENCIA, DURACION,
           OBSERVACIONES
    FROM RECETA_DETALLE
    WHERE ID_RECETA = p_id
    ORDER BY ID_DETALLE;
END;
/

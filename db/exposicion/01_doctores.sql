-- Exposicion Karely: procedimientos NUEVOS de consulta.
-- Ejecutar como KARELY_BD2 con F5. No instala datos ni reemplaza SP existentes.
-- AUTHID CURRENT_USER usa los privilegios de quien ejecuta; no se conceden GRANT.
SET DEFINE OFF
SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

-- Especialidades de un doctor
-- Consulta las especialidades asignadas a un doctor y su precio vigente.
CREATE OR REPLACE PROCEDURE SP_EXP_ESPECIALIDADES_DOC(
    p_id NUMBER,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF p_id IS NULL OR p_id <= 0 OR p_id <> TRUNC(p_id) THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT E.NOMBRE, E.PRECIO_CONSULTA, E.ESTADO
    FROM DOCTOR_ESPECIALIDAD DE
    JOIN ESPECIALIDAD E ON E.ID_ESPECIALIDAD = DE.ID_ESPECIALIDAD
    WHERE DE.ID_DOCTOR = p_id
    ORDER BY E.NOMBRE;
END;
/

-- Revisión documental del doctor
-- Muestra qué documentos están pendientes, validados o rechazados; no cambia su estado.
CREATE OR REPLACE PROCEDURE SP_EXP_DOCUMENTOS_DOC(
    p_id NUMBER,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF p_id IS NULL OR p_id <= 0 OR p_id <> TRUNC(p_id) THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT TIPO_DOCUMENTO, ESTADO, FECHA_VALIDACION
    FROM DOCUMENTO_DOCTOR
    WHERE ID_DOCTOR = p_id
    ORDER BY TIPO_DOCUMENTO, ID_DOCUMENTO;
END;
/

-- Horarios de un doctor
-- Lista las disponibilidades registradas de un solo doctor.
CREATE OR REPLACE PROCEDURE SP_EXP_HORARIOS_DOC(
    p_id NUMBER,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF p_id IS NULL OR p_id <= 0 OR p_id <> TRUNC(p_id) THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT DD.FECHA_TURNO, F.HORA_INICIO, F.HORA_FIN, DD.ESTADO
    FROM DISPONIBILIDAD_DOCTOR DD
    JOIN FRANJA_HORARIA F ON F.ID_FRANJA = DD.ID_FRANJA
    WHERE DD.ID_DOCTOR = p_id
    ORDER BY DD.FECHA_TURNO, F.HORA_INICIO;
END;
/

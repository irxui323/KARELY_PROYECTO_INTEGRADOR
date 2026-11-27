-- Exposicion Karely: procedimientos NUEVOS de consulta.
-- Ejecutar como KARELY_BD2 con F5. No instala datos ni reemplaza SP existentes.
-- AUTHID CURRENT_USER usa los privilegios de quien ejecuta; no se conceden GRANT.
SET DEFINE OFF
SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

-- Control de llegadas del día
-- Permite revisar qué citas tienen presencia registrada y cuáles no.
CREATE OR REPLACE PROCEDURE SP_EXP_ASISTENCIAS_DIA(
    p_fecha DATE,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF p_fecha IS NULL THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT C.ID_CITA, P.NOMBRES, P.APELLIDOS, C.ESTADO,
           CASE WHEN A.ID_ASISTENCIA IS NULL
                THEN 'SIN REGISTRO' ELSE 'PRESENTE' END AS LLEGADA
    FROM CITA C
    JOIN PACIENTE P ON P.ID_PACIENTE = C.ID_PACIENTE
    LEFT JOIN ASISTENCIA A ON A.ID_CITA = C.ID_CITA
    WHERE C.FECHA_CITA = TRUNC(p_fecha)
    ORDER BY C.ID_CITA;
END;
/

-- Usuarios por estado y rol
-- Lista las cuentas del estado solicitado y el rol de aplicación de cada una.
CREATE OR REPLACE PROCEDURE SP_EXP_USUARIOS_ESTADO(
    p_estado VARCHAR2,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF TRIM(p_estado) IS NULL OR UPPER(TRIM(p_estado)) NOT IN ('ACTIVO','INACTIVO','BLOQUEADO') THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT U.USERNAME, R.NOMBRE AS ROL, U.ESTADO
    FROM USUARIO U
    JOIN ROL R ON R.ID_ROL = U.ID_ROL
    WHERE U.ESTADO = UPPER(TRIM(p_estado))
    ORDER BY R.NOMBRE, U.USERNAME;
END;
/

-- Historial de sesiones de un usuario
-- Muestra las sesiones almacenadas de un usuario y sus fechas de actividad y cierre.
CREATE OR REPLACE PROCEDURE SP_EXP_SESIONES_USUARIO(
    p_id NUMBER,
    p_resultado OUT SYS_REFCURSOR
) AUTHID CURRENT_USER IS
BEGIN
    IF p_id IS NULL OR p_id <= 0 OR p_id <> TRUNC(p_id) THEN
        RAISE_APPLICATION_ERROR(-20880, 'Parametros de consulta invalidos.');
    END IF;
    OPEN p_resultado FOR
    SELECT ID_SESION, FECHA_INICIO, ULTIMA_ACTIVIDAD,
           FECHA_FIN, ESTADO
    FROM SESION_USUARIO
    WHERE ID_USUARIO = p_id
    ORDER BY FECHA_INICIO DESC, ID_SESION DESC;
END;
/

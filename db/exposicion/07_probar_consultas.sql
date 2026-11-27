-- Exposicion Karely: procedimientos NUEVOS de consulta.
-- Ejecutar como KARELY_BD2 con F5. No instala datos ni reemplaza SP existentes.
-- AUTHID CURRENT_USER usa los privilegios de quien ejecuta; no se conceden GRANT.
SET DEFINE OFF
SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

-- Despues del 00, ejecutar como KARELY_BD2 con F5. Solo lectura.

PROMPT SP_EXP_ESPECIALIDADES_DOC
VARIABLE resultado REFCURSOR
DECLARE
    v_id NUMBER;
BEGIN
    SELECT NVL(MIN(ID_DOCTOR), 1) INTO v_id FROM DOCTOR;
    SP_EXP_ESPECIALIDADES_DOC(v_id, :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_ESPECIALIDADES_DOC(NULL, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_DOCUMENTOS_DOC
VARIABLE resultado REFCURSOR
DECLARE
    v_id NUMBER;
BEGIN
    SELECT NVL(MIN(ID_DOCTOR), 1) INTO v_id FROM DOCTOR;
    SP_EXP_DOCUMENTOS_DOC(v_id, :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_DOCUMENTOS_DOC(NULL, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_HORARIOS_DOC
VARIABLE resultado REFCURSOR
DECLARE
    v_id NUMBER;
BEGIN
    SELECT NVL(MIN(ID_DOCTOR), 1) INTO v_id FROM DOCTOR;
    SP_EXP_HORARIOS_DOC(v_id, :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_HORARIOS_DOC(NULL, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_AGENDA_DIA
VARIABLE resultado REFCURSOR
BEGIN
    SP_EXP_AGENDA_DIA(TRUNC(SYSDATE), :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_AGENDA_DIA(NULL, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_RESUMEN_CITAS
VARIABLE resultado REFCURSOR
BEGIN
    SP_EXP_RESUMEN_CITAS(TRUNC(SYSDATE)-30, TRUNC(SYSDATE), :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_RESUMEN_CITAS(SYSDATE, SYSDATE-1, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_CAMBIO_CITA
VARIABLE resultado REFCURSOR
DECLARE
    v_id NUMBER;
BEGIN
    SELECT NVL(MIN(ID_CITA), 1) INTO v_id FROM CITA;
    SP_EXP_CAMBIO_CITA(v_id, :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_CAMBIO_CITA(NULL, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_BUSCAR_PACIENTE
VARIABLE resultado REFCURSOR
DECLARE
    v_tipo PACIENTE.TIPO_DOCUMENTO%TYPE;
    v_documento PACIENTE.NUMERO_DOCUMENTO%TYPE;
BEGIN
    SELECT TIPO_DOCUMENTO, NUMERO_DOCUMENTO
    INTO v_tipo, v_documento FROM PACIENTE
    ORDER BY ID_PACIENTE FETCH FIRST 1 ROW ONLY;
    SP_EXP_BUSCAR_PACIENTE(v_tipo, v_documento, :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_BUSCAR_PACIENTE(NULL, NULL, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_HISTORIAL_PAC
VARIABLE resultado REFCURSOR
DECLARE
    v_id NUMBER;
BEGIN
    SELECT NVL(MIN(ID_PACIENTE), 1) INTO v_id FROM PACIENTE;
    SP_EXP_HISTORIAL_PAC(v_id, :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_HISTORIAL_PAC(NULL, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_DETALLE_RECETA
VARIABLE resultado REFCURSOR
DECLARE
    v_id NUMBER;
BEGIN
    SELECT NVL(MIN(ID_RECETA), 1) INTO v_id FROM RECETA;
    SP_EXP_DETALLE_RECETA(v_id, :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_DETALLE_RECETA(NULL, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_COBROS_PERIODO
VARIABLE resultado REFCURSOR
BEGIN
    SP_EXP_COBROS_PERIODO(TRUNC(SYSDATE)-30, TRUNC(SYSDATE), :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_COBROS_PERIODO(SYSDATE, SYSDATE-1, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_PAGOS_DOCTOR
VARIABLE resultado REFCURSOR
DECLARE
    v_id NUMBER;
BEGIN
    SELECT NVL(MIN(ID_DOCTOR), 1) INTO v_id FROM DOCTOR;
    SP_EXP_PAGOS_DOCTOR(v_id, :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_PAGOS_DOCTOR(NULL, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_INGRESOS_GESTORA
VARIABLE resultado REFCURSOR
BEGIN
    SP_EXP_INGRESOS_GESTORA(TRUNC(SYSDATE)-30, TRUNC(SYSDATE), :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_INGRESOS_GESTORA(SYSDATE, SYSDATE-1, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_ASISTENCIAS_DIA
VARIABLE resultado REFCURSOR
BEGIN
    SP_EXP_ASISTENCIAS_DIA(TRUNC(SYSDATE), :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_ASISTENCIAS_DIA(NULL, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_USUARIOS_ESTADO
VARIABLE resultado REFCURSOR
BEGIN
    SP_EXP_USUARIOS_ESTADO('ACTIVO', :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_USUARIOS_ESTADO('OTRO', v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

PROMPT SP_EXP_SESIONES_USUARIO
VARIABLE resultado REFCURSOR
DECLARE
    v_id NUMBER;
BEGIN
    SELECT NVL(MIN(ID_USUARIO), 1) INTO v_id FROM USUARIO;
    SP_EXP_SESIONES_USUARIO(v_id, :resultado);
END;
/
PRINT resultado
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    BEGIN
        SP_EXP_SESIONES_USUARIO(NULL, v_cursor);
        CLOSE v_cursor;
        RAISE_APPLICATION_ERROR(-20882, 'FALLO: acepto parametros invalidos.');
    EXCEPTION WHEN OTHERS THEN
        IF SQLCODE <> -20880 THEN RAISE; END IF;
        DBMS_OUTPUT.PUT_LINE('CORRECTO: parametros invalidos rechazados.');
    END;
END;
/

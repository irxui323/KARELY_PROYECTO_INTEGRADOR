-- DATOS INICIALES PARA PRESENTACION (personas y documentos ficticios)
-- Ejecutar DESPUES de 00_reinicio_total_conservar_maestros.sql, conectado como KARELY_BD2.
-- Clave inicial de todas las cuentas creadas: KarelyTest2026!
-- Cambiar la clave al finalizar la demostracion.

SET DEFINE OFF
SET SERVEROUTPUT ON SIZE UNLIMITED
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

DECLARE
    c_hash CONSTANT VARCHAR2(255) := '$2a$10$F73MH.M57EzqweWrk7KiCOzvB4z5HTXl7esrODcS5LxjttIftHEvO';
    v_admin NUMBER;
    v_tesoreria NUMBER;
    v_doctor NUMBER;
    v_usuario NUMBER;
    v_especialidad NUMBER;
    v_consultorio NUMBER;
    v_franja NUMBER;
    v_franja_actual NUMBER;
    v_fecha_programada DATE;
    v_paciente NUMBER;
    v_pre NUMBER;
    v_pago NUMBER;
    v_cita NUMBER;
    v_atencion NUMBER;
    v_receta NUMBER;
    v_precio NUMBER;
    v_devengo NUMBER;
    v_total NUMBER;

    PROCEDURE asegurar_rol(p_nombre VARCHAR2) IS
    BEGIN
        INSERT INTO ROL(NOMBRE, ESTADO)
        SELECT p_nombre, 'ACTIVO' FROM DUAL
         WHERE NOT EXISTS (SELECT 1 FROM ROL WHERE NOMBRE = p_nombre);
    END;

    PROCEDURE crear_usuario(p_usuario VARCHAR2, p_rol VARCHAR2, p_correo VARCHAR2) IS
        v_correo_efectivo USUARIO.CORREO%TYPE := p_correo;
    BEGIN
        SELECT COUNT(*) INTO v_total FROM USUARIO WHERE LOWER(CORREO) = LOWER(p_correo);
        IF v_total > 0 THEN
            v_correo_efectivo := p_usuario || '@karely.local';
            DBMS_OUTPUT.PUT_LINE('Correo ya ocupado: ' || p_correo || '. Se asigno: ' || v_correo_efectivo);
        END IF;
        INSERT INTO USUARIO(ID_ROL, USERNAME, CORREO, PASSWORD_HASH, ESTADO, INTENTOS_FALLIDOS)
        SELECT ID_ROL, p_usuario, v_correo_efectivo, c_hash, 'ACTIVO', 0
          FROM ROL
         WHERE NOMBRE = p_rol;
    END;

    PROCEDURE registrar_documento(p_doctor NUMBER, p_tipo VARCHAR2, p_nombre VARCHAR2) IS
        v_archivo BLOB;
        v_raw RAW(2000) := UTL_RAW.CAST_TO_RAW('%PDF-1.4 Documento ficticio para ambiente de presentacion');
    BEGIN
        DBMS_LOB.CREATETEMPORARY(v_archivo, TRUE);
        DBMS_LOB.WRITEAPPEND(v_archivo, UTL_RAW.LENGTH(v_raw), v_raw);
        INSERT INTO DOCUMENTO_DOCTOR(
            ID_DOCTOR, TIPO_DOCUMENTO, NOMBRE_ARCHIVO, TIPO_MIME, ARCHIVO,
            ESTADO, FECHA_VALIDACION, USUARIO_VALIDACION
        ) VALUES (
            p_doctor, p_tipo, p_nombre, 'application/pdf', v_archivo,
            'VALIDADO', SYSTIMESTAMP, v_admin
        );
        DBMS_LOB.FREETEMPORARY(v_archivo);
    END;

    PROCEDURE crear_doctor(
        p_usuario VARCHAR2, p_correo VARCHAR2, p_documento VARCHAR2,
        p_nombres VARCHAR2, p_apellidos VARCHAR2, p_telefono VARCHAR2,
        p_especialidad VARCHAR2
    ) IS
        v_correo_efectivo USUARIO.CORREO%TYPE;
    BEGIN
        crear_usuario(p_usuario, 'DOCTOR', p_correo);
        SELECT ID_USUARIO, CORREO INTO v_usuario, v_correo_efectivo FROM USUARIO WHERE USERNAME = p_usuario;
        INSERT INTO DOCTOR(
            ID_USUARIO, TIPO_DOCUMENTO, NUMERO_DOCUMENTO, NOMBRES, APELLIDOS,
            TELEFONO, CORREO, ESTADO_DOCUMENTACION, ESTADO
        ) VALUES (
            v_usuario, 'DNI', p_documento, p_nombres, p_apellidos,
            p_telefono, v_correo_efectivo, 'INCOMPLETO', 'ACTIVO'
        ) RETURNING ID_DOCTOR INTO v_doctor;
        registrar_documento(v_doctor, 'DNI', 'dni_' || p_usuario || '.pdf');
        registrar_documento(v_doctor, 'TITULO', 'titulo_' || p_usuario || '.pdf');
        UPDATE DOCTOR SET ESTADO_DOCUMENTACION = 'COMPLETO' WHERE ID_DOCTOR = v_doctor;
        SELECT ID_ESPECIALIDAD INTO v_especialidad
          FROM ESPECIALIDAD WHERE NOMBRE = p_especialidad AND ESTADO = 'ACTIVO';
        INSERT INTO DOCTOR_ESPECIALIDAD(ID_DOCTOR, ID_ESPECIALIDAD)
        VALUES (v_doctor, v_especialidad);
    END;

    PROCEDURE crear_cita(
        p_paciente NUMBER, p_doctor NUMBER, p_especialidad NUMBER,
        p_consultorio NUMBER, p_franja NUMBER, p_fecha DATE,
        p_referencia VARCHAR2, p_estado VARCHAR2, p_con_atencion CHAR
    ) IS
    BEGIN
        SELECT PRECIO_CONSULTA INTO v_precio FROM ESPECIALIDAD WHERE ID_ESPECIALIDAD = p_especialidad;
        INSERT INTO PRE_RESERVA_CITA(
            ID_PACIENTE, ID_DOCTOR, ID_ESPECIALIDAD, ID_CONSULTORIO, ID_FRANJA,
            FECHA_CITA, MONTO, FECHA_BLOQUEO, FECHA_EXPIRACION, ESTADO
        ) VALUES (
            p_paciente, p_doctor, p_especialidad, p_consultorio, p_franja,
            p_fecha, v_precio, SYSTIMESTAMP, SYSTIMESTAMP + INTERVAL '10' MINUTE, 'CONFIRMADA'
        ) RETURNING ID_PRE_RESERVA INTO v_pre;
        INSERT INTO PAGO_CITA(ID_PRE_RESERVA, ID_PACIENTE, MONTO, METODO_PAGO, REFERENCIA_PAGO, ESTADO)
        VALUES (v_pre, p_paciente, v_precio, 'EFECTIVO', p_referencia, 'APROBADO')
        RETURNING ID_PAGO INTO v_pago;
        INSERT INTO CITA(
            ID_PRE_RESERVA, ID_PACIENTE, ID_DOCTOR, ID_ESPECIALIDAD, ID_CONSULTORIO,
            ID_FRANJA, ID_PAGO, FECHA_CITA, MONTO_TOTAL, ESTADO
        ) VALUES (
            v_pre, p_paciente, p_doctor, p_especialidad, p_consultorio,
            p_franja, v_pago, p_fecha, v_precio, p_estado
        ) RETURNING ID_CITA INTO v_cita;
        IF p_estado IN ('EN_ATENCION', 'ATENDIDA') THEN
            INSERT INTO ASISTENCIA(ID_CITA, ESTADO) VALUES (v_cita, 'PRESENTE');
            INSERT INTO ATENCION_MEDICA(ID_CITA, ID_DOCTOR, ESTADO, FECHA_INICIO, FECHA_CIERRE)
            VALUES (
                v_cita, p_doctor, CASE WHEN p_estado = 'ATENDIDA' THEN 'CERRADA' ELSE 'ABIERTA' END,
                SYSTIMESTAMP - INTERVAL '20' MINUTE,
                CASE WHEN p_estado = 'ATENDIDA' THEN SYSTIMESTAMP - INTERVAL '5' MINUTE END
            ) RETURNING ID_ATENCION INTO v_atencion;
        END IF;
    END;

BEGIN
    IF USER <> 'KARELY_BD2' THEN
        RAISE_APPLICATION_ERROR(-20990, 'Ejecutar conectado como KARELY_BD2.');
    END IF;
    SELECT COUNT(*) INTO v_total FROM USUARIO WHERE USERNAME IN (
        'recepcion.centro', 'tesoreria.centro', 'dra.elena.rojas', 'dr.marcos.salas',
        'dra.valeria.torres', 'dr.daniel.castro', 'dra.sofia.mendoza', 'dr.renato.paredes'
    );
    IF v_total > 0 THEN
        RAISE_APPLICATION_ERROR(-20991, 'Ya existen datos iniciales. Ejecutar primero el reinicio total.');
    END IF;

    asegurar_rol('ADMINISTRADORA');
    asegurar_rol('RECEPCIONISTA');
    asegurar_rol('TESORERA');
    asegurar_rol('DOCTOR');
    UPDATE ESPECIALIDAD SET ESTADO = 'INACTIVO' WHERE UPPER(NOMBRE) LIKE 'TEST %';
    UPDATE CONSULTORIO SET ESTADO = 'INACTIVO' WHERE UPPER(NOMBRE) LIKE 'TEST %';

    FOR e IN (
        SELECT 'Medicina General' nombre, 100 precio FROM DUAL UNION ALL
        SELECT 'Dermatologia', 150 FROM DUAL UNION ALL
        SELECT 'Pediatria', 120 FROM DUAL UNION ALL
        SELECT 'Psicologia', 110 FROM DUAL UNION ALL
        SELECT 'Cardiologia', 180 FROM DUAL UNION ALL
        SELECT 'Nutricion', 90 FROM DUAL
    ) LOOP
        INSERT INTO ESPECIALIDAD(NOMBRE, PRECIO_CONSULTA, ESTADO)
        SELECT e.nombre, e.precio, 'ACTIVO' FROM DUAL
         WHERE NOT EXISTS (SELECT 1 FROM ESPECIALIDAD x WHERE x.NOMBRE = e.nombre);
        UPDATE ESPECIALIDAD SET ESTADO = 'ACTIVO', PRECIO_CONSULTA = e.precio WHERE NOMBRE = e.nombre;
    END LOOP;
    INSERT INTO CONSULTORIO(NOMBRE, UBICACION, ESTADO)
    SELECT 'Consultorio Central 1', 'Primer piso', 'ACTIVO' FROM DUAL
     WHERE NOT EXISTS (SELECT 1 FROM CONSULTORIO WHERE NOMBRE = 'Consultorio Central 1');
    INSERT INTO CONSULTORIO(NOMBRE, UBICACION, ESTADO)
    SELECT 'Consultorio Central 2', 'Segundo piso', 'ACTIVO' FROM DUAL
     WHERE NOT EXISTS (SELECT 1 FROM CONSULTORIO WHERE NOMBRE = 'Consultorio Central 2');
    FOR h IN 8..17 LOOP
        INSERT INTO FRANJA_HORARIA(HORA_INICIO, HORA_FIN, ESTADO)
        SELECT LPAD(h, 2, '0') || ':00', LPAD(h + 1, 2, '0') || ':00', 'ACTIVO' FROM DUAL
         WHERE NOT EXISTS (
            SELECT 1 FROM FRANJA_HORARIA
             WHERE HORA_INICIO = LPAD(h, 2, '0') || ':00'
               AND HORA_FIN = LPAD(h + 1, 2, '0') || ':00'
         );
    END LOOP;

    SELECT ID_USUARIO INTO v_admin FROM USUARIO WHERE USERNAME = 'admin01' AND ESTADO = 'ACTIVO';
    DBMS_SESSION.SET_IDENTIFIER(TO_CHAR(v_admin));
    crear_usuario('recepcion.centro', 'RECEPCIONISTA', 'luissandresscesspedess31@gmail.com');
    crear_usuario('tesoreria.centro', 'TESORERA', 'tesoreria.karely@example.com');
    SELECT ID_USUARIO INTO v_tesoreria FROM USUARIO WHERE USERNAME = 'tesoreria.centro';

    crear_doctor('dra.elena.rojas', 'lgsebasa@gmail.com', '74238101', 'Elena', 'Rojas Medina', '900310101', 'Medicina General');
    crear_doctor('dr.marcos.salas', 'jomacp3003cch@gmail.com', '74238102', 'Marcos', 'Salas Vega', '900310102', 'Dermatologia');
    crear_doctor('dra.valeria.torres', 'empresaunico92@gmail.com', '74238103', 'Valeria', 'Torres Ramos', '900310103', 'Pediatria');
    crear_doctor('dr.daniel.castro', 'jsjsjs3203@gmail.com', '74238104', 'Daniel', 'Castro Ruiz', '900310104', 'Psicologia');
    crear_doctor('dra.sofia.mendoza', 'carlosat.246@gmail.com', '74238105', 'Sofia', 'Mendoza Leon', '900310105', 'Cardiologia');
    crear_doctor('dr.renato.paredes', 'ytjosegames2007@gmail.com', '74238106', 'Renato', 'Paredes Soto', '900310106', 'Nutricion');

    FOR p IN 1..8 LOOP
        INSERT INTO PACIENTE(TIPO_DOCUMENTO, NUMERO_DOCUMENTO, NOMBRES, APELLIDOS, FECHA_NACIMIENTO, TELEFONO, CORREO, DIRECCION, ESTADO)
        VALUES (
            'DNI', TO_CHAR(70580000 + p),
            CASE p WHEN 1 THEN 'Lucia' WHEN 2 THEN 'Mateo' WHEN 3 THEN 'Camila' WHEN 4 THEN 'Javier'
                   WHEN 5 THEN 'Paola' WHEN 6 THEN 'Andres' WHEN 7 THEN 'Mariana' ELSE 'Gabriel' END,
            CASE p WHEN 1 THEN 'Herrera' WHEN 2 THEN 'Navarro' WHEN 3 THEN 'Soto' WHEN 4 THEN 'Fuentes'
                   WHEN 5 THEN 'Mendoza' WHEN 6 THEN 'Vargas' WHEN 7 THEN 'Campos' ELSE 'Rios' END,
            ADD_MONTHS(TRUNC(SYSDATE), -12 * (21 + p)), '910500' || LPAD(p, 3, '0'),
            'paciente' || p || '@example.com', 'Direccion registrada ' || p, 'ACTIVO'
        );
    END LOOP;

    FOR d IN (
        SELECT d.ID_DOCTOR, de.ID_ESPECIALIDAD
          FROM DOCTOR d JOIN DOCTOR_ESPECIALIDAD de ON de.ID_DOCTOR = d.ID_DOCTOR
         WHERE d.ESTADO = 'ACTIVO' AND d.ESTADO_DOCUMENTACION = 'COMPLETO'
    ) LOOP
        FOR dia IN 0..6 LOOP
            FOR f IN (
                SELECT ID_FRANJA FROM FRANJA_HORARIA
                 WHERE ESTADO = 'ACTIVO' AND HORA_INICIO BETWEEN '08:00' AND '17:00'
            ) LOOP
                INSERT INTO DISPONIBILIDAD_DOCTOR(ID_DOCTOR, ID_FRANJA, FECHA_TURNO, ID_ESPECIALIDAD, ESTADO)
                SELECT d.ID_DOCTOR, f.ID_FRANJA, TRUNC(SYSDATE) + dia, d.ID_ESPECIALIDAD, 'ACTIVO' FROM DUAL
                 WHERE NOT EXISTS (
                    SELECT 1 FROM DISPONIBILIDAD_DOCTOR x
                     WHERE x.ID_DOCTOR = d.ID_DOCTOR AND x.ID_FRANJA = f.ID_FRANJA
                       AND x.FECHA_TURNO = TRUNC(SYSDATE) + dia
                 );
            END LOOP;
        END LOOP;
    END LOOP;

    SELECT ID_CONSULTORIO INTO v_consultorio FROM CONSULTORIO WHERE NOMBRE = 'Consultorio Central 1';
    SELECT ID_DOCTOR, ID_ESPECIALIDAD INTO v_doctor, v_especialidad
      FROM (
        SELECT d.ID_DOCTOR, de.ID_ESPECIALIDAD
          FROM DOCTOR d JOIN DOCTOR_ESPECIALIDAD de ON de.ID_DOCTOR = d.ID_DOCTOR
         WHERE d.ID_USUARIO = (SELECT ID_USUARIO FROM USUARIO WHERE USERNAME = 'dra.elena.rojas')
      );
    SELECT ID_PACIENTE INTO v_paciente FROM PACIENTE WHERE NUMERO_DOCUMENTO = '70580001';
    BEGIN
        SELECT ID_FRANJA, TRUNC(SYSDATE) INTO v_franja, v_fecha_programada
          FROM (
            SELECT ID_FRANJA FROM FRANJA_HORARIA
             WHERE ESTADO = 'ACTIVO' AND HORA_INICIO > TO_CHAR(SYSDATE + 30/1440, 'HH24:MI')
             ORDER BY HORA_INICIO
          ) WHERE ROWNUM = 1;
    EXCEPTION WHEN NO_DATA_FOUND THEN
        SELECT ID_FRANJA INTO v_franja FROM (
            SELECT ID_FRANJA FROM FRANJA_HORARIA WHERE ESTADO = 'ACTIVO' ORDER BY HORA_INICIO
        ) WHERE ROWNUM = 1;
        v_fecha_programada := TRUNC(SYSDATE) + 1;
    END;
    crear_cita(v_paciente, v_doctor, v_especialidad, v_consultorio, v_franja, v_fecha_programada, 'PAGO-2026-0001', 'PROGRAMADA', 'N');

    SELECT ID_CONSULTORIO INTO v_consultorio FROM CONSULTORIO WHERE NOMBRE = 'Consultorio Central 2';
    SELECT d.ID_DOCTOR, de.ID_ESPECIALIDAD INTO v_doctor, v_especialidad
      FROM DOCTOR d JOIN DOCTOR_ESPECIALIDAD de ON de.ID_DOCTOR = d.ID_DOCTOR
     WHERE d.ID_USUARIO = (SELECT ID_USUARIO FROM USUARIO WHERE USERNAME = 'dr.marcos.salas');
    SELECT ID_PACIENTE INTO v_paciente FROM PACIENTE WHERE NUMERO_DOCUMENTO = '70580002';
    SELECT ID_FRANJA INTO v_franja_actual FROM (
        SELECT ID_FRANJA FROM FRANJA_HORARIA WHERE ESTADO = 'ACTIVO' ORDER BY HORA_INICIO
    ) WHERE ROWNUM = 1;
    crear_cita(v_paciente, v_doctor, v_especialidad, v_consultorio, v_franja_actual, TRUNC(SYSDATE), 'PAGO-2026-0002', 'EN_ATENCION', 'S');

    SELECT d.ID_DOCTOR, de.ID_ESPECIALIDAD INTO v_doctor, v_especialidad
      FROM DOCTOR d JOIN DOCTOR_ESPECIALIDAD de ON de.ID_DOCTOR = d.ID_DOCTOR
     WHERE d.ID_USUARIO = (SELECT ID_USUARIO FROM USUARIO WHERE USERNAME = 'dra.valeria.torres');
    SELECT ID_PACIENTE INTO v_paciente FROM PACIENTE WHERE NUMERO_DOCUMENTO = '70580003';
    crear_cita(v_paciente, v_doctor, v_especialidad, v_consultorio, v_franja_actual, TRUNC(SYSDATE) - 7, 'PAGO-2026-0003', 'ATENDIDA', 'S');
    UPDATE ATENCION_MEDICA SET DIAGNOSTICO = 'Control clinico registrado', OBSERVACIONES = 'Atencion cerrada para consulta administrativa'
     WHERE ID_ATENCION = v_atencion;
    INSERT INTO RECETA(ID_ATENCION, INDICACIONES) VALUES (v_atencion, 'Indicaciones registradas para seguimiento') RETURNING ID_RECETA INTO v_receta;
    INSERT INTO RECETA_DETALLE(ID_RECETA, MEDICAMENTO, DOSIS, FRECUENCIA, DURACION)
    VALUES (v_receta, 'Paracetamol', '500 mg', 'Cada 8 horas', '3 dias');
    INSERT INTO RECIBO_HONORARIO(ID_CITA, NUMERO_RECIBO, MONTO, ID_DOCTOR_EMISOR, FECHA_ENTREGA, MEDIO_ENTREGA, ID_USUARIO_ENTREGA)
    VALUES (v_cita, 'REC-2026-0001', v_precio, v_doctor, SYSTIMESTAMP - INTERVAL '7' DAY, 'CORREO ELECTRONICO', v_admin);
    v_devengo := FN_MONTO_DOCTOR(v_precio);
    UPDATE CITA SET MONTO_DOCTOR_DEVENGADO = v_devengo, MONTO_GESTORA_DEVENGADO = v_precio - v_devengo WHERE ID_CITA = v_cita;
    INSERT INTO LIQUIDACION(
        ID_DOCTOR, ID_USUARIO_REGISTRO, PERIODO_INICIO, PERIODO_FIN, MONTO,
        METODO_PAGO, NUMERO_OPERACION, NUMERO_BOLETA, OBSERVACIONES
    ) VALUES (
        v_doctor, v_tesoreria, TRUNC(SYSDATE) - 7, TRUNC(SYSDATE) - 7, v_devengo,
        'TRANSFERENCIA', 'OP-2026-0001', 'BOL-2026-0001', 'Pago registrado para demostracion financiera'
    );

    -- Caso para demostrar la cancelacion automatica: cita vencida y sin asistencia.
    SELECT d.ID_DOCTOR, de.ID_ESPECIALIDAD INTO v_doctor, v_especialidad
      FROM DOCTOR d JOIN DOCTOR_ESPECIALIDAD de ON de.ID_DOCTOR = d.ID_DOCTOR
     WHERE d.ID_USUARIO = (SELECT ID_USUARIO FROM USUARIO WHERE USERNAME = 'dr.daniel.castro');
    SELECT ID_PACIENTE INTO v_paciente FROM PACIENTE WHERE NUMERO_DOCUMENTO = '70580004';
    crear_cita(v_paciente, v_doctor, v_especialidad, v_consultorio, v_franja_actual,
               TRUNC(SYSDATE) - 1, 'PAGO-2026-0004', 'PROGRAMADA', 'N');

    INSERT INTO AUDITORIA(ID_USUARIO, TABLA_AFECTADA, ACCION, DETALLE, ORIGEN)
    VALUES (v_admin, 'SISTEMA', 'CARGA_INICIAL', 'Se crearon cuentas, profesionales, pacientes, horarios y citas de presentacion.', 'SISTEMA');
    COMMIT;
    DBMS_SESSION.CLEAR_IDENTIFIER;
    DBMS_OUTPUT.PUT_LINE('Datos iniciales cargados: 6 doctores, recepcionista, tesorera, 8 pacientes y 3 citas.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_SESSION.CLEAR_IDENTIFIER;
        RAISE;
END;
/

SELECT U.USERNAME, R.NOMBRE AS ROL, U.CORREO, U.ESTADO
FROM USUARIO U JOIN ROL R ON R.ID_ROL = U.ID_ROL
WHERE U.USERNAME IN (
    'recepcion.centro', 'tesoreria.centro', 'dra.elena.rojas', 'dr.marcos.salas',
    'dra.valeria.torres', 'dr.daniel.castro', 'dra.sofia.mendoza', 'dr.renato.paredes'
)
ORDER BY R.NOMBRE, U.USERNAME;

SELECT C.ID_CITA, C.ESTADO, C.FECHA_CITA, F.HORA_INICIO,
       P.NOMBRES || ' ' || P.APELLIDOS AS PACIENTE,
       D.NOMBRES || ' ' || D.APELLIDOS AS DOCTOR
FROM CITA C
JOIN FRANJA_HORARIA F ON F.ID_FRANJA = C.ID_FRANJA
JOIN PACIENTE P ON P.ID_PACIENTE = C.ID_PACIENTE
JOIN DOCTOR D ON D.ID_DOCTOR = C.ID_DOCTOR
ORDER BY C.FECHA_CITA DESC, F.HORA_INICIO;

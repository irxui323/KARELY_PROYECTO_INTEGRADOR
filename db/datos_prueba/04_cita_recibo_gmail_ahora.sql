SET DEFINE OFF
SET SERVEROUTPUT ON SIZE UNLIMITED

DECLARE
    v_correo PACIENTE.CORREO%TYPE := 'jomacp2850cch@gmail.com';
    v_paciente PACIENTE.ID_PACIENTE%TYPE;
    v_admin USUARIO.ID_USUARIO%TYPE;
    v_doctor DOCTOR.ID_DOCTOR%TYPE;
    v_especialidad ESPECIALIDAD.ID_ESPECIALIDAD%TYPE;
    v_consultorio CONSULTORIO.ID_CONSULTORIO%TYPE;
    v_franja FRANJA_HORARIA.ID_FRANJA%TYPE;
    v_inicio FRANJA_HORARIA.HORA_INICIO%TYPE;
    v_fin FRANJA_HORARIA.HORA_FIN%TYPE;
    v_precio ESPECIALIDAD.PRECIO_CONSULTA%TYPE;
    v_disponibilidad DISPONIBILIDAD_DOCTOR.ID_DISPONIBILIDAD%TYPE;
    v_pre PRE_RESERVA_CITA.ID_PRE_RESERVA%TYPE;
    v_pago PAGO_CITA.ID_PAGO%TYPE;
    v_cita CITA.ID_CITA%TYPE;
    v_atencion ATENCION_MEDICA.ID_ATENCION%TYPE;
    v_receta RECETA.ID_RECETA%TYPE;
    v_detalle RECETA_DETALLE.ID_DETALLE%TYPE;
    v_fecha DATE := TRUNC(SYSDATE);
    v_ahora TIMESTAMP := CAST(SYSTIMESTAMP AS TIMESTAMP);
    v_hora VARCHAR2(5) := TO_CHAR(SYSDATE, 'HH24:MI');
    v_referencia VARCHAR2(80);
    v_total NUMBER;
    v_identificador VARCHAR2(64) := SYS_CONTEXT('USERENV', 'CLIENT_IDENTIFIER');
BEGIN
    IF USER <> 'KARELY_BD2' THEN
        RAISE_APPLICATION_ERROR(-20990, 'Ejecuta este archivo conectado como KARELY_BD2.');
    END IF;

    SELECT MIN(ID_PACIENTE) INTO v_paciente
    FROM PACIENTE
    WHERE LOWER(TRIM(CORREO)) = v_correo AND ESTADO = 'ACTIVO';
    IF v_paciente IS NULL THEN
        RAISE_APPLICATION_ERROR(-20991, 'No se encontro un paciente activo con el correo indicado.');
    END IF;

    SELECT MIN(u.ID_USUARIO) INTO v_admin
    FROM USUARIO u JOIN ROL r ON r.ID_ROL = u.ID_ROL
    WHERE u.ESTADO = 'ACTIVO' AND r.ESTADO = 'ACTIVO' AND r.NOMBRE = 'ADMINISTRADORA';
    IF v_admin IS NULL THEN
        RAISE_APPLICATION_ERROR(-20992, 'Se necesita una administradora activa para preparar la prueba.');
    END IF;

    v_referencia := 'PRUEBA-GMAIL-' || TO_CHAR(v_fecha, 'YYYYMMDD') || '-' || v_paciente;
    SELECT MAX(c.ID_CITA) INTO v_cita
    FROM CITA c JOIN PAGO_CITA p ON p.ID_PAGO = c.ID_PAGO
    WHERE p.REFERENCIA_PAGO = v_referencia AND c.FECHA_CITA = v_fecha;
    IF v_cita IS NOT NULL THEN
        DBMS_OUTPUT.PUT_LINE('La cita de prueba de hoy ya existe. No se duplicaron datos.');
        DBMS_OUTPUT.PUT_LINE('Abre: http://127.0.0.1:4200/doctor/consultas?cita=' || v_cita);
        DBMS_OUTPUT.PUT_LINE('Correo del paciente: ' || v_correo);
        RETURN;
    END IF;

    SELECT ID_FRANJA, HORA_INICIO, HORA_FIN
    INTO v_franja, v_inicio, v_fin
    FROM (
        SELECT ID_FRANJA, HORA_INICIO, HORA_FIN
        FROM FRANJA_HORARIA
        WHERE ESTADO = 'ACTIVO' AND HORA_INICIO <= v_hora AND HORA_FIN > v_hora
        ORDER BY HORA_INICIO DESC, HORA_FIN, ID_FRANJA
    ) WHERE ROWNUM = 1;

    SELECT ID_DOCTOR, ID_ESPECIALIDAD, PRECIO_CONSULTA, ID_CONSULTORIO
    INTO v_doctor, v_especialidad, v_precio, v_consultorio
    FROM (
        SELECT d.ID_DOCTOR, e.ID_ESPECIALIDAD, e.PRECIO_CONSULTA, co.ID_CONSULTORIO,
               CASE WHEN dd.ID_DISPONIBILIDAD IS NULL THEN 1 ELSE 0 END AS ORDEN_DISPONIBILIDAD
        FROM DOCTOR d
        JOIN USUARIO u ON u.ID_USUARIO = d.ID_USUARIO AND u.ESTADO = 'ACTIVO'
        JOIN ROL r ON r.ID_ROL = u.ID_ROL AND r.NOMBRE = 'DOCTOR' AND r.ESTADO = 'ACTIVO'
        JOIN DOCTOR_ESPECIALIDAD de ON de.ID_DOCTOR = d.ID_DOCTOR
        JOIN ESPECIALIDAD e ON e.ID_ESPECIALIDAD = de.ID_ESPECIALIDAD
        CROSS JOIN CONSULTORIO co
        LEFT JOIN DISPONIBILIDAD_DOCTOR dd ON dd.ID_DOCTOR = d.ID_DOCTOR
            AND dd.ID_FRANJA = v_franja AND dd.FECHA_TURNO = v_fecha
        WHERE d.ESTADO = 'ACTIVO' AND d.ESTADO_DOCUMENTACION = 'COMPLETO'
          AND e.ESTADO = 'ACTIVO' AND e.PRECIO_CONSULTA > 0 AND co.ESTADO = 'ACTIVO'
          AND (dd.ID_DISPONIBILIDAD IS NULL OR (dd.ESTADO = 'ACTIVO' AND dd.ID_ESPECIALIDAD = e.ID_ESPECIALIDAD))
          AND NOT EXISTS (
              SELECT 1 FROM DISPONIBILIDAD_DOCTOR x JOIN FRANJA_HORARIA f ON f.ID_FRANJA = x.ID_FRANJA
              WHERE x.ID_DOCTOR = d.ID_DOCTOR AND x.FECHA_TURNO = v_fecha AND x.ESTADO = 'ACTIVO'
                AND x.ID_FRANJA <> v_franja AND f.HORA_INICIO < v_fin AND v_inicio < f.HORA_FIN
          )
          AND NOT EXISTS (
              SELECT 1 FROM CITA c JOIN FRANJA_HORARIA f ON f.ID_FRANJA = c.ID_FRANJA
              WHERE c.FECHA_CITA = v_fecha AND c.ESTADO IN ('PROGRAMADA','REPROGRAMADA','EN_ATENCION')
                AND (c.ID_DOCTOR = d.ID_DOCTOR OR c.ID_CONSULTORIO = co.ID_CONSULTORIO OR c.ID_PACIENTE = v_paciente)
                AND f.HORA_INICIO < v_fin AND v_inicio < f.HORA_FIN
          )
          AND NOT EXISTS (
              SELECT 1 FROM PRE_RESERVA_CITA p JOIN FRANJA_HORARIA f ON f.ID_FRANJA = p.ID_FRANJA
              WHERE p.FECHA_CITA = v_fecha AND p.ESTADO = 'BLOQUEADA' AND p.FECHA_EXPIRACION > SYSTIMESTAMP
                AND (p.ID_DOCTOR = d.ID_DOCTOR OR p.ID_CONSULTORIO = co.ID_CONSULTORIO OR p.ID_PACIENTE = v_paciente)
                AND f.HORA_INICIO < v_fin AND v_inicio < f.HORA_FIN
          )
        ORDER BY ORDEN_DISPONIBILIDAD, d.ID_DOCTOR, e.ID_ESPECIALIDAD, co.ID_CONSULTORIO
    ) WHERE ROWNUM = 1;

    DBMS_SESSION.SET_IDENTIFIER(TO_CHAR(v_admin));
    SELECT COUNT(*) INTO v_total FROM DISPONIBILIDAD_DOCTOR
    WHERE ID_DOCTOR = v_doctor AND ID_FRANJA = v_franja AND FECHA_TURNO = v_fecha;
    IF v_total = 0 THEN
        SP_REGISTRAR_DISPONIBILIDAD(v_admin, v_doctor, v_fecha, v_franja, v_especialidad, v_disponibilidad);
    END IF;

    INSERT INTO PRE_RESERVA_CITA (
        ID_PACIENTE, ID_DOCTOR, ID_ESPECIALIDAD, ID_CONSULTORIO, ID_FRANJA,
        FECHA_CITA, MONTO, FECHA_BLOQUEO, FECHA_EXPIRACION, ESTADO
    ) VALUES (
        v_paciente, v_doctor, v_especialidad, v_consultorio, v_franja,
        v_fecha, v_precio, v_ahora, v_ahora + INTERVAL '10' MINUTE, 'CONFIRMADA'
    ) RETURNING ID_PRE_RESERVA INTO v_pre;

    INSERT INTO PAGO_CITA (
        ID_PRE_RESERVA, ID_PACIENTE, MONTO, METODO_PAGO, REFERENCIA_PAGO, FECHA_PAGO, ESTADO
    ) VALUES (
        v_pre, v_paciente, v_precio, 'EFECTIVO', v_referencia, v_ahora, 'APROBADO'
    ) RETURNING ID_PAGO INTO v_pago;

    INSERT INTO CITA (
        ID_PRE_RESERVA, ID_PACIENTE, ID_DOCTOR, ID_ESPECIALIDAD, ID_CONSULTORIO,
        ID_FRANJA, ID_PAGO, FECHA_CITA, MONTO_TOTAL, ESTADO
    ) VALUES (
        v_pre, v_paciente, v_doctor, v_especialidad, v_consultorio,
        v_franja, v_pago, v_fecha, v_precio, 'EN_ATENCION'
    ) RETURNING ID_CITA INTO v_cita;

    INSERT INTO ASISTENCIA (ID_CITA, FECHA_REGISTRO, ESTADO)
    VALUES (v_cita, v_ahora, 'PRESENTE');

    SP_INICIAR_ATENCION(v_admin, v_cita, v_atencion);
    SP_REGISTRAR_DIAGNOSTICO(v_admin, v_cita,
        'PRUEBA DE ENVIO DE RECIBO. Sin valor clinico.', 'Datos ficticios para comprobar el PDF y el correo.');
    SP_CREAR_RECETA(v_admin, v_cita, 'PRUEBA. No utilizar como indicacion medica.', v_receta);
    SP_AGREGAR_MEDICAMENTO(v_admin, v_receta, 'Producto ficticio de prueba',
        'NO ADMINISTRAR', 'NO APLICA', 'NO APLICA', v_detalle, 'Solo prueba del sistema.');

    INSERT INTO AUDITORIA (ID_USUARIO, TABLA_AFECTADA, ID_REGISTRO, ACCION, DETALLE, ORIGEN)
    VALUES (v_admin, 'CITA', v_cita, 'CARGA_PRUEBA',
        'Prueba de recibo por Gmail: asistencia y pago ficticios; sin recibo emitido ni liquidacion.', 'SISTEMA');

    DBMS_SESSION.SET_IDENTIFIER(v_identificador);
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Cita de prueba preparada para hoy ' || TO_CHAR(v_fecha, 'DD/MM/YYYY') || ', turno ' || v_inicio || ' a ' || v_fin || '.');
    DBMS_OUTPUT.PUT_LINE('Correo del paciente: ' || v_correo);
    DBMS_OUTPUT.PUT_LINE('Abre como administradora: http://127.0.0.1:4200/doctor/consultas?cita=' || v_cita);
    DBMS_OUTPUT.PUT_LINE('Selecciona Emitir recibo y despues Correo electronico > Enviar PDF por correo.');
    DBMS_OUTPUT.PUT_LINE('El recibo todavia no fue emitido y no se envio ningun correo.');
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        DBMS_SESSION.SET_IDENTIFIER(v_identificador);
        RAISE_APPLICATION_ERROR(-20993, 'No hay un turno activo a esta hora con doctor y consultorio libres. No se crearon datos.');
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_SESSION.SET_IDENTIFIER(v_identificador);
        RAISE;
END;
/

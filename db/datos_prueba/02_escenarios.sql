SET DEFINE OFF
SET SERVEROUTPUT ON SIZE UNLIMITED
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

DECLARE
    v_n NUMBER;
    v_doc NUMBER;
    v_admin NUMBER;
    v_userdoc NUMBER;
    v_recepcion NUMBER;
    v_tesorera NUMBER;
    v_esp NUMBER;
    v_cons NUMBER;
    v_franja NUMBER;
    v_paciente NUMBER;
    v_pre NUMBER;
    v_pago NUMBER;
    v_cita NUMBER;
    v_atencion NUMBER;
    v_receta NUMBER;
    v_devengo NUMBER;
    v_fecha DATE;
    v_estado VARCHAR2(20);
BEGIN
    IF USER<>'KARELY_BD2' THEN RAISE_APPLICATION_ERROR(-20931,'Usar KARELY_BD2'); END IF;
    SELECT COUNT(*) INTO v_n FROM PAGO_CITA WHERE referencia_pago LIKE 'TEST-SEED-%';
    IF v_n>0 THEN RAISE_APPLICATION_ERROR(-20933,'Escenarios TEST ya cargados; no se duplicaron'); END IF;
    SELECT id_doctor,id_usuario INTO v_doc,v_userdoc FROM DOCTOR WHERE numero_documento='99000001' AND estado_documentacion='COMPLETO';
    SELECT id_usuario INTO v_admin FROM USUARIO WHERE username='test.admin';
    SELECT id_usuario INTO v_recepcion FROM USUARIO WHERE username='test.recepcion';
    SELECT id_usuario INTO v_tesorera FROM USUARIO WHERE username='test.tesoreria';
    SELECT id_especialidad INTO v_esp FROM ESPECIALIDAD WHERE nombre='TEST Medicina general' AND precio_consulta=100;
    SELECT id_consultorio INTO v_cons FROM CONSULTORIO WHERE nombre='TEST Consultorio 1';
    DBMS_SESSION.SET_IDENTIFIER(TO_CHAR(v_admin));
    FOR i IN 1..5 LOOP
        SELECT id_paciente INTO v_paciente FROM PACIENTE WHERE tipo_documento='DNI' AND numero_documento=TO_CHAR(99100000+i);
        SELECT id_franja INTO v_franja FROM FRANJA_HORARIA WHERE hora_inicio=LPAD(8+i,2,'0')||':00' AND hora_fin=LPAD(9+i,2,'0')||':00';
        v_fecha:=CASE WHEN i=1 THEN TRUNC(SYSDATE)-1 WHEN i=2 THEN TRUNC(SYSDATE) ELSE TRUNC(SYSDATE)+i-2 END;
        v_estado:=CASE WHEN i=1 THEN 'ATENDIDA' WHEN i=2 THEN 'EN_ATENCION' ELSE 'PROGRAMADA' END;
        INSERT INTO PRE_RESERVA_CITA(id_paciente,id_doctor,id_especialidad,id_consultorio,id_franja,fecha_cita,monto,fecha_bloqueo,fecha_expiracion,estado)
        VALUES(v_paciente,v_doc,v_esp,v_cons,v_franja,v_fecha,100,CAST(v_fecha-1 AS TIMESTAMP),CAST(v_fecha-1 AS TIMESTAMP)+INTERVAL '10' MINUTE,'CONFIRMADA') RETURNING id_pre_reserva INTO v_pre;
        INSERT INTO PAGO_CITA(id_pre_reserva,id_paciente,monto,metodo_pago,referencia_pago,fecha_pago)
        VALUES(v_pre,v_paciente,100,'EFECTIVO','TEST-SEED-'||i,CAST(v_fecha-1 AS TIMESTAMP)) RETURNING id_pago INTO v_pago;
        INSERT INTO CITA(id_pre_reserva,id_paciente,id_doctor,id_especialidad,id_consultorio,id_franja,id_pago,fecha_cita,monto_total,estado)
        VALUES(v_pre,v_paciente,v_doc,v_esp,v_cons,v_franja,v_pago,v_fecha,100,v_estado) RETURNING id_cita INTO v_cita;
        IF i<=2 THEN
            INSERT INTO ASISTENCIA(id_cita,fecha_registro) VALUES(v_cita,CAST(v_fecha+(8+i)/24-15/1440 AS TIMESTAMP));
            INSERT INTO ATENCION_MEDICA(id_cita,id_doctor,diagnostico,observaciones,fecha_inicio,fecha_cierre,estado)
            VALUES(v_cita,v_doc,CASE WHEN i=1 THEN 'TEST Diagnostico ficticio sin valor clinico' END,'TEST Escenario sintetico',CAST(v_fecha AS TIMESTAMP)+INTERVAL '10' HOUR,
                CASE WHEN i=1 THEN CAST(v_fecha AS TIMESTAMP)+INTERVAL '11' HOUR END,CASE WHEN i=1 THEN 'CERRADA' ELSE 'ABIERTA' END) RETURNING id_atencion INTO v_atencion;
        END IF;
        IF i=1 THEN
            INSERT INTO RECETA(id_atencion,indicaciones,fecha_emision) VALUES(v_atencion,'TEST No administrar. Solo demostracion.',CAST(v_fecha AS TIMESTAMP)+INTERVAL '10' HOUR) RETURNING id_receta INTO v_receta;
            INSERT INTO RECETA_DETALLE(id_receta,medicamento,dosis,frecuencia,duracion) VALUES(v_receta,'TEST Medicamento ficticio','NO ADMINISTRAR','NO APLICA','NO APLICA');
            INSERT INTO RECIBO_HONORARIO(id_cita,numero_recibo,monto,fecha_emision,id_doctor_emisor,fecha_entrega,medio_entrega,id_usuario_entrega)
            VALUES(v_cita,'TEST-RH-001',100,CAST(v_fecha AS TIMESTAMP)+INTERVAL '10' HOUR,v_doc,CAST(v_fecha AS TIMESTAMP)+INTERVAL '11' HOUR,'PRESENCIAL',v_recepcion);
            v_devengo:=FN_MONTO_DOCTOR(100);
            UPDATE CITA SET monto_doctor_devengado=v_devengo,monto_gestora_devengado=100-v_devengo WHERE id_cita=v_cita;
            IF v_devengo>0 THEN
                INSERT INTO LIQUIDACION(id_doctor,id_usuario_registro,periodo_inicio,periodo_fin,monto,metodo_pago,numero_operacion,numero_boleta,observaciones)
                VALUES(v_doc,v_tesorera,v_fecha,v_fecha,ROUND(v_devengo/2,2),'TRANSFERENCIA','TEST-OP-001','TEST-BOL-001','TEST Pago parcial ficticio sin transferencia real');
            END IF;
        END IF;
    END LOOP;
    DBMS_SESSION.CLEAR_IDENTIFIER;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Escenarios TEST cargados: historico, atencion abierta y tres citas futuras');
EXCEPTION WHEN OTHERS THEN
    ROLLBACK;
    DBMS_SESSION.CLEAR_IDENTIFIER;
    RAISE;
END;
/

-- DATOS COMPLEMENTARIOS PARA DEMOSTRACION
-- Ejecutar DESPUES de los 5 SQL de instalacion, conectado como KARELY_BD2
-- en la PDB ORCLPDB. No borra ni reinicia datos.
-- La instalacion ya carga catalogos, usuarios, doctores, pacientes, horarios,
-- citas, pagos, atenciones, recetas, recibos, liquidaciones y auditoria.
-- Este archivo completa sesiones, tokens usados, notificaciones fallidas y,
-- si hay un turno disponible, una reprogramacion hecha por el procedimiento.

SET DEFINE OFF
SET SERVEROUTPUT ON SIZE UNLIMITED
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

DECLARE
    v_admin       USUARIO.ID_USUARIO%TYPE;
    v_recepcion   USUARIO.ID_USUARIO%TYPE;
    v_correo      USUARIO.CORREO%TYPE;
    v_id_cita     CITA.ID_CITA%TYPE;
    v_fecha_nueva DATE;
    v_franja_nueva FRANJA_HORARIA.ID_FRANJA%TYPE;
    v_consultorio CITA.ID_CONSULTORIO%TYPE;
    v_total       NUMBER;
    v_reprogramo  BOOLEAN := FALSE;
BEGIN
    IF USER <> 'KARELY_BD2'
       OR SYS_CONTEXT('USERENV','CON_NAME') <> 'ORCLPDB' THEN
        RAISE_APPLICATION_ERROR(-20980,
            'Conectarse como KARELY_BD2 en ORCLPDB. No se modifico ningun dato.');
    END IF;

    SELECT ID_USUARIO INTO v_admin
      FROM USUARIO
     WHERE USERNAME='admin01' AND ESTADO='ACTIVO';

    SELECT ID_USUARIO, CORREO INTO v_recepcion, v_correo
      FROM USUARIO
     WHERE USERNAME='recepcion.centro' AND ESTADO='ACTIVO';

    SELECT COUNT(*) INTO v_total FROM DOCTOR
     WHERE ESTADO='ACTIVO' AND ESTADO_DOCUMENTACION='COMPLETO';
    IF v_total = 0 THEN
        RAISE_APPLICATION_ERROR(-20981,
            'Se necesita al menos un doctor activo con documentos validados.');
    END IF;

    DBMS_SESSION.SET_IDENTIFIER(TO_CHAR(v_admin));

    -- Sesion cerrada ficticia; evita dejar una sesion activa en los datos.
    INSERT INTO SESION_USUARIO
        (ID_USUARIO, FECHA_INICIO, FECHA_FIN, ULTIMA_ACTIVIDAD, IP_ORIGEN, ESTADO)
    SELECT v_recepcion,
           CAST(TRUNC(SYSDATE)-1 AS TIMESTAMP)+INTERVAL '09:00' HOUR TO MINUTE,
           CAST(TRUNC(SYSDATE)-1 AS TIMESTAMP)+INTERVAL '09:35' HOUR TO MINUTE,
           CAST(TRUNC(SYSDATE)-1 AS TIMESTAMP)+INTERVAL '09:35' HOUR TO MINUTE,
           '192.0.2.24', 'CERRADA'
      FROM DUAL
     WHERE NOT EXISTS (
        SELECT 1 FROM SESION_USUARIO
         WHERE ID_USUARIO=v_recepcion AND IP_ORIGEN='192.0.2.24'
     );

    -- Token de muestra ya usado: no permite restablecer una clave.
    INSERT INTO TOKEN_RECUPERACION
        (TOKEN_HASH, ID_USUARIO, CORREO, VERSION_CREDENCIAL,
         FECHA_CREACION, FECHA_EXPIRACION, FECHA_USO)
    SELECT RAWTOHEX(STANDARD_HASH('KARELY-CARGA-RECUPERACION-2026-11', 'SHA256')),
           v_recepcion, v_correo, 'TOKEN-DE-MUESTRA-SIN-VALIDEZ',
           SYSTIMESTAMP-INTERVAL '2' DAY, SYSTIMESTAMP-INTERVAL '1' DAY,
           SYSTIMESTAMP-INTERVAL '1' DAY
      FROM DUAL
     WHERE NOT EXISTS (
        SELECT 1 FROM TOKEN_RECUPERACION
         WHERE TOKEN_HASH=RAWTOHEX(STANDARD_HASH('KARELY-CARGA-RECUPERACION-2026-11', 'SHA256'))
     );

    -- Evento fallido para consultar el historial de la cola; no se enviara.
    INSERT INTO NOTIFICACION_SALIENTE
        (TIPO, CANAL, DESTINATARIO, ID_CITA, ID_USUARIO_CREACION,
         CODIGO_EVENTO, ESTADO, INTENTOS, FECHA_PROXIMO_INTENTO, ULTIMO_ERROR)
    SELECT 'PAGO_CITA', 'EMAIL', 'correo-no-configurado@example.invalid',
           C.ID_CITA, v_admin, 'KARELY-CARGA-PRESENTACION-PAGO-2026-11',
           'FALLIDA', 1, SYSTIMESTAMP+INTERVAL '1' DAY,
           'Registro de ejemplo; correo de destino reservado para pruebas.'
      FROM CITA C
     WHERE C.ESTADO='ATENDIDA'
       AND NOT EXISTS (
           SELECT 1 FROM NOTIFICACION_SALIENTE N
            WHERE N.CODIGO_EVENTO='KARELY-CARGA-PRESENTACION-PAGO-2026-11'
       )
       AND ROWNUM=1;

    -- Reprograma una cita futura por el procedimiento del sistema, siempre
    -- que no tenga reprogramacion previa y exista otro turno libre.
    SELECT COUNT(*) INTO v_total FROM REPROGRAMACION_CITA;
    IF v_total = 0 THEN
        BEGIN
            SELECT ID_CITA, FECHA_TURNO, ID_FRANJA, ID_CONSULTORIO
              INTO v_id_cita, v_fecha_nueva, v_franja_nueva, v_consultorio
              FROM (
                SELECT C.ID_CITA, D.FECHA_TURNO, D.ID_FRANJA, C.ID_CONSULTORIO,
                       F.HORA_INICIO
                  FROM CITA C
                  JOIN DISPONIBILIDAD_DOCTOR D
                    ON D.ID_DOCTOR=C.ID_DOCTOR
                   AND D.ID_ESPECIALIDAD=C.ID_ESPECIALIDAD
                  JOIN FRANJA_HORARIA F ON F.ID_FRANJA=D.ID_FRANJA
                 WHERE C.ESTADO='PROGRAMADA'
                   AND C.REPROGRAMACIONES=0
                   AND C.FECHA_CITA>=TRUNC(SYSDATE)
                   AND D.ESTADO='ACTIVO'
                   AND D.FECHA_TURNO>=TRUNC(SYSDATE)
                   AND (D.FECHA_TURNO>C.FECHA_CITA OR D.ID_FRANJA<>C.ID_FRANJA)
                   AND (D.FECHA_TURNO>TRUNC(SYSDATE)
                        OR F.HORA_INICIO>TO_CHAR(SYSDATE,'HH24:MI'))
                   AND NOT EXISTS (
                       SELECT 1
                         FROM CITA X
                         JOIN FRANJA_HORARIA FX ON FX.ID_FRANJA=X.ID_FRANJA
                        WHERE X.ID_CITA<>C.ID_CITA
                          AND X.FECHA_CITA=D.FECHA_TURNO
                          AND X.ESTADO IN ('PROGRAMADA','REPROGRAMADA','EN_ATENCION')
                          AND (X.ID_DOCTOR=C.ID_DOCTOR
                               OR X.ID_CONSULTORIO=C.ID_CONSULTORIO)
                          AND FX.HORA_INICIO<F.HORA_FIN
                          AND F.HORA_INICIO<FX.HORA_FIN
                   )
                   AND NOT EXISTS (
                       SELECT 1
                         FROM PRE_RESERVA_CITA P
                         JOIN FRANJA_HORARIA FP ON FP.ID_FRANJA=P.ID_FRANJA
                        WHERE P.FECHA_CITA=D.FECHA_TURNO
                          AND P.ESTADO='BLOQUEADA'
                          AND P.FECHA_EXPIRACION>SYSTIMESTAMP
                          AND (P.ID_DOCTOR=C.ID_DOCTOR
                               OR P.ID_CONSULTORIO=C.ID_CONSULTORIO)
                          AND FP.HORA_INICIO<F.HORA_FIN
                          AND F.HORA_INICIO<FP.HORA_FIN
                   )
              )
             ORDER BY FECHA_TURNO, HORA_INICIO
             FETCH FIRST 1 ROW ONLY;

            SP_REPROGRAMAR_CITA(
                v_admin, v_id_cita, v_fecha_nueva, v_franja_nueva,
                v_consultorio,
                'El paciente solicita cambiar su turno por disponibilidad personal.',
                'S'
            );
            v_reprogramo := TRUE;
            DBMS_OUTPUT.PUT_LINE('Cita '||v_id_cita||' reprogramada para '||
                TO_CHAR(v_fecha_nueva,'DD/MM/YYYY')||' turno '||v_franja_nueva||'.');
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                DBMS_OUTPUT.PUT_LINE(
                    'No se reprogramo una cita: no hay cita programada con otro turno libre.');
        END;
    ELSE
        DBMS_OUTPUT.PUT_LINE(
            'Ya hay una reprogramacion; se conserva y no se crea otra.');
    END IF;

    COMMIT;
    DBMS_SESSION.CLEAR_IDENTIFIER;
    DBMS_OUTPUT.PUT_LINE('Datos complementarios cargados sin borrar datos existentes.');
    DBMS_OUTPUT.PUT_LINE('Las notificaciones de ejemplo quedan FALLIDAS y no se envian.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_SESSION.CLEAR_IDENTIFIER;
        RAISE;
END;
/

PROMPT === COBERTURA DE LAS 25 TABLAS ===
SELECT TABLA, FILAS FROM (
    SELECT 'ASISTENCIA' TABLA, COUNT(*) FILAS FROM ASISTENCIA UNION ALL
    SELECT 'ATENCION_MEDICA', COUNT(*) FROM ATENCION_MEDICA UNION ALL
    SELECT 'AUDITORIA', COUNT(*) FROM AUDITORIA UNION ALL
    SELECT 'CITA', COUNT(*) FROM CITA UNION ALL
    SELECT 'CONSULTORIO', COUNT(*) FROM CONSULTORIO UNION ALL
    SELECT 'DISPONIBILIDAD_DOCTOR', COUNT(*) FROM DISPONIBILIDAD_DOCTOR UNION ALL
    SELECT 'DOCTOR', COUNT(*) FROM DOCTOR UNION ALL
    SELECT 'DOCTOR_ESPECIALIDAD', COUNT(*) FROM DOCTOR_ESPECIALIDAD UNION ALL
    SELECT 'DOCUMENTO_DOCTOR', COUNT(*) FROM DOCUMENTO_DOCTOR UNION ALL
    SELECT 'ESPECIALIDAD', COUNT(*) FROM ESPECIALIDAD UNION ALL
    SELECT 'FRANJA_HORARIA', COUNT(*) FROM FRANJA_HORARIA UNION ALL
    SELECT 'LIQUIDACION', COUNT(*) FROM LIQUIDACION UNION ALL
    SELECT 'NOTIFICACION_SALIENTE', COUNT(*) FROM NOTIFICACION_SALIENTE UNION ALL
    SELECT 'PACIENTE', COUNT(*) FROM PACIENTE UNION ALL
    SELECT 'PAGO_CITA', COUNT(*) FROM PAGO_CITA UNION ALL
    SELECT 'PARAMETRO_SISTEMA', COUNT(*) FROM PARAMETRO_SISTEMA UNION ALL
    SELECT 'PRE_RESERVA_CITA', COUNT(*) FROM PRE_RESERVA_CITA UNION ALL
    SELECT 'RECETA', COUNT(*) FROM RECETA UNION ALL
    SELECT 'RECETA_DETALLE', COUNT(*) FROM RECETA_DETALLE UNION ALL
    SELECT 'RECIBO_HONORARIO', COUNT(*) FROM RECIBO_HONORARIO UNION ALL
    SELECT 'REPROGRAMACION_CITA', COUNT(*) FROM REPROGRAMACION_CITA UNION ALL
    SELECT 'ROL', COUNT(*) FROM ROL UNION ALL
    SELECT 'SESION_USUARIO', COUNT(*) FROM SESION_USUARIO UNION ALL
    SELECT 'TOKEN_RECUPERACION', COUNT(*) FROM TOKEN_RECUPERACION UNION ALL
    SELECT 'USUARIO', COUNT(*) FROM USUARIO
)
ORDER BY TABLA;

SELECT ID_CITA, FECHA_CITA, ESTADO, REPROGRAMACIONES
  FROM CITA
 WHERE ESTADO IN ('PROGRAMADA','REPROGRAMADA','EN_ATENCION','ATENDIDA','CANCELADA')
 ORDER BY FECHA_CITA DESC, ID_CITA DESC;

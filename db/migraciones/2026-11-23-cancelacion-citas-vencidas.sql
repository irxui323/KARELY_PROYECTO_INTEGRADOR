-- Cancela una cita sin asistencia cuando su turno ya finalizó.
-- Ejecutar como KARELY_BD2. Es idempotente: puede aplicarse una sola vez sobre la BD actual.
SET DEFINE OFF
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

CREATE OR REPLACE PROCEDURE SP_MARCAR_CITAS_PERDIDAS (
    P_TOTAL OUT NUMBER
)
IS
BEGIN
    P_TOTAL := 0;
    SAVEPOINT SV_CANCELAR_VENCIDAS;

    FOR R IN (
        SELECT C.ID_CITA, C.ESTADO
          FROM CITA C
         WHERE C.ESTADO IN ('PROGRAMADA', 'REPROGRAMADA')
           AND NOT EXISTS (SELECT 1 FROM ASISTENCIA A WHERE A.ID_CITA = C.ID_CITA)
           AND EXISTS (
           SELECT 1
             FROM FRANJA_HORARIA F
            WHERE F.ID_FRANJA = C.ID_FRANJA
              AND CAST(C.FECHA_CITA AS TIMESTAMP)
                    + NUMTODSINTERVAL(
                        TO_NUMBER(SUBSTR(F.HORA_FIN, 1, 2)) * 60
                        + TO_NUMBER(SUBSTR(F.HORA_FIN, 4, 2)),
                        'MINUTE') <= CAST(SYSTIMESTAMP AS TIMESTAMP)
           )
    ) LOOP
        UPDATE CITA SET ESTADO = 'CANCELADA' WHERE ID_CITA = R.ID_CITA;
        INSERT INTO AUDITORIA (
            TABLA_AFECTADA, ID_REGISTRO, ACCION, DETALLE,
            ESTADO_ANTERIOR, ESTADO_NUEVO, ORIGEN
        ) VALUES (
            'CITA', R.ID_CITA, 'CANCELACION_AUTO',
            'Cita vencida sin asistencia registrada',
            R.ESTADO,
            'CANCELADA', 'SISTEMA'
        );
        P_TOTAL := P_TOTAL + 1;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO SV_CANCELAR_VENCIDAS;
        RAISE;
END SP_MARCAR_CITAS_PERDIDAS;
/

CREATE OR REPLACE PROCEDURE SP_TAREA_MANTENIMIENTO
IS
    V_RESERVAS NUMBER;
    V_SESIONES NUMBER;
    V_CANCELADAS NUMBER;
BEGIN
    SP_EXPIRAR_PRE_RESERVAS(V_RESERVAS);
    SP_EXPIRAR_SESIONES(V_SESIONES);
    SP_MARCAR_CITAS_PERDIDAS(V_CANCELADAS);

    IF V_RESERVAS > 0 OR V_SESIONES > 0 OR V_CANCELADAS > 0 THEN
        INSERT INTO AUDITORIA (TABLA_AFECTADA, ACCION, DETALLE, ORIGEN)
        VALUES (
            'AUDITORIA', 'MANTENIMIENTO',
            'Reservas expiradas: ' || V_RESERVAS || ', sesiones expiradas: '
                || V_SESIONES || ', citas canceladas: ' || V_CANCELADAS,
            'SISTEMA'
        );
    END IF;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END SP_TAREA_MANTENIMIENTO;
/

PROMPT Migracion completada: las citas vencidas sin asistencia pasan a CANCELADA.

SET DEFINE OFF
SET SERVEROUTPUT ON

SELECT u.username,u.correo,r.nombre rol,u.estado,u.intentos_fallidos
FROM USUARIO u JOIN ROL r ON r.id_rol=u.id_rol
WHERE u.username LIKE 'test.%' ORDER BY u.username;

SELECT d.id_doctor,d.numero_documento,d.nombres,d.apellidos,d.estado_documentacion,u.username,
       FN_DOCUMENTACION_COMPLETA(d.id_doctor) documentos_completos
FROM DOCTOR d LEFT JOIN USUARIO u ON u.id_usuario=d.id_usuario
WHERE d.numero_documento IN ('99000001','99000002','99000003','99000004')
ORDER BY d.numero_documento;

SELECT d.numero_documento,x.id_documento,x.tipo_documento,x.estado,x.nombre_archivo,
       DBMS_LOB.GETLENGTH(x.archivo) bytes_archivo
FROM DOCUMENTO_DOCTOR x JOIN DOCTOR d ON d.id_doctor=x.id_doctor
WHERE d.numero_documento IN ('99000001','99000002','99000004')
ORDER BY d.numero_documento,x.id_documento;

SELECT id_paciente,numero_documento,nombres,estado FROM PACIENTE
WHERE numero_documento IN ('99100001','99100002','99100003','99100004','99100005','99100006');

SELECT fecha_turno,COUNT(*) turnos FROM DISPONIBILIDAD_DOCTOR
WHERE id_doctor=(SELECT id_doctor FROM DOCTOR WHERE numero_documento='99000001')
GROUP BY fecha_turno ORDER BY fecha_turno;

SELECT c.id_cita,p.numero_documento,c.fecha_cita,f.hora_inicio,c.estado,c.monto_total,
       c.monto_doctor_devengado,c.monto_gestora_devengado,pc.referencia_pago
FROM CITA c JOIN PACIENTE p ON p.id_paciente=c.id_paciente
JOIN PAGO_CITA pc ON pc.id_pago=c.id_pago JOIN FRANJA_HORARIA f ON f.id_franja=c.id_franja
WHERE pc.referencia_pago LIKE 'TEST-SEED-%' ORDER BY pc.referencia_pago;

SELECT d.numero_documento,FN_SALDO_DOCTOR(d.id_doctor,TRUNC(SYSDATE)) saldo_doctor
FROM DOCTOR d WHERE d.numero_documento='99000001';

SELECT numero_operacion,numero_boleta,monto,fecha_pago FROM LIQUIDACION
WHERE numero_operacion='TEST-OP-001';

SELECT nombre,valor,estado FROM PARAMETRO_SISTEMA
WHERE nombre IN ('COMISION_DOCTOR','COMISION_GESTORA','BLOQUEO_MINUTOS','SESION_MINUTOS');

SELECT object_name,object_type,status FROM USER_OBJECTS WHERE status='INVALID';

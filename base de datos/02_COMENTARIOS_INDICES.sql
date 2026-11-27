-- ============================================================================
-- KARELY / ORACLE DATABASE 19c
-- ARCHIVO 02 - SESION 5 / COMENTARIOS, INDICES Y DATOS BASE
-- ESTILO: material del curso BD2 (S1-S8), adaptado a Karely.
-- CONEXION: KARELY_BD2 en la PDB (no CDB$ROOT).
-- EJECUCION: SQL Developer, F5 / Run Script, en el orden del LEEME.
-- NOTA: instalacion NUEVA, no migracion de datos.
-- ============================================================================
SET DEFINE OFF
SET SERVEROUTPUT ON SIZE UNLIMITED
WHENEVER SQLERROR EXIT SQL.SQLCODE

-- DOCUMENTACION DE LAS 24 TABLAS, SIN COMPROBANTE_CITA
COMMENT ON TABLE ROL IS 'Catalogo de roles habilitados en Karely.';
COMMENT ON TABLE USUARIO IS 'Cuentas de acceso y hash seguro de contrasena.';
COMMENT ON TABLE SESION_USUARIO IS 'Registro de sesiones y expiracion; particionado por mes.';
COMMENT ON TABLE AUDITORIA IS 'Trazabilidad de cambios operativos y de parametros; particionada por mes.';
COMMENT ON TABLE DOCTOR IS 'Profesionales de salud y validacion documental.';
COMMENT ON TABLE DOCUMENTO_DOCTOR IS 'Documentos de acreditacion del personal medico.';
COMMENT ON TABLE ESPECIALIDAD IS 'Catalogo de especialidades y precios de consulta.';
COMMENT ON TABLE DOCTOR_ESPECIALIDAD IS 'Relacion de doctores con especialidades habilitadas.';
COMMENT ON TABLE PACIENTE IS 'Datos de identificacion y contacto de los pacientes.';
COMMENT ON TABLE CONSULTORIO IS 'Salas disponibles para las consultas.';
COMMENT ON TABLE FRANJA_HORARIA IS 'Catalogo de franjas horarias sin solapamiento intrafranja.';
COMMENT ON TABLE DISPONIBILIDAD_DOCTOR IS 'Turnos ofertados por medico y fecha.';
COMMENT ON TABLE PRE_RESERVA_CITA IS 'Pre-reserva de cita con vencimiento temporal.';
COMMENT ON TABLE PAGO_CITA IS 'Pago del paciente por reserva; incluye paciente, importe, fecha y referencia.';
COMMENT ON TABLE CITA IS 'Citas confirmadas y montos de honorarios devengados al cerrar atencion.';
COMMENT ON TABLE REPROGRAMACION_CITA IS 'Una reprogramacion por cita con aceptacion del paciente.';
COMMENT ON TABLE ASISTENCIA IS 'Registro de presencia del paciente.';
COMMENT ON TABLE ATENCION_MEDICA IS 'Acto medico, diagnostico y estado de cierre.';
COMMENT ON TABLE RECETA IS 'Indicaciones de la receta vinculada a una atencion.';
COMMENT ON TABLE RECETA_DETALLE IS 'Medicamentos, dosis y duracion de prescripcion.';
COMMENT ON TABLE RECIBO_HONORARIO IS 'Recibo del medico y constancia de entrega al paciente.';
COMMENT ON TABLE LIQUIDACION IS 'Un registro por pago efectivo al doctor con fecha, monto, metodo y operacion.';
COMMENT ON TABLE PARAMETRO_SISTEMA IS 'Unica tabla de porcentajes para doctor y administradora y tiempos de negocio.';
COMMENT ON TABLE NOTIFICACION_SALIENTE IS 'Cola de avisos de pago o recibo por correo con reintentos.';
COMMENT ON COLUMN PAGO_CITA.ID_PACIENTE IS 'Paciente titular del pago; debe coincidir con la pre-reserva';
COMMENT ON COLUMN PAGO_CITA.MONTO IS 'Monto cobrado al paciente en PEN';
COMMENT ON COLUMN PAGO_CITA.FECHA_PAGO IS 'Fecha de registro del cobro en el sistema';
COMMENT ON COLUMN LIQUIDACION.MONTO IS 'Importe efectivamente pagado al doctor en PEN';
COMMENT ON COLUMN LIQUIDACION.FECHA_PAGO IS 'Fecha de registro del pago efectivo al doctor';
COMMENT ON COLUMN LIQUIDACION.NUMERO_OPERACION IS 'Referencia bancaria o transaccional unica';
COMMENT ON COLUMN CITA.MONTO_DOCTOR_DEVENGADO IS 'Monto de honorarios fijado al cerrar atencion; no es porcentaje';
COMMENT ON COLUMN CITA.MONTO_GESTORA_DEVENGADO IS 'Comision monetaria fijada al cerrar atencion; no es porcentaje';
COMMENT ON COLUMN PARAMETRO_SISTEMA.VALOR IS 'Contiene porcentajes configurables y minutos; solo aqui se guardan porcentajes';

-- ========================================================================
-- 03 — ÍNDICES, ROLES Y PARÁMETROS
-- FUENTE: proyecto Karely y estilos S5 del curso BD2
-- ========================================================================

-----------------------------------
-- 13. INDICES Y DATOS INICIALES : KARELY_BD2
-----------------------------------

-----------------------------------
-- 13.1. INDICES DE INTEGRIDAD
-----------------------------------

CREATE UNIQUE INDEX UQ_CITA_DOCTOR_TURNO ON CITA (
    CASE WHEN estado IN ('PROGRAMADA','REPROGRAMADA','EN_ATENCION') THEN id_doctor END,
    CASE WHEN estado IN ('PROGRAMADA','REPROGRAMADA','EN_ATENCION') THEN fecha_cita END,
    CASE WHEN estado IN ('PROGRAMADA','REPROGRAMADA','EN_ATENCION') THEN id_franja END
);

CREATE UNIQUE INDEX UQ_CITA_CONSULTORIO_TURNO ON CITA (
    CASE WHEN estado IN ('PROGRAMADA','REPROGRAMADA','EN_ATENCION') THEN id_consultorio END,
    CASE WHEN estado IN ('PROGRAMADA','REPROGRAMADA','EN_ATENCION') THEN fecha_cita END,
    CASE WHEN estado IN ('PROGRAMADA','REPROGRAMADA','EN_ATENCION') THEN id_franja END
);

-----------------------------------
-- 13.2. INDICE PARA CONSULTAS DE CITAS
-----------------------------------

CREATE INDEX IX_CITA_FECHA_ESTADO
ON CITA (fecha_cita, estado);

-- Indices por patrones de busqueda y unicidad de pago confirmado.
CREATE UNIQUE INDEX UQ_PAGO_APROBADO_RESERVA ON PAGO_CITA
 (CASE WHEN estado = 'APROBADO' THEN id_pre_reserva END);
CREATE INDEX IX_PAGO_PACIENTE_FECHA ON PAGO_CITA (id_paciente,fecha_pago);
CREATE INDEX IX_LIQ_DOCTOR_FECHA ON LIQUIDACION (id_doctor,fecha_pago);
CREATE INDEX IX_CITA_DEVENGOS ON CITA (id_doctor,estado,fecha_cita);
CREATE INDEX IX_NOTIF_LIQ ON NOTIFICACION_SALIENTE (id_liquidacion);
CREATE INDEX IX_AUD_USUARIO_FECHA ON AUDITORIA (id_usuario,fecha_operacion);


-----------------------------------
-- 13.2.1. INDICES ADICIONALES SEGUN PATRONES DE CONSULTA
-- Verificar con EXPLAIN PLAN: el CBO puede preferir FULL SCAN.
-----------------------------------
CREATE INDEX IX_USUARIO_ROL ON USUARIO (ID_ROL);
CREATE INDEX IX_DOCUMENTO_DOCTOR_TIPO ON DOCUMENTO_DOCTOR (ID_DOCTOR,TIPO_DOCUMENTO,ID_DOCUMENTO);
CREATE INDEX IX_DOC_ESP_ESPECIALIDAD ON DOCTOR_ESPECIALIDAD (ID_ESPECIALIDAD,ID_DOCTOR);
CREATE INDEX IX_PRE_RES_DOCTOR_FECHA ON PRE_RESERVA_CITA (ID_DOCTOR,FECHA_CITA,ESTADO);
CREATE INDEX IX_PRE_RES_CONS_FECHA ON PRE_RESERVA_CITA (ID_CONSULTORIO,FECHA_CITA,ESTADO);
CREATE INDEX IX_PAGO_PRERESERVA ON PAGO_CITA (ID_PRE_RESERVA);
CREATE INDEX IX_CITA_PACIENTE_FECHA ON CITA (ID_PACIENTE,FECHA_CITA);
CREATE INDEX IX_CITA_CONS_FECHA ON CITA (ID_CONSULTORIO,FECHA_CITA);
CREATE INDEX IX_RECETA_DETALLE_RECETA ON RECETA_DETALLE (ID_RECETA);
CREATE INDEX IX_NOTIF_CITA ON NOTIFICACION_SALIENTE (ID_CITA);
CREATE INDEX IX_NOTIF_ENVIO ON NOTIFICACION_SALIENTE (ESTADO,FECHA_PROXIMO_INTENTO);
CREATE INDEX IX_AUD_FECHA ON AUDITORIA (FECHA_OPERACION) LOCAL;
CREATE INDEX IX_SES_ESTADO_ULTIMA ON SESION_USUARIO (ESTADO, ULTIMA_ACTIVIDAD);

-----------------------------------
-- 13.3. DATOS INICIALES DE ROLES
-----------------------------------

INSERT INTO ROL (nombre) VALUES ('ADMINISTRADORA');
INSERT INTO ROL (nombre) VALUES ('RECEPCIONISTA');
INSERT INTO ROL (nombre) VALUES ('DOCTOR');
INSERT INTO ROL (nombre) VALUES ('CAJERA');
INSERT INTO ROL (nombre) VALUES ('TESORERA');

-----------------------------------
-- 13.4. PARAMETROS INICIALES
-----------------------------------

INSERT INTO PARAMETRO_SISTEMA (nombre,valor,descripcion)
VALUES ('COMISION_DOCTOR','60','Porcentaje de citas atendidas para el doctor');

INSERT INTO PARAMETRO_SISTEMA (nombre,valor,descripcion)
VALUES ('COMISION_GESTORA','40','Porcentaje de citas atendidas para la gestora');

INSERT INTO PARAMETRO_SISTEMA (nombre,valor,descripcion)
VALUES ('BLOQUEO_MINUTOS','10','Duracion del bloqueo temporal de una pre-reserva');

INSERT INTO PARAMETRO_SISTEMA (nombre,valor,descripcion)
VALUES ('SESION_MINUTOS','20','Inactividad maxima de sesion; valor inicial configurable');

COMMIT;

-----------------------------------
-- 13.5. CONSULTAS DE VERIFICACION
-----------------------------------

SELECT INDEX_NAME, TABLE_NAME, UNIQUENESS
FROM USER_INDEXES
WHERE INDEX_NAME IN (
    'UQ_CITA_DOCTOR_TURNO',
    'UQ_CITA_CONSULTORIO_TURNO',
    'IX_CITA_FECHA_ESTADO'
)
ORDER BY INDEX_NAME;

SELECT ID_ROL, NOMBRE, ESTADO
FROM ROL
ORDER BY ID_ROL;

SELECT NOMBRE, VALOR, ESTADO
FROM PARAMETRO_SISTEMA
ORDER BY NOMBRE;


-- ========================================================================

-- ============================================================================
-- KARELY / ORACLE DATABASE 19c
-- ARCHIVO 08 - SESION 4 / OPTIMIZACION SQL CBO, EXPLAIN PLAN, DBMS_STATS
-- ESTILO: material del curso BD2 (S1-S8), adaptado a Karely.
-- CONEXION: KARELY_BD2 en la PDB (no CDB$ROOT).
-- EJECUCION: SQL Developer, F5 / Run Script, en el orden del LEEME.
-- NOTA: instalacion NUEVA, no migracion de datos.
-- ============================================================================
SET DEFINE OFF
SET SERVEROUTPUT ON SIZE UNLIMITED
WHENEVER SQLERROR EXIT SQL.SQLCODE

-- ---------------------------------------------------------------------------
-- 1. CBO: cost based optimizer; revisar estadisticas existentes.
-- ---------------------------------------------------------------------------
SELECT TABLE_NAME,NUM_ROWS,BLOCKS,LAST_ANALYZED
  FROM USER_TAB_STATISTICS
 WHERE TABLE_NAME IN ('CITA','PACIENTE','PAGO_CITA','LIQUIDACION',
                      'DOCTOR','AUDITORIA','SESION_USUARIO')
 ORDER BY TABLE_NAME;

-- ---------------------------------------------------------------------------
-- 2. Recolectar estadisticas. Ejecutar despues de insertar datos de prueba
-- representativos. En esquema recien creado pueden no existir registros.
-- ---------------------------------------------------------------------------
BEGIN
  DBMS_STATS.GATHER_SCHEMA_STATS(
      ownname => USER,
      options => 'GATHER AUTO',
      cascade => TRUE,
      degree => 1);
  DBMS_OUTPUT.PUT_LINE('DBMS_STATS: recopilacion solicitada.');
END;
/

-- Forma equivalente vista en S4: ejecutar de manera explicita sobre tablas concretas.
-- EXEC DBMS_STATS.GATHER_TABLE_STATS(OWNNAME=>USER,TABNAME=>'PAGO_CITA',CASCADE=>TRUE);
-- EXEC DBMS_STATS.GATHER_TABLE_STATS(OWNNAME=>USER,TABNAME=>'LIQUIDACION',CASCADE=>TRUE);
-- Primero realizar pruebas con datos representativos, no asumir mejoria automatica.

-- ---------------------------------------------------------------------------
-- 3. EXPLAIN PLAN - Caso 1: cobros del paciente por fecha y estado.
-- ---------------------------------------------------------------------------
EXPLAIN PLAN SET STATEMENT_ID='KARELY_PC_01' FOR
SELECT pc.id_pago, pc.id_paciente, pc.fecha_pago,
       pc.monto, pc.metodo_pago, pc.estado
FROM PAGO_CITA pc
WHERE pc.id_paciente=1
  AND pc.fecha_pago >= TIMESTAMP '2026-01-01 00:00:00'
ORDER BY pc.fecha_pago DESC;
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY(NULL,'KARELY_PC_01',
 'BASIC +COST +ROWS +PREDICATE'));

-- ---------------------------------------------------------------------------
-- 4. EXPLAIN PLAN - Caso 2: pago de doctores por rango sin funcion en fecha.
-- ---------------------------------------------------------------------------
EXPLAIN PLAN SET STATEMENT_ID='KARELY_LIQ_02' FOR
SELECT l.id_doctor,l.fecha_pago,l.monto,l.metodo_pago,l.numero_operacion
FROM LIQUIDACION l
WHERE l.id_doctor=1
  AND l.fecha_pago >= TIMESTAMP '2026-01-01 00:00:00'
  AND l.fecha_pago <  TIMESTAMP '2027-01-01 00:00:00';
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY(NULL,'KARELY_LIQ_02',
 'BASIC +COST +ROWS +PREDICATE'));

-- ---------------------------------------------------------------------------
-- 5. EXPLAIN PLAN - Caso 3: JOIN agenda, paciente y doctor.
-- ---------------------------------------------------------------------------
EXPLAIN PLAN SET STATEMENT_ID='KARELY_AGEN_03' FOR
SELECT c.id_cita,c.fecha_cita,c.estado,p.nombres AS paciente,
       d.nombres AS doctor
FROM CITA c
JOIN PACIENTE p ON p.id_paciente=c.id_paciente
JOIN DOCTOR d ON d.id_doctor=c.id_doctor
WHERE c.fecha_cita >= DATE '2026-11-01'
  AND c.fecha_cita < DATE '2026-12-01';
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY(NULL,'KARELY_AGEN_03',
 'BASIC +COST +ROWS +PREDICATE'));

-- ---------------------------------------------------------------------------
-- 6. Revisar índices (no siempre se usan: CBO decide segun cardinalidad).
-- ---------------------------------------------------------------------------
SELECT TABLE_NAME,INDEX_NAME,UNIQUENESS,STATUS
FROM USER_INDEXES
WHERE TABLE_NAME IN ('PAGO_CITA','LIQUIDACION','CITA')
ORDER BY TABLE_NAME,INDEX_NAME;

-- ---------------------------------------------------------------------------
-- 7. Ejecutar realmente una consulta y examinar A-Rows, buffers y tiempo.
-- Esta sección depende de permisos del laboratorio sobre V_$SQL y sus vistas.
-- NO conceder permisos ANY ni SELECT_CATALOG_ROLE al usuario de aplicacion.
-- ---------------------------------------------------------------------------
-- SET TIMING ON
-- SELECT /*+ GATHER_PLAN_STATISTICS */ l.id_doctor,SUM(l.monto)
--   FROM LIQUIDACION l
--   WHERE l.fecha_pago>=DATE '2026-01-01'
--   GROUP BY l.id_doctor;
-- SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(NULL,NULL,'ALLSTATS LAST'));
-- Interpretar E-Rows (estimadas), A-Rows (reales), buffers e I/O.
-- EXPLAIN PLAN no ofrece tiempo real, y COST no se mide en milisegundos.

-- 8. Medición experimental: llenar ESTA TABLA en el INFORME con resultados reales:
-- Prueba | filas | ms antes | ms despues | costo antes | costo despues |
-- buffers antes | buffers despues | acceso elegido | conclusion.

-- Ejecutar como auditor.karely DESPUES de 03 para comprobar FULL.
-- Los valores sensibles deben estar redactados (vacios o valor FULL configurado en Oracle).
-- Ejecutar luego las mismas consultas como admin01 para comparar datos sin redaccion.
SELECT * FROM KARELY_BD2.V_S_RD_DOCTOR FETCH FIRST 3 ROWS ONLY;
SELECT * FROM KARELY_BD2.V_S_RD_CITA FETCH FIRST 3 ROWS ONLY;
SELECT * FROM KARELY_BD2.V_S_RD_PACIENTE FETCH FIRST 3 ROWS ONLY;
SELECT * FROM KARELY_BD2.V_S_RD_PAGO FETCH FIRST 3 ROWS ONLY;
SELECT * FROM KARELY_BD2.V_S_RD_USUARIO FETCH FIRST 3 ROWS ONLY;


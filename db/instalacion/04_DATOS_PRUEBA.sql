SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

PROMPT Cargando datos base de prueba.
@@ "../datos_prueba/01_datos_base.sql"
PROMPT Cargando escenarios de citas y finanzas.
@@ "../datos_prueba/02_escenarios.sql"
PROMPT Datos de prueba cargados.

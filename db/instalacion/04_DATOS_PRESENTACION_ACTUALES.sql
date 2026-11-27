SET SERVEROUTPUT ON SIZE UNLIMITED
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

PROMPT Cargando datos actuales para presentacion.
PROMPT Incluye usuarios, doctores validados, pacientes, horarios, citas y finanzas.
@@ "../datos_prueba/reinicio/01_cargar_datos_iniciales_reales.sql"

PROMPT Datos actuales cargados.

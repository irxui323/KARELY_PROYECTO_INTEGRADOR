SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT SQL.SQLCODE

@@ "../../base de datos/07_VALIDACION_GENERAL.sql"
@@ "../datos_prueba/03_verificar.sql"

PROMPT Verificacion finalizada. Revisar que no existan ORA- en la salida.

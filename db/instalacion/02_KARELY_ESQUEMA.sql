SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT SQL.SQLCODE

PROMPT Instalando esquema base Karely.
@@ "../../base de datos/01_TABLAS_KARELY.sql"
@@ "../../base de datos/02_COMENTARIOS_INDICES.sql"
@@ "../../base de datos/03_TRIGGERS.sql"
@@ "../../base de datos/04_FUNCIONES_PROCEDIMIENTOS.sql"
@@ "../../base de datos/05_VISTAS_REPORTES.sql"
@@ "../../base de datos/06_PARTICIONES_CONSULTAS.sql"
@@ "../../base de datos/07_VALIDACION_GENERAL.sql"
@@ "../../base de datos/08_CBO_ESTADISTICAS.sql"

PROMPT Esquema base instalado.

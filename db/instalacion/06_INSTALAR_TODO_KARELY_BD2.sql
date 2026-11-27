-- INSTALACION COMPLETA DEL ESQUEMA KARELY
-- Ejecutar con F5 / Run Script conectado como KARELY_BD2.
-- Requiere haber ejecutado antes 01_SYSTEM_CREAR_USUARIO.sql conectado como SYSTEM.
-- Usar SOLO en una base nueva y vacia.

SET SERVEROUTPUT ON SIZE UNLIMITED
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

PROMPT [1/4] Creando esquema base.
@@ "02_KARELY_ESQUEMA.sql"

PROMPT [2/4] Aplicando migraciones vigentes.
@@ "03_MIGRACIONES_ACTUALES.sql"

PROMPT [3/4] Cargando datos actuales de presentacion.
@@ "04_DATOS_PRESENTACION_ACTUALES.sql"

PROMPT [4/4] Verificando instalacion.
@@ "05_VERIFICAR_INSTALACION.sql"

PROMPT Instalacion completa finalizada.

SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT SQL.SQLCODE

PROMPT Aplicando migracion de recuperacion de contraseña.
@@ "../migraciones/2026-11-22-recuperacion-password.sql"
PROMPT Aplicando disponibilidad por especialidad.
@@ "../migraciones/2026-11-22-disponibilidad-especialidad.sql"
PROMPT Aplicando acceso total de administradora.
@@ "../migraciones/2026-11-22-administradora-acceso-total.sql"
PROMPT Aplicando archivo PDF y correo del recibo.
@@ "../migraciones/2026-11-23-recibo-pdf.sql"
PROMPT Aplicando cancelacion automatica de citas vencidas.
@@ "../migraciones/2026-11-23-cancelacion-citas-vencidas.sql"
PROMPT Aplicando numeracion correlativa de liquidaciones.
@@ "../migraciones/2026-11-23-numeracion-liquidaciones.sql"
PROMPT Aplicando complemento por modulos del entregable de Base de Datos II.
@@ "../modulos/00_EJECUTAR_MODULOS.sql"

PROMPT Migraciones actuales aplicadas.

# Datos de prueba Oracle

Objetivo: preparar carga ficticia para SQL Developer, sin ejecutar DML ni DDL en Oracle ni cambiar la aplicación.

1. Contrastar columnas, claves, triggers y reglas con base de datos/01 y 04.
2. Crear 01_datos_base.sql: roles y parámetros faltantes, cuentas BCrypt por rol, catálogos, pacientes, doctores y documentos PDF ficticios.
3. Crear 02_escenarios.sql: citas futuras, del día y una atención histórica con devengos y pago parcial. Identificar registros TEST y abortar duplicados; usar identidad automática.
4. Crear 03_verificar.sql y guía de ejecución, cuentas y pruebas manuales.
5. Comprobar hashes con BCrypt del proyecto, PDF y correspondencia de columnas. No afirmar ejecución Oracle sin conexión.

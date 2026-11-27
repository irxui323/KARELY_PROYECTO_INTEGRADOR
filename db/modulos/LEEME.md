# Complemento por cinco modulos

Ejecutar 00_EJECUTAR_MODULOS.sql con F5 como KARELY_BD2 sobre el esquema vigente.
Mantener db/modulos junto a db/migraciones. No ejecutar el instalador completo para actualizar una BD existente.

Cada archivo identifica objetos existentes y agrega los faltantes. No cambia nombres de columnas ni endpoints.
Los procedimientos nuevos solo consultan; las funciones y vistas son de consulta.
Los triggers nuevos escriben AUDITORIA en la misma transaccion: pueden hacer fallar una operacion si falla la auditoria.
La compatibilidad debe validarse en Oracle y mediante los flujos de la aplicacion.
No se ejecutaron estos scripts en Oracle desde esta entrega.

El enmascaramiento solo aplica al consultar las vistas enmascaradas. El propietario conserva acceso a datos originales.
No es Oracle Data Redaction. Para restringir lectores externos hacen falta usuarios/roles Oracle y grants solo sobre esas vistas.
Ese aprovisionamiento requiere SYSTEM y no se incluye en estos scripts de esquema.

Las tablas representativas ya tienen particionamiento; se verifica sin reparticionar.
El verificador muestra los objetos asignados a cada modulo con estado CUMPLE o REVISAR.
La autoria y referencias RF/RN se completan en el documento del curso.
No contar un mismo objeto para dos integrantes.


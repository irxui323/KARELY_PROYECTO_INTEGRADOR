# Adaptación de arquitectura BD24

Estado: implementación local y revisión terminadas; pendiente validación en Oracle real.

- Backend:24 entidades JPA,15 controllers, DTO específicos camelCase, mappers,
  repository tipado, service/service, service/impl y exception centralizado.
- Doctor agrupa documentos/disponibilidad; AtencionMedica contiene clínica;
  Cita contiene cancelaciones/reprogramación/asistencia; Reporte agrupa ingresos.
- LIQUIDACION es pago efectivo; sin tablas financieras heredadas ni CRUD de pagos.
- Frontend conserva core/features/layout/shared y páginas por operación,
  utiliza recursos HTTP y modelos camelCase. Finanzas registra pago y consulta saldo.
- Login conserva sus reglas anteriores; se adaptaron sus DTO internos y paquetes.
- Sin comentarios en código activo backend/frontend. No se modificó ejemplo,
  ZIP, scripts originales de BD ni datos Oracle; no commits ni publicaciones.

Verificación:48 pruebas backend,36 Angular/Vitest y35 Node aprobadas.
Modelo JPA comprobado con H2 en modo Oracle; NO equivale a ejecutar PL/SQL Oracle.
Compilación frontend producción y desarrollo, empaquetado Maven.
Revisión independiente:corregida exposición de datos personales de doctor a tesorería.

No se dispone de verificación de arranque con ddl-auto=validate sobre Oracle real.
Las diferencias de tipos Oracle y las transacciones/procedimientos deben comprobarse
con la conexión configurada; no se afirma funcionamiento integral por pruebas simuladas.
La siguiente revisión funcional del usuario y del login queda pendiente como acordado.

Detalle actualizado en backend/README.md. Copia previa de fuentes en
 tmp/antes-backend-bd24. Los documentos anteriores describen etapas históricas.

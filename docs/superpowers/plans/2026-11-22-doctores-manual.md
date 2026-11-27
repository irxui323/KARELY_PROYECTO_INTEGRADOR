# Flujo manual de doctores

Alcance aprobado:registro sin cuenta/ID manual, especialidad, DNI y título en
cargas separadas, revisión humana con conformidad individual, rechazo con motivo,
creación de acceso DOCTOR con contraseña segura mostrada una vez. Sin recuperación
ni cambios del login, sin nuevos controllers ni modificaciones DDL del esquema.
Arquitectura:DoctorController, DTO doctor, service/service yservice/impl,
repository existente; Angular feature doctores con páginas separadas.
La contraseña generada sirve con login actual; obligatoriedad de cambio y tokens
se dejan para etapa login. No afirmar que vence/temporalidad sin soporte persistente.
Rechazos y revisión se auditan; motivo persiste en AUDITORIA sin agregar tablas.
Validación exige especialidad y versiones exactas revisadas; nuevas cargas invalidan
confirmaciones. Crear acceso usa bloqueo del doctor y una transacción para usuario
más vínculo, rol DOCTOR resuelto internamente y correo del doctor.

- [x] Backend:DTO, revisión manual, rechazo y acceso, pruebas de reglas.
- [x] Frontend:registro/documentos/acceso, tests y contratos.
- [x] Suites, revisión y documentación.


# Correcciones del módulo de doctores

Conservar DoctorController, DoctorService, DoctorServiceImpl, DoctorRepository y features/doctores. No DDL ni comentarios nuevos.

1. Probar login DOCTOR con returnUrl administrativo y conservar solo destinos /doctor autorizados; mostrar panel médico e Inicio hacia agenda.
2. Añadir GET /doctores/{id}/especialidades y DELETE /doctores/{id}/especialidades/{idEspecialidad}, con DTO de catálogo existente. Solo administración elimina. Bloquear doctor, comprobar asignación y actividad pendiente (citas PROGRAMADA/REPROGRAMADA/EN_ATENCION, reservas BLOQUEADA no vencidas), quitar vínculo y auditar. Historial y catálogo se conservan. Asignación usa el mismo bloqueo que reserva para serializar.
3. En Especialidades, cargar asignadas por doctor, confirmar retirada e impedir duplicados y respuestas de selección anterior.
4. En Documentación, aplicar espaciado, controles de archivo claros, vacíos y revisión manual con diseño existente, adaptable a móvil.
5. Ejecutar pruebas de regresión, suites completas, compilaciones y revisión visual sin modificar datos Oracle.

## Resultado

Implementados los tres ajustes sin añadir controllers, entidades ni migraciones. La retirada se permite también para la última especialidad; la interfaz advierte que necesitará otra para recibir reservas. Se conservan documentación, cuenta, catálogo e historial.

Verificación: Maven verify, 89 pruebas sin fallos, JAR generado. Frontend: 57 pruebas Angular y 39 Node sin fallos; compilación de producción aprobada. Pruebas nuevas de permisos, conflictos, reservas vencidas/vigentes, historial, HTTP y retirada JPA con rollback en H2.

Revisión real del navegador: test.doctor entró a /doctor aun con returnUrl de Documentación. Documentación se revisó con datos TEST a 1440, 768 y 390 píxeles, sin desbordamiento horizontal. No se aprobaron documentos ni se quitaron asignaciones en Oracle durante la revisión. Los endpoints nuevos requieren reiniciar el backend abierto; su retirada se verificó mediante pruebas HTTP y persistencia H2.

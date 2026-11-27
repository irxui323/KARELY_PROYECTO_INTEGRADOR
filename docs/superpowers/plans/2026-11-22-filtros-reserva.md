# Filtros de reserva

Mantener arquitectura. Añadir consulta GET /citas/disponibilidad en CitaController y contrato DTO por doctor con turnos. Consultar especialidad, fecha opcional y consultorio opcional. Filtrar doctores activos con documentación completa, especialidad activa, disponibilidad activa, franjas activas futuras y ausencia de cruces con citas activas o bloqueos vigentes, comparando intervalos incluso para franjas distintas. Fecha/hora de la base como autoridad. Sin DDL.

Frontend: especialidad, fecha y consultorio actualizan opciones; mostrar conteos y diferenciar cero, pocos (1-3) y disponibles. Cambiar filtros limpia turno; especialidad limpia doctor; preservar doctor si sigue siendo válido. Ignorar respuestas obsoletas. No enviar mientras carga ni si turno no está en respuesta actual. Filtrar pacientes y catálogos activos. Oracle vuelve a comprobar bajo bloqueo al reservar.

Verificar consulta con H2, permisos, límites fecha, cambios de filtros, conteos y respuestas fuera de orden; suites y compilaciones finales. Sin comentarios de código.

## Implementación y comprobaciones

La selección actualiza la consulta automáticamente al cambiar especialidad, fecha o consultorio. Se ofrecen doctores habilitados de esa especialidad; sin fecha se solicita elegirla. Con fecha se presentan tarjetas y opciones con cero, pocos (1-3) o más turnos. La comprobación del consultorio se aplica al seleccionarlo; antes se indica que falta comprobarlo. El selector de turno solo muestra franjas libres del doctor elegido. Los pacientes y catálogos inactivos se excluyen.

Se conservaron CitaController, CitaService, CitaServiceImpl y CitaRepository; se añadieron DTO tipados sin entidades ni DDL. Al reservar se mantiene el procedimiento transaccional original para impedir conflictos concurrentes. Un rechazo refresca disponibilidad y limpia el turno. No hay actualización por push: se actualiza al cambiar filtros, pulsar Actualizar turnos o recibir un rechazo de reserva.

Verificación automatizada: 96 pruebas backend y 69 Angular +39 Node; producción Angular compilada. Cobertura nueva de cruces entre franjas, consultorio, bloqueo vigente/vencido, horas pasadas, estados inactivos, permisos, contrato HTTP, descarte de respuestas antiguas, eventos del selector renderizado y reserva exitosa/rechazada. La consulta SQL se ejecutó en H2 en modo Oracle, no contra Oracle del usuario.

La inspección visual en navegador no estuvo disponible en este chat. Se intentó una vista aislada con datos simulados; no se pudo abrir y se cerró el servidor temporal. No se modificaron datos Oracle. Se requiere reiniciar backend y recargar frontend; no hay SQL adicional que ejecutar.

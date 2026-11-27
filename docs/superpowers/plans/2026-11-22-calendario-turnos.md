# Calendario de turnos por día

Conservar las capas de citas y usar un componente compartido para representar el mes. Verde >=4 turnos, amarillo 1-3, gris 0. Mostrar número de turnos y leyenda, con etiquetas accesibles. Bloquear días pasados y sin turnos; selección visible sin perder su nivel de disponibilidad. Navegación mensual y teclado mediante botones nativos.

GET /citas/disponibilidad-mes recibe especialidad, mes (fecha primer día) y consultorio opcional; devuelve conteo por fecha y doctor. Reutilizar la consulta de cruces para un rango mensual, evitando una petición por día. Filtrar doctor en frontend con la respuesta completa del mes; cuando no se seleccionó doctor sumar sus turnos. Mantener consulta diaria final y validación transaccional al reservar. No DDL ni cambios de arquitectura ni comentarios nuevos.

Pruebas: conteos diarios/mensuales coherentes, filtro por doctor, colores/límites de mes y días no seleccionables, descarte de respuestas antiguas. Ejecutar suites y compilación.

## Resultado

Implementado componente shared/calendario-disponibilidad con plantillas y CSS separados. El botón de fecha abre el calendario de la aplicación en lugar del selector nativo. Incluye conteo por día, leyenda, navegación mensual, estado seleccionado, etiquetas accesibles y cierre mediante botón o Escape. La selección actualiza los turnos diarios existentes. Sin doctor se suman turnos de todos los doctores habilitados de la especialidad; al elegir uno se muestran solo los suyos. Sin consultorio se advierte que falta comprobarlo.

Reutilizada la consulta de disponibilidad mediante rango desde inclusivo/hasta exclusivo. La respuesta mensual conserva fecha y doctor; no realiza consultas separadas por día. Se mantienen la comprobación de cruces, reservas vigentes, horario futuro y estados activos del flujo anterior.

Verificación: Maven verify con 97 pruebas sin fallos y JAR generado; 75 pruebas Angular y 39 Node aprobadas; compilación Angular de producción aprobada. Pruebas del calendario renderizado verifican clases verde/amarillo/gris, conteos, selección, etiquetas y bloqueo. Persistencia comprobada en H2 modo Oracle, no Oracle real. Navegador local no disponible en este chat; inspección visual real pendiente. No hay cambios SQL ni comentarios nuevos.

Para utilizarlo: reiniciar backend y recargar frontend. Los días sin datos o sin disponibilidad quedan grises y no seleccionables.

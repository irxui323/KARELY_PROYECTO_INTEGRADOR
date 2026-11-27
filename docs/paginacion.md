# Paginación de listados

Se sigue el patrón del ejemplo Pharma: `PaginaResponseDTO`, parámetros `pagina` y `tamanio` y componente compartido `paginador`. La organización por capas y módulos se conserva.

## Uso

Cada tabla permite elegir 10, 20, 50 o 100 registros y navegar a la primera, anterior, siguiente o última página. Al cambiar el tamaño o buscar, se vuelve a la primera página.

Los listados de doctores, pacientes, citas, admisiones, agenda médica, horarios, usuarios, auditoría, notificaciones, liquidaciones e ingresos consultan una página en el backend. La búsqueda se aplica antes del conteo y la paginación. No se limita la búsqueda a la página visible ni a los antiguos primeros 200 o 400 registros. Se mantienen los permisos y restricciones por doctor.

Documentos y especialidades del doctor seleccionado y parámetros del sistema utilizan el mismo componente sobre sus listas completas de metadatos en memoria. No se descargan los archivos adjuntos para paginar la documentación.

La agenda ofrece Próximas pendientes, Historial y Todas. Próximas pendientes incluye programadas, reprogramadas y en atención desde hoy, ordenadas por fecha y hora ascendente; Historial muestra las restantes desde la fecha más reciente. Todas presenta primero las próximas pendientes y después el historial.

## API

Ejemplo: `GET /api/v1/citas?pagina=0&tamanio=20&filtro=&vista=proximas`.

Las páginas se numeran desde cero. La respuesta incluye `contenido`, `pagina`, `tamanio`, `totalElementos`, `totalPaginas`, `primera` y `ultima`. Se rechazan tamaños fuera de 1 a 100, páginas negativas y búsquedas superiores a 150 caracteres. Los filtros se envían como parámetros SQL, escapando los comodines de LIKE.

Las solicitudes anteriores sin `pagina` siguen devolviendo arreglos para conservar los selectores y flujos existentes. La paginación de tablas no cambia los selectores de formularios.

## Ejecución y comprobación

No requiere scripts SQL ni migraciones. Reiniciar el backend y recargar el frontend.

Las pruebas cubren 425 registros, última página parcial, búsqueda fuera de la primera página, caracteres especiales, consultas JPA de pacientes, agenda por doctor, compatibilidad HTTP, selector de tamaño y respuestas de búsqueda atrasadas. Las pruebas SQL automatizadas usan H2 en modo Oracle; falta comprobar la integración en la instancia Oracle local del usuario.

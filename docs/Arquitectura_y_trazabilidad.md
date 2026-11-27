# Backend Karely y trazabilidad de los casos de uso

El flujo en Spring es controlador HTTP → interfaz de servicio → implementación
transaccional → repositorio del dominio → Oracle. Las rutas que ya consume Angular
conservan sus nombres, sus parámetros y sus respuestas. OracleJdbc es infraestructura
para parámetros y transacciones JDBC. Los repositorios del dominio contienen el SQL
y los nombres de los procedimientos.

| CU | Cadena de clases (prefijos) | Flujo disponible y diferencia con el dibujo |
|---|---|---|
| 01 Listar doctores | Doctor → Doctor | listado con proyección según el rol |
| 02 Buscar doctor | Doctor → Doctor | GET /doctores/buscar?documento=… dentro de /api/v1 |
| 03 Registrar doctor | Doctor → Doctor y Usuario | alta, alta de cuenta, vínculo y carga de documentos por rutas separadas. El alta conjunta y SUNAT quedan pendientes |
| 04 Validar documentos | Doctor y DocumentoDoctor → Doctor y DocumentoDoctor | lista de pendientes, búsqueda, lectura de adjuntos y aprobación por SP_VALIDAR_DOCUMENTACION. El rechazo actualiza el estado del doctor y registra auditoría |
| 05 Registrar disponibilidad | Horario → Horario | SP_REGISTRAR_DISPONIBILIDAD valida documentación y evita cruces. El listado de doctores completos está disponible en el dominio Doctor |
| 06 Registrar paciente | Paciente → Paciente | búsqueda exacta por tipo y número, y alta. Consulta a proveedor de identidad pendiente |
| 07 Reservar cita | Cita → Cita | SP_PRE_RESERVAR_CITA bloquea y SP_CONFIRMAR_CITA_PAGADA registra pago, cita y comprobante juntos. Comprobación previa de disponibilidad de consultorio queda pendiente como lectura aparte |
| 08 Reprogramar cita | Cita → Cita | SP_REPROGRAMAR_CITA valida y actualiza. El listado general puede combinarse con disponibilidad |
| 09 Registrar asistencia | Cita → Cita | SP_REGISTRAR_ASISTENCIA aplica la ventana previa y registra la llegada. Verificación previa dedicada queda pendiente |
| 10 Cerrar atención | Cita → Cita | diagnóstico, receta, medicamento, recibo y cierre en operaciones separadas, validadas por Oracle |
| 11 Sumar ingresos | Ingreso → Ingreso | total de ingresos asentados por médico. La vista conserva las reglas contables del esquema, por lo que no suma el valor bruto de todas las citas |
| 12 Pagar doctor | Liquidacion → Liquidacion | cálculo al generar liquidación y pago con número de boleta. Envío automático de la boleta al registrar el pago pendiente |
| 13 Registrar ingresos | Ganancia y Liquidacion | Oracle registra ingresos mediante cancelación reprogramada y liquidación. Vista previa independiente por periodo pendiente |
| 14 Consultar citas del doctor | Cita → Cita | agenda, filtro por fecha y detalle. El filtro y el detalle se acotan al médico autenticado |
| 15 Iniciar sesión | Sesion → Usuario y Sesion | verifica credenciales, registra el acceso y abre sesión |
| 16 Cerrar sesión | Sesion → Sesion | POST /auth/logout invalida la sesión del token |
| 17 Usuarios y roles | Usuario → Usuario | listar, crear, asignar rol y cambiar estado |
| 18 Turnos | Turno → Turno | listar, registrar y editar franja |
| 19 Consultorios | Consultorio → Consultorio | listar, registrar y editar |
| 20 Especialidades | Especialidad → Especialidad | listar, registrar y editar |
| 21 Parámetros | Parametro → Parametro | SP_CAMBIAR_PARAMETRO valida y conserva historial |
| 22 Reporte de citas | Reporte → Reporte | citas por rango y estado. Entrega por correo pendiente |

Las altas y validaciones de documentos usan el BLOB de Oracle definido en el
esquema actual. Los diagramas mencionan almacenamiento externo. Las nuevas rutas
quedan disponibles en la API y pueden integrarse desde las pantallas correspondientes.

## Verificación

Desde la carpeta del backend con JDK 21, ejecutar `mvnw.cmd clean test`.
La prueba de confirmación pasa por la ruta HTTP, verifica autorización y comprueba
que se haga una sola llamada al repositorio. La prueba de agenda comprueba que un
rol ajeno no llegue al repositorio. Para validar con Oracle, iniciar con el
script del proyecto y repetir las operaciones sobre el esquema de pruebas.


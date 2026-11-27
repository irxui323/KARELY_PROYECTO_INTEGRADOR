# Área personal y fechas de disponibilidad

Se conserva la arquitectura y los permisos de consulta necesarios para obtener el doctor asociado a la sesión. El menú del rol DOCTOR utiliza las rutas personales existentes: Mi agenda, Horarios y Atención. Las rutas antiguas /doctores y /doctores/horarios redirigen a /doctor y /doctor/horarios; otros roles conservan sus listados.

Los dos formularios de horarios comparten fechaActual y fechaNoPasada en core/utils. El calendario limita la fecha mínima a hoy, el formulario rechaza fechas pasadas escritas manualmente y el servicio backend comprueba la fecha antes de llamar a Oracle. La zona utilizada es America/Bogota (UTC-5). El procedimiento original ya contiene la misma restricción para la fecha de la base.

Verificación: 91 pruebas backend y 63 Angular + 39 Node aprobadas; Maven verify y compilación de producción aprobados. Las regresiones incluyen ayer, hoy, mañana, límite UTC y redirecciones del doctor. En navegador se confirmó el menú personal con test.doctor. La última interacción para escribir ayer en el calendario no se ejecutó: la revisión automática no pudo completarse por límite de uso. Ese caso sí quedó comprobado mediante pruebas automatizadas de ambos formularios. No se insertaron horarios durante la revisión.

Sin cambios SQL, sin nuevos controllers ni comentarios en código. Reiniciar backend y recargar frontend para usar la versión actual.

# Secuencia de pruebas de integración (Oracle 21c + API + Angular 22)

**Entorno de pruebas únicamente**. Evitar usar documentos personales o pagos reales.

1. Ejecutar `db/CONSULTAS_VERIFICACION.sql`, confirmar 29 tablas, objetos `VALID`, roles, porcentajes y particiones.
2. Comprobar conexión a Oracle con variables `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (usar el mismo service name de SQL Developer).
3. Dar de alta por bootstrap (solo si no hay admin) y entrar con credenciales propias. Verificar que el hash en `USUARIO.PASSWORD_HASH` sea bcrypt y que no se exponga en API.
4. Desde Administración crear especialidad, consultorio y franja, y crear usuarios Recepcionista, Doctor y Tesorera.
5. Desde Doctores: registrar doctor, asociar un usuario con rol Doctor, subir DNI y título PDF, validar ambos y asignar especialidad.
6. Registrar un horario futuro; intentar solapar horarios y comprobar rechazo.
7. Crear un paciente de prueba.
8. Crear pre-reserva para un turno disponible, comprobar ventana de 10 minutos; intentar reservar el mismo turno y comprobar rechazo.
9. Realizar **una transacción de cobro de prueba realmente verificada** en el sistema de caja simulado; registrar referencia única y confirmar. Verificar filas `PAGO_CITA`, `CITA` y `COMPROBANTE_CITA`.
10. Reprogramar una vez antes del inicio, con aceptación documentada; segundo intento debe rechazarse.
11. En la ventana de 30 minutos registrar asistencia; iniciar atención con la cuenta del doctor asignado.
12. Registrar diagnóstico, receta y al menos un medicamento. Emitir y entregar recibo; cerrar la atención. Intentar cerrar antes de completar esos requisitos: debe fallar.
13. Crear liquidación con Tesorera, registrar pago parcial y luego saldo. Validar cálculo 60/40 y la unicidad de cada cita liquidada.
14. Revisar vistas de agenda, ingresos, saldos y auditoría.
15. Cerrar sesión. Intentar reutilizar JWT anterior: debe responder 401.
16. Modificar estado o rol de un usuario y comprobar que sus sesiones ya no permitan acceso.
17. Comprobar que datos clínicos no se entregan a roles ajenos; probar archivos PDF solo como administradora.
18. Ensayar concurrencia en dos sesiones sobre el mismo doctor/consultorio: solo una pre-reserva vigente.
19. Someter a revisión el flujo contradictorio de cancelación tras reprogramación antes de permitir su uso real.

No se han ejecutado estas pruebas contra una instancia Oracle desde este entorno. No equivalen a una certificación de los 112 RF, 27 RN y 19 RNF.

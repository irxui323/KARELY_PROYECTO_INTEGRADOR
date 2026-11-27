# Disponibilidad por especialidad

## Actualizar Oracle antes de iniciar esta versión

Detener el backend. En SQL Developer, conectar como KARELY_BD2 en ORCL y ejecutar con F5:

    db/migraciones/2026-11-22-disponibilidad-especialidad.sql

El archivo está preparado, no ejecutado por el agente. Añade ID_ESPECIALIDAD a DISPONIBILIDAD_DOCTOR y actualiza cuatro procedimientos existentes; no añade tablas, controllers ni entidades. La restricción única original de doctor/fecha/franja se conserva, al igual que las citas y pagos existentes. Oracle realiza commits implícitos al ejecutar DDL: conservar una copia de seguridad del esquema de desarrollo antes de aplicar cambios.

La migración conserva los ID de horarios. Puede determinar la especialidad si hay una cita activa o reserva vigente inequívoca para ese turno, o si el doctor tiene una sola especialidad asignada. Si no hay información suficiente, deja la especialidad pendiente; no elige la primera ni copia el horario a todas.

## Clasificar horarios pendientes

En Horarios, la tabla incluye la especialidad. Para un horario futuro que indique «Pendiente de asignar», pulsar «Asignar especialidad», escoger una especialidad del doctor y guardar. Se completa la misma disponibilidad, sin duplicarla. Esto funciona en el módulo personal del doctor y en administración.

Un horario pendiente no aparece como turno disponible para reservar. Puede haber menos días verdes en el calendario tras aplicar la migración hasta que se clasifiquen esos horarios.

## Registrar horarios nuevos

Elegir doctor (en administración), especialidad, fecha y franja. El doctor solo ve sus especialidades activas. La disponibilidad se ofrece exclusivamente para la especialidad elegida, tanto en las reservas como en el calendario.

El procedimiento bloquea al doctor antes de comprobar cruces. Se rechaza el mismo horario y cualquier franja que se solape, aunque corresponda a otra especialidad. Se admite otra franja contigua sin solapamiento. La misma fila antigua pendiente se puede clasificar; después queda sujeta al control normal de duplicados.

Las pre-reservas, la confirmación y la reprogramación también exigen que la disponibilidad corresponda a la especialidad de la cita. La validación no depende únicamente de la pantalla.

No ejecutar nuevamente los instaladores 00 a 08 ni los scripts de datos TEST ya cargados. Para una instalación nueva, ejecutar esta migración antes de los scripts TEST actualizados.

## Gmail

El remitente de correo se configura por separado. Consultar docs/RECUPERACION_PASSWORD.md y utilizar la nueva opción -CorreoGmail del script de backend. La migración de horarios no activa ni envía correos.

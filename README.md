# Karely frontend

Reorganización del 21/11/2026 según los proyectos de `ejemplo` y los PDF del curso.

## Ejecutar

```powershell
npm.cmd ci
npm.cmd start
```

La aplicación abre en http://127.0.0.1:4200 y el proxy envía `/api` a
http://localhost:8080. Los datos reales requieren el backend y Oracle.

## Organización

```text
src/app/
  core/          sesión, interceptores, guards, menú, errores y tipos comunes
  features/      auth, inicio, pacientes, doctores, catalogos, citas,
                 atencion, finanzas y administracion
  layout/        main-layout, header y sidebar
  shared/        directivas y páginas comunes
  app.config.ts
  app.routes.ts
```

Cada feature contiene modelos, servicios HTTP y páginas con TS/HTML/CSS
separados. Las rutas cargan cada página de operación bajo demanda.
Los formularios de datos usan FormGroup y FormControl tipados; los filtros
y selectores auxiliares conservan ngModel. No hay contratos Row/any ni un
ApiService genérico. Los servicios conservan las rutas del backend actual.

La configuración de API está en `src/environments`. La autorización usa
permisos derivados de las restricciones actuales de Java, con guards,
directiva de acciones y navegación filtrada. El servidor sigue autorizando
cada petición. La sesión vence según `exp` del JWT y el login acepta un
`returnUrl` interno validado. Los contratos camelCase coordinados con Java
quedan para la etapa backend.

Las páginas separan listados, alta/edición, documentos, especialidades,
horarios, admisión, reserva, confirmación, reprogramación, atención,
liquidaciones, pagos, ingresos, usuarios, catálogos, parámetros, auditoría y
notificaciones. Las ediciones resuelven el ID de la ruta usando el listado
existente, sin inventar endpoints. Los envíos impiden solicitudes repetidas
mientras están pendientes y notifican los cambios asincrónicos a Angular.

## Verificar

```powershell
npm.cmd test
npm.cmd run build -- --configuration production
```

Las pruebas usan Angular CLI con Vitest, HTTP de pruebas y Node. Los archivos
`.spec.ts` se encuentran junto a los servicios y páginas. Las pruebas de interacción
montan las plantillas en jsdom y simulan el servidor; no conectan a Oracle ni
certifican flujos integrales. La comprobación de formularios no sustituye la
futura revisión de problemas funcionales críticos.

La copia previa de las fuentes y pruebas está fuera del frontend, en
`../tmp/backup-frontend-arquitectura`. No se incluyeron cambios de esta etapa
en GitHub ni se crearon commits sobre los cambios locales previos.

Adaptación BD24: contratos HTTP por recurso y modelos camelCase coordinados con Java. Finanzas registra pagos efectivos en LIQUIDACION; el formulario anterior de generar deuda y luego pagar se sustituyó por registro de pago y consulta de saldo. La arquitectura core/features/layout/shared se conserva.

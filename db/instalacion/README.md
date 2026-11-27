# Instalación completa de Karely

Usar Oracle SQL Developer y ejecutar los archivos con **F5 / Run Script**. Es una instalación nueva: no ejecutar sobre una base que ya contenga Karely.

## 1. Conexión SYSTEM

Abrir `01_SYSTEM_CREAR_USUARIO.sql` conectado como `SYSTEM` en la base/PDB que usará el integrante. El script solicita dos rutas nuevas para archivos `.dbf` y una contraseña; no guarda la contraseña en ningún archivo.

Ejemplo de rutas para una instalación local Oracle en Windows:

```text
C:\ORADATA\ORCL\KARELY_BD2_DATA01.DBF
C:\ORADATA\ORCL\KARELY_BD2_TEMP01.DBF
```

Cada instalación debe usar rutas que no existan todavía. Al terminar, crear una conexión nueva como `KARELY_BD2` con la contraseña ingresada.

## 2. Conexión KARELY_BD2

### Instalación actual para la presentación

Ejecutar `06_INSTALAR_TODO_KARELY_BD2.sql` con **F5 / Run Script**. Este
archivo instala esquema, migraciones, datos actuales de presentación y
verificaciones en el orden correcto. No ejecutarlo sobre una base ya usada.

Los datos actuales incluyen doctores validados, pacientes, disponibilidad,
citas en distintos estados, una atención con receta/recibo y finanzas. Las
cuentas creadas por el script usan la clave indicada en
`../datos_prueba/reinicio/01_cargar_datos_iniciales_reales.sql`.

| Rol | Usuario | Clave inicial |
|---|---|---|
| Recepción | `recepcion.centro` | `KarelyTest2026!` |
| Tesorería | `tesoreria.centro` | `KarelyTest2026!` |
| Doctor | `dra.elena.rojas` | `KarelyTest2026!` |
| Doctor | `dr.marcos.salas` | `KarelyTest2026!` |
| Doctor | `dra.valeria.torres` | `KarelyTest2026!` |
| Doctor | `dr.daniel.castro` | `KarelyTest2026!` |
| Doctor | `dra.sofia.mendoza` | `KarelyTest2026!` |
| Doctor | `dr.renato.paredes` | `KarelyTest2026!` |

### Instalación histórica

Ejecutar en este orden:

1. `02_KARELY_ESQUEMA.sql`
2. `03_MIGRACIONES_ACTUALES.sql`
3. `04_DATOS_PRUEBA.sql`
4. `05_VERIFICAR_INSTALACION.sql`

Los archivos usan rutas relativas. Mantener la carpeta `db` junto a `base de datos`, tal como está en el repositorio. Si SQL Developer no reconoce `@@`, abrir y ejecutar directamente los scripts referenciados en el mismo orden.

## Datos de prueba

Se cargan usuarios, doctores, documentos ficticios, pacientes, disponibilidad, citas y escenarios de finanzas. Las cuentas de prueba usan la contraseña indicada en `db/datos_prueba/LEEME.md`.

No se incluye `db/COMPLETAR_BACKEND_FREEPDB1.sql`: el README actual del backend lo clasifica como histórico e incompatible con el esquema vigente.

## Comprobación

El último script debe mostrar las consultas de verificación sin errores `ORA-`. Luego configurar en el backend la misma URL Oracle, usuario `KARELY_BD2` y la contraseña elegida en el paso 1.

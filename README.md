# KARELY — Sistema de gestión de citas médicas

Aplicación web para gestionar pacientes, doctores, citas, atenciones y finanzas. Utiliza Angular en el frontend, Spring Boot en el backend y Oracle como base de datos.

## Tecnologías

- Frontend: Angular
- Backend: Java 21 y Spring Boot
- Base de datos: Oracle
- Autenticación: JWT y contraseñas protegidas con hash BCrypt

## Estructura del proyecto

KARELY_PROYECTO_INTEGRADOR/
├── backend/       API REST y lógica de negocio
├── frontend/      Aplicación web Angular
├── .gitignore
└── README.md

Consulta backend/README.md para ver los contratos de la API, la configuración del backend y la conexión con Oracle.

## Requisitos

- JDK 21
- Node.js y npm compatibles con Angular
- Oracle Database accesible desde el equipo
- Git

## Configuración de Oracle

El backend se conecta al esquema Oracle existente. Configura la URL, el usuario y la contraseña mediante las variables de entorno requeridas por el backend.

No publiques contraseñas ni secretos en el repositorio. No ejecutes scripts históricos de instalación sobre el esquema actual.

## Ejecución local

Inicia el backend desde una terminal PowerShell, en la carpeta raíz del proyecto:

    cd backend
    .\iniciar-backend.ps1

Inicia el frontend desde otra terminal PowerShell, en la carpeta raíz del proyecto:

    cd frontend
    npm.cmd install
    npm.cmd start

Abre en el navegador la dirección local que muestre Angular al iniciar.

## Funcionalidades

- Inicio de sesión y acceso según el rol del usuario.
- Gestión de pacientes y doctores.
- Gestión de citas y atenciones médicas.
- Operaciones financieras y liquidaciones.
- Administración de usuarios y catálogos.

Los permisos se validan en el backend; la interfaz no es el único control de acceso.

## Pruebas

Ejecuta cada bloque desde la carpeta raíz del proyecto:

Backend:

    cd backend
    .\mvnw.cmd test
    cd ..

Frontend:

    cd frontend
    npm.cmd test
    npm.cmd run build

## Seguridad

- No almacenar contraseñas en texto plano.
- Mantener secretos y credenciales fuera del código y de Git.
- Usar HTTPS y credenciales Oracle con privilegios limitados antes de desplegar el sistema.

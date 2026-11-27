workspace "Karely - Centro Integral" "Arquitectura C4 del frontend Angular y backend Spring Boot." {
    model {
        admin = person "Administradora" "Gestiona usuarios, doctores, documentación, catálogos y operaciones del sistema."
        recepcion = person "Recepcionista" "Registra pacientes, reserva y reprograma citas y registra asistencia."
        caja = person "Cajera" "Registra cobros y confirma citas."
        medico = person "Doctor" "Gestiona su disponibilidad y realiza la atención médica."
        tesoreria = person "Tesorera" "Consulta ingresos, saldos y registra liquidaciones."

        correo = softwareSystem "Proveedor de correo" "Gmail, Outlook o SMTP configurable. Envío de recuperación y notificaciones cuando está habilitado." {
            tags "External"
        }
        dni = softwareSystem "Proveedor de consulta DNI" "API externa configurable para consultar nombres y apellidos por DNI. Integración opcional." {
            tags "External"
        }

        karely = softwareSystem "Karely" "Sistema interno de gestión del centro integral: pacientes, doctores, citas, atención y finanzas." {
            web = container "Frontend" "Aplicación Angular organizada en core, features, layout y shared." "Angular, TypeScript, HTML y CSS" {
                webCore = component "Core" "Autenticación, token, interceptor HTTP, guards, permisos y utilidades de errores." "Angular"
                webLayout = component "Layout" "Encabezado, menú lateral y estructura principal." "Angular"
                webShared = component "Shared" "Componentes reutilizables, calendario de disponibilidad y directivas." "Angular"
                webAuth = component "Autenticación" "features/auth: Login, solicitud de recuperación y restablecimiento de contraseña." "Angular"
                webInicio = component "Inicio" "features/inicio: Panel inicial según rol." "Angular"
                webPacientes = component "Pacientes" "features/pacientes: Registro, edición, búsqueda y admisión de pacientes." "Angular"
                webDoctores = component "Doctores" "features/doctores: Registro, especialidades, horarios, documentos y creación de acceso después de la aprobación manual." "Angular"
                webCitas = component "Citas" "features/citas: Disponibilidad, pre-reserva, confirmación, listado y reprogramación." "Angular"
                webAtencion = component "Atención médica" "features/atencion: Agenda personal, disponibilidad, diagnóstico, receta y recibo." "Angular"
                webFinanzas = component "Finanzas" "features/finanzas: Ingresos, saldo, liquidaciones y registro de pagos a médicos." "Angular"
                webAdmin = component "Administración" "features/administracion: Usuarios, roles, parámetros, auditoría y notificaciones." "Angular"
                webCatalogos = component "Catálogos" "features/catalogos: Modelos y servicios compartidos de especialidades, consultorios, franjas y consulta DNI." "Angular"
            }
            api = container "Backend API REST" "Aplicación única Spring Boot, organizada por capas y subcarpetas por módulo. Base de endpoints: /api/v1." "Java 21, Spring Boot, Spring Security" {
                security = component "Security" "AuthFilter, JwtService y PermisosUsuario: verificación JWT, sesión, roles y permisos. Contraseñas con BCrypt." "Spring Security"
                controllers = component "Controllers por módulo" "controller/{administracion,atencion,auth,catalogos,citas,doctores,finanzas,pacientes,reportes,sistema}. Reciben solicitudes HTTP y delegan en servicios." "Spring MVC"
                dto = component "DTO" "Solicitudes y respuestas por módulo. Bean Validation para campos obligatorios, longitudes, formatos y fechas." "Java records, Jakarta Validation"
                interfaces = component "Interfaces de servicios" "service/service/{modulo}: contratos de las operaciones de cada módulo." "Java interfaces"
                impl = component "Implementaciones de servicios" "service/impl/{modulo}: reglas de negocio, permisos y transacciones. Incluye recuperación de contraseña, cola de correo y consulta DNI." "Spring Service"
                repos = component "Repositories por módulo" "repository/{modulo}: persistencia con EntityManager y acceso JDBC a consultas y procedimientos Oracle. OracleJdbc es compartido." "JPA, Hibernate, JDBC"
                entities = component "Entidades y mappers" "entity contiene el mapeo de tablas; mapper convierte entidades a DTO. Algunas conversiones se realizan desde repositorios." "Jakarta Persistence, Java"
                errors = component "Manejo global de errores" "exception/GlobalExceptionHandler devuelve timestamp, status, error, message, path y validationErrors. Agrupa los errores de campos." "RestControllerAdvice"
                config = component "Configuración" "Seguridad, esquema, recuperación, variables de entorno y configuración de infraestructura." "Spring Configuration"
            }
            db = container "Base de datos" "Esquema KARELY_BD2: datos, relaciones, procedimientos, funciones, triggers y vistas. Documentos médicos almacenados como BLOB; contraseñas como hash." "Oracle Database 19c" {
                tags "Database"
            }
        }

        admin -> karely "Administra"
        recepcion -> karely "Gestiona pacientes y citas"
        caja -> karely "Registra cobros"
        medico -> karely "Gestiona su agenda y atención"
        tesoreria -> karely "Gestiona finanzas"
        admin -> web "Usa el panel administrativo" "Navegador"
        recepcion -> web "Gestiona recepción" "Navegador"
        caja -> web "Gestiona cobros" "Navegador"
        medico -> web "Usa el portal médico" "Navegador"
        tesoreria -> web "Gestiona liquidaciones" "Navegador"
        web -> api "Consume endpoints /api/v1 mediante JSON y multipart; adjunta Bearer token en solicitudes autenticadas" "HTTP REST; HTTPS en despliegue"
        api -> db "Lee y escribe entidades, BLOB y ejecuta procedimientos" "JPA / JDBC Oracle"
        api -> correo "Envía enlaces temporales y notificaciones si SMTP está configurado" "SMTP con STARTTLS"
        api -> dni "Consulta datos del DNI si la integración está habilitada" "HTTPS REST con Bearer token"

        webLayout -> webCore "Consulta sesión y permisos para navegación"
        webLayout -> webShared "Compone elementos reutilizables"
        webAuth -> webCore "Usa autenticación y utilidades compartidas"
        webAuth -> webShared "Reutiliza componentes y directivas"
        webAuth -> api "Consume las APIs del módulo mediante servicios Angular" "HTTP / JSON"
        webInicio -> webCore "Usa autenticación y utilidades compartidas"
        webPacientes -> webCore "Usa autenticación y utilidades compartidas"
        webPacientes -> webShared "Reutiliza componentes y directivas"
        webPacientes -> api "Consume las APIs del módulo mediante servicios Angular" "HTTP / JSON"
        webDoctores -> webCore "Usa autenticación y utilidades compartidas"
        webDoctores -> webShared "Reutiliza componentes y directivas"
        webDoctores -> api "Consume las APIs del módulo mediante servicios Angular" "HTTP / JSON"
        webCitas -> webCore "Usa autenticación y utilidades compartidas"
        webCitas -> webShared "Reutiliza componentes y directivas"
        webCitas -> api "Consume las APIs del módulo mediante servicios Angular" "HTTP / JSON"
        webAtencion -> webCore "Usa autenticación y utilidades compartidas"
        webAtencion -> webShared "Reutiliza componentes y directivas"
        webAtencion -> api "Consume las APIs del módulo mediante servicios Angular" "HTTP / JSON"
        webFinanzas -> webCore "Usa autenticación y utilidades compartidas"
        webFinanzas -> webShared "Reutiliza componentes y directivas"
        webFinanzas -> api "Consume las APIs del módulo mediante servicios Angular" "HTTP / JSON"
        webAdmin -> webCore "Usa autenticación y utilidades compartidas"
        webAdmin -> webShared "Reutiliza componentes y directivas"
        webAdmin -> api "Consume las APIs del módulo mediante servicios Angular" "HTTP / JSON"
        webCatalogos -> webCore "Usa autenticación y utilidades compartidas"
        webCatalogos -> api "Consume las APIs del módulo mediante servicios Angular" "HTTP / JSON"
        webDoctores -> webCatalogos "Consulta catálogos compartidos"
        webPacientes -> webCatalogos "Consulta catálogos compartidos"
        webCitas -> webCatalogos "Consulta catálogos compartidos"
        webAtencion -> webCatalogos "Consulta catálogos compartidos"
        webAdmin -> webCatalogos "Consulta catálogos compartidos"

        controllers -> interfaces "Invoca contratos de servicios"
        controllers -> dto "Recibe solicitudes validadas y devuelve respuestas"
        impl -> interfaces "Implementa los contratos"
        impl -> repos "Consulta y persiste mediante repositorios"
        impl -> security "Comprueba permisos del actor"
        security -> repos "Comprueba sesión y permisos persistidos"
        repos -> entities "Gestiona entidades y conversiones a DTO"
        repos -> db "Ejecuta operaciones de persistencia y procedimientos" "JPA / JDBC"
        errors -> dto "Construye ErrorResponseDTO y errores por campo"
        config -> security "Configura filtros y respuestas de seguridad"
        impl -> correo "Envía recuperación y notificaciones" "SMTP / STARTTLS"
        impl -> dni "Consulta identidad por DNI" "HTTPS"
    }

    views {
        systemContext karely "Contexto" {
            include *
            autolayout lr
        }
        container karely "Contenedores" {
            include *
            autolayout lr
        }
        component web "Frontend" {
            include *
            autolayout lr
        }
        component api "Backend" {
            include *
            autolayout lr
        }
        styles {
            element "Element" {
                color #ffffff
                background #006aa6
            }
            element "Person" {
                shape Person
                background #004a78
            }
            element "Container" {
                background #007da8
            }
            element "Component" {
                background #3488ad
            }
            element "Database" {
                shape Cylinder
                background #465b70
            }
            element "External" {
                background #737b83
            }
        }
    }
}


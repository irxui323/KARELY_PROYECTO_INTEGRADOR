from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf'
OUT.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('ArialStudy', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialStudyBold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFontFamily('ArialStudy', normal='ArialStudy', bold='ArialStudyBold', italic='ArialStudy', boldItalic='ArialStudyBold')
NAVY = colors.HexColor('#12334A')
TEAL = colors.HexColor('#007F87')
PALE = colors.HexColor('#EAF4F5')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='StudyTitle', fontName='ArialStudyBold', fontSize=25, leading=30, textColor=NAVY, spaceAfter=17))
styles.add(ParagraphStyle(name='StudyH', fontName='ArialStudyBold', fontSize=12, leading=16, textColor=TEAL, spaceBefore=13, spaceAfter=6))
styles.add(ParagraphStyle(name='StudyBody', fontName='ArialStudy', fontSize=10, leading=14.5, textColor=NAVY, spaceAfter=8))
styles.add(ParagraphStyle(name='StudySmall', fontName='ArialStudy', fontSize=8.4, leading=11.5, textColor=NAVY, spaceAfter=5))
styles.add(ParagraphStyle(name='StudyLabel', fontName='ArialStudyBold', fontSize=9, leading=12, textColor=TEAL, spaceAfter=9))
story = []

def p(text, style='StudyBody'):
    return Paragraph(text, styles[style])

def title(n, text, intro):
    if story:
        story.append(PageBreak())
    story.extend([p(f'KARELY / GUÍA DE ESTUDIO / {n:02d}', 'StudyLabel'), p(text, 'StudyTitle'), p(intro)])

def h(text):
    story.append(p(text, 'StudyH'))

def para(text):
    story.append(p(text))

def rows(data, widths=None):
    cells = [[p(escape(str(c)), 'StudySmall') for c in row] for row in data]
    table = Table(cells, colWidths=widths or [130, 365], hAlign='LEFT')
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PALE), ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LINEBELOW', (0,0), (-1,-1), .4, colors.HexColor('#D2E1E6')),
        ('LEFTPADDING', (0,0), (-1,-1), 8), ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 7), ('BOTTOMPADDING', (0,0), (-1,-1), 6)]))
    story.extend([table, Spacer(1, 7)])

def flow(text):
    table = Table([[p(escape(text).replace('\n', '<br/>'), 'StudySmall')]], colWidths=[495])
    table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),PALE),('BOX',(0,0),(-1,-1),.6,TEAL),('LEFTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
    story.append(table)

def module_classes(module, controllers, services, implementations, repositories, entity, frontend, support):
    h('Mapa de clases del módulo por capa')
    rows([
        ['Capa / ubicación', 'Clases e interfaces del proyecto'],
        ['controller', controllers],
        ['service (interfaces)', services],
        ['serviceimpl', implementations],
        ['repository', repositories],
        ['entity (record)', entity],
        ['Frontend / src/app', frontend],
        ['dto (compartido)', 'ApiInput; RespuestasOperacion. No hay un DTO específico para cada módulo.'],
        ['persistence (compartido)', 'OracleJdbc. Ejecuta JDBC para los repositorios.'],
        ['security (compartido)', 'JwtService; AuthFilter; PermisosUsuario.'],
        ['config (compartido)', 'SecurityConfig; SchemaCheck; BootstrapAdmin.'],
        ['Colaboradores', support]
    ], [130,365])
    h('Cómo interpretar este mapa')
    para('Los nombres de service corresponden a interfaces; los demás identifican clases o records. Las clases compartidas no se duplican para cada módulo. Se enumeran aquí para que puedas relacionar cada carpeta con el caso de uso.')
    para('Las clases de entity están declaradas en el proyecto, pero no forman el modelo tipado utilizado por todos los servicios: gran parte del intercambio sigue usando Map&lt;String,Object&gt;. Los catálogos y componentes colaboradores se indican como apoyo, no como dependencias directas de todos los servicios.')
    story.append(PageBreak())
    story.extend([p(f'KARELY / {module.upper()} / FUNCIONAMIENTO', 'StudyLabel'),p(f'{module}: flujos y reglas', 'StudyTitle')])

title(1, 'Entiende tu proyecto', 'Guía por módulos del backend y frontend de Karely. Basada en el código local revisado el 20 de noviembre de 2026. Pensada para estudiar, depurar y sustentar el proyecto.')
h('Qué debes poder explicar')
para('Al terminar, deberías poder seguir una petición desde Angular hasta Oracle, identificar quién valida el permiso, localizar el SQL y distinguir un error de datos de uno de configuración.')
flow('Angular → petición HTTP → Controller → Service / ServiceImpl → Repository → OracleJdbc → Oracle')
h('Módulos y capas son cosas distintas')
para('<b>Un módulo</b> agrupa una capacidad: doctores, citas, pacientes o finanzas. <b>Una capa</b> agrupa responsabilidades técnicas: recibir HTTP, coordinar operaciones o consultar datos. Tu código está organizado principalmente por capas; cada módulo atraviesa varias carpetas.')
rows([['Ruta de estudio','Contenido'],['02 / Capas compartidas','config, DTO, entity, persistence y anotaciones.'],['03 / Doctores','Registro, documentación, usuario y disponibilidad.'],['04 / Citas','Reserva, confirmación, agenda y atención.'],['05 / Pacientes','Registro, edición, búsqueda y auditoría.'],['06 / Finanzas','Liquidaciones, pagos e ingresos de la gestora.'],['07 / Seguridad y Angular','JWT, sesiones, roles, interceptor y servicios HTTP.'],['08 / Arranque y pruebas','Diagnóstico de errores y alcance de las pruebas.'],['09 / Repaso y fuentes','Preguntas resueltas y recorrido de lectura.']])
h('La idea que conecta todo')
para('Java expone una API REST y coordina permisos y operaciones. Oracle conserva parte importante de las reglas mediante procedimientos, funciones, restricciones y vistas. Angular muestra las pantallas y llama a la API. Compilar una de estas piezas no demuestra que las tres funcionen juntas.')

title(2, 'Las capas compartidas', 'Cada carpeta responde una pregunta distinta. Evita explicar todas como si fueran lugares equivalentes para guardar código.')
rows([['Carpeta','Responsabilidad real'],['controller','Recibe HTTP, obtiene el usuario autenticado y delega al servicio.'],['service','Interfaz: declara las operaciones que ofrece el módulo.'],['serviceimpl','Implementación: comprueba permisos, interpreta entradas y coordina repositorios y transacciones.'],['repository','Contiene las consultas SQL y los nombres de procedimientos del dominio.'],['persistence','OracleJdbc reutiliza la ejecución JDBC, parámetros y conexiones.'],['dto','ApiInput lee entradas; RespuestasOperacion da una forma común al resultado.'],['entity','Records de Doctor, Paciente, Cita y Liquidacion; no son entidades JPA.'],['security','JWT, sesiones activas y permisos por rol.'],['config','Seguridad general, revisión del esquema y alta inicial opcional.']])
h('Por qué existe config')
para('<b>SecurityConfig</b> define BCrypt, CORS y la cadena con el filtro JWT. <b>SchemaCheck</b> comprueba la presencia de las 29 tablas requeridas, las vistas y los objetos PL/SQL válidos; no crea tablas. <b>BootstrapAdmin</b> permite crear la primera administradora con datos explícitos, si no hay una activa.')
h('Conceptos para la sustentación')
para('<b>Inyección por constructor:</b> Spring entrega al controlador o servicio sus dependencias. <b>@RestController:</b> expone respuestas HTTP. <b>@Service y @Repository:</b> identifican componentes de sus capas. <b>@Transactional:</b> delimita una transacción Spring; los COMMIT internos de PL/SQL deben considerarse al estudiar la atomicidad real.')
para('<b>Limitación actual:</b> gran parte del flujo usa Map&lt;String,Object&gt;. Los records de entity existen, pero no son el modelo utilizado de forma general. ApiInput convierte tipos y exige campos; no sustituye todas las validaciones del negocio.')

title(3, 'Módulo de doctores', 'Objetivo: mantener el médico, vincularlo con su cuenta, gestionar documentación y especialidades, y registrar disponibilidad.')
module_classes('Doctores',
    'DoctorController; DocumentosController; HorarioController.',
    'DoctorService; DocumentoDoctorService; HorarioService.',
    'DoctorServiceImpl; DocumentoDoctorServiceImpl; HorarioServiceImpl.',
    'DoctorRepository; DocumentoDoctorRepository; HorarioRepository.',
    'Doctor. No hay records entity separados para documento u horario.',
    'DoctoresComponent; DoctorComponent. ApiService y AuthService compartidos.',
    'UsuarioRepository y AuditoriaRepository. Catálogo relacionado: EspecialidadController, EspecialidadService, EspecialidadServiceImpl y EspecialidadRepository.')
flow('DoctorController → DoctorService → DoctorServiceImpl → DoctorRepository → OracleJdbc')
rows([['Parte','Clases y participación'],['Gestión del médico','DoctorController, DoctorService, DoctorServiceImpl y DoctorRepository.'],['Adjuntos','DocumentosController, DocumentoDoctorServiceImpl y DocumentoDoctorRepository.'],['Disponibilidad','HorarioController, HorarioServiceImpl y HorarioRepository.'],['Apoyo','UsuarioRepository comprueba la cuenta DOCTOR; AuditoriaRepository registra cambios.']])
h('Ejemplo: registrar un doctor')
para('<b>1.</b> Angular envía POST /api/v1/operaciones/doctor-crear. <b>2.</b> El controlador construye ApiInput. <b>3.</b> El servicio exige ADMINISTRADORA y lee documento, nombres y apellidos. <b>4.</b> El repositorio inserta DOCTOR con parámetros. <b>5.</b> Se registra auditoría y se devuelve el identificador. Crear un médico no crea automáticamente su cuenta: el vínculo es una operación separada.')
h('Documentos y horarios')
para('La subida exige ADMINISTRADORA, tipo permitido, archivo no vacío, límite de 10 MB y MIME PDF, PNG o JPEG. El contenido se guarda como BLOB en Oracle. Estas comprobaciones no equivalen a analizar la firma interna del archivo. La aprobación invoca SP_VALIDAR_DOCUMENTACION.')
para('Registrar disponibilidad admite ADMINISTRADORA o DOCTOR e invoca SP_REGISTRAR_DISPONIBILIDAD. Las reglas de documentación y cruces pertenecen al procedimiento; deben comprobarse también con Oracle real.')
h('Permisos que conviene recordar')
para('Crear, editar, vincular cuenta, asignar especialidad y validar documentación: ADMINISTRADORA. El listado admite otros roles y limita la información: el DOCTOR ve su registro y TESORERA recibe una proyección reducida.')
h('Repaso')
para('<b>¿Por qué no se carga el PDF en DoctorController?</b> La entrada de archivos tiene un controlador y servicio dedicados. <b>¿Qué cambia al subir documentación?</b> Se guarda el documento y se marca la documentación del médico como incompleta para su revisión.')

title(4, 'Módulo de citas', 'Objetivo: coordinar la reserva, el pago registrado, la agenda y la atención. CitaController utiliza CitaService, implementado por CitaServiceImpl, que accede a CitaRepository.')
module_classes('Citas',
    'CitaController.', 'CitaService.', 'CitaServiceImpl.', 'CitaRepository.', 'Cita.',
    'CitasComponent; DoctorComponent para atención y agenda. ApiService y AuthService compartidos.',
    'Catálogos: ConsultorioController, ConsultorioService, ConsultorioServiceImpl y ConsultorioRepository; TurnoController, TurnoService, TurnoServiceImpl y TurnoRepository. Disponibilidad: familia Horario. No hay clases separadas de servicio para diagnóstico o receta: se coordinan desde CitaServiceImpl.')
rows([['Operación','Procedimiento llamado'],['Bloquear turno','SP_PRE_RESERVAR_CITA'],['Confirmar cita pagada','SP_CONFIRMAR_CITA_PAGADA'],['Reprogramar','SP_REPROGRAMAR_CITA'],['Registrar llegada','SP_REGISTRAR_ASISTENCIA'],['Iniciar atención','SP_INICIAR_ATENCION'],['Diagnóstico y receta','SP_REGISTRAR_DIAGNOSTICO / SP_CREAR_RECETA'],['Medicamento','SP_AGREGAR_MEDICAMENTO'],['Recibo y cierre','SP_EMITIR_RECIBO / SP_ENTREGAR_RECIBO / SP_CERRAR_ATENCION']])
h('Ejemplo: confirmar una cita')
para('La ruta POST /api/v1/operaciones/cita-confirmar recibe idPreReserva, metodoPago y referenciaPago. CitaServiceImpl exige ADMINISTRADORA, RECEPCIONISTA o CAJERA y solicita una sola llamada al repositorio. Oracle realiza el flujo de confirmación definido en PL/SQL. Registrar una referencia no demuestra que un banco haya confirmado el cobro.')
h('Reserva y atención no son la misma etapa')
para('La pre-reserva bloquea temporalmente un turno; la confirmación la convierte en una cita pagada según las reglas de Oracle. Reprogramar exige RECEPCIONISTA o ADMINISTRADORA. Registrar asistencia exige RECEPCIONISTA. Diagnóstico, receta, recibo y cierre se ofrecen al rol DOCTOR.')
h('Agenda y protección de datos')
para('GET /api/v1/agenda-medica?fecha=2026-11-25 filtra la agenda del médico autenticado. GET /api/v1/agenda-medica/{idCita} consulta un detalle acotado a ese médico. Si no encuentra la cita, el servicio responde 404. El rol por sí solo no basta: también debe limitarse qué registros puede consultar.')
h('Repaso')
para('<b>¿Dónde se evita una doble reserva?</b> En las reglas y bloqueos de Oracle; la prueba con un repositorio simulado no certifica concurrencia. <b>¿Por qué la atención tiene pasos separados?</b> Cada paso representa una operación y una condición de negocio distinta.')

title(5, 'Módulo de pacientes', 'Objetivo: registrar, editar, listar y buscar pacientes, dejando trazabilidad de las modificaciones.')
module_classes('Pacientes',
    'PacienteController.', 'PacienteService.', 'PacienteServiceImpl.', 'PacienteRepository.', 'Paciente.',
    'PacientesComponent. ApiService y AuthService compartidos.',
    'AuditoriaRepository registra las altas y actualizaciones coordinadas por PacienteServiceImpl.')
flow('PacientesComponent → ApiService → PacienteController → PacienteServiceImpl → PacienteRepository + AuditoriaRepository')
rows([['Petición bajo /api/v1','Uso'],['GET /datos/pacientes','Lista pacientes.'],['POST /operaciones/paciente-crear','Registra un paciente.'],['POST /operaciones/paciente-editar','Edita datos del paciente.'],['GET /pacientes/buscar','Busca por tipo y número de documento.']])
h('Ejemplo: registrar')
para('<b>1.</b> PacienteController recibe el JSON y el principal autenticado. <b>2.</b> PacienteServiceImpl exige ADMINISTRADORA o RECEPCIONISTA. <b>3.</b> ApiInput requiere tipoDocumento, numeroDocumento, nombres y apellidos. <b>4.</b> La fecha de nacimiento es opcional y se convierte cuando existe. <b>5.</b> PacienteRepository inserta los datos. <b>6.</b> AuditoriaRepository registra actor, entidad, identificador y acción CREAR.')
h('Ejemplo de cuerpo de entrada')
flow('{"tipoDocumento":"DNI", "numeroDocumento":"00000001", "nombres":"Paciente", "apellidos":"Prueba"}')
para('Este cuerpo sirve para estudiar el contrato; no lo envíes a una base real solo para probar el ejemplo. El identificador y la auditoría los produce el backend, no el navegador.')
h('Búsqueda y edición')
para('La búsqueda normaliza el tipo de documento a mayúsculas y elimina espacios de los extremos. Al editar, el servicio exige que se haya actualizado exactamente una fila; si no, informa que el paciente no fue encontrado. También registra la actualización en auditoría.')
h('Qué no debes confundir')
para('Paciente no es Usuario. Un paciente representa a quien recibe atención; USUARIO representa una cuenta que accede al sistema. El módulo actual no demuestra una consulta a un proveedor externo de identidad. La presencia del documento en un formulario no implica una validación externa.')
h('Repaso')
para('<b>¿Por qué el servicio llama a dos repositorios?</b> Porque coordina el alta del paciente y su auditoría. <b>¿Dónde está el SQL?</b> En PacienteRepository; OracleJdbc aporta la ejecución común.')

title(6, 'Módulo de finanzas', 'Objetivo: consultar ingresos asentados, generar liquidaciones y registrar los pagos realizados a los médicos.')
module_classes('Finanzas',
    'LiquidacionController; IngresoController; GananciaController.',
    'LiquidacionService; IngresoService; GananciaService.',
    'LiquidacionServiceImpl; IngresoServiceImpl; GananciaServiceImpl.',
    'LiquidacionRepository; IngresoRepository; GananciaRepository.',
    'Liquidacion. No hay records entity específicos para Ingreso o Ganancia.',
    'FinanzasComponent. ApiService y AuthService compartidos.',
    'Los reportes son un dominio relacionado: ReporteController, ReporteService, ReporteServiceImpl y ReporteRepository. No se debe asumir que toda operación financiera pasa por ReporteServiceImpl.')
rows([['Área','Responsabilidad'],['Liquidaciones','Generación, listado y pago; clases completas en el mapa anterior.'],['Ingresos','Lista y total por médico; clases completas en el mapa anterior.'],['Ganancias','Cancelación reprogramada; clases completas en el mapa anterior.'],['Representación','Liquidacion es un record; el flujo general todavía usa mapas.']])
h('Generar y pagar una liquidación')
para('POST /api/v1/operaciones/liquidacion-generar requiere idDoctor, fechaInicio y fechaFin. LiquidacionServiceImpl exige TESORERA e invoca SP_GENERAR_LIQUIDACION mediante el repositorio.')
para('POST /api/v1/operaciones/doctor-pagar requiere idLiquidacion, monto, metodoPago, numeroOperacion y numeroBoleta. El servicio exige TESORERA y llama a SP_PAGAR_DOCTOR. Los listados de liquidaciones y pagos también admiten ADMINISTRADORA; ese permiso de lectura no autoriza por sí mismo a efectuar el pago.')
h('Qué suma realmente IngresoRepository')
para('Consulta VW_INGRESOS_GESTORA y calcula NVL(SUM(MONTO_INGRESO), 0) filtrado por ID_DOCTOR. Por tanto, el resultado representa los ingresos de la gestora asentados y asociados al médico. No es automáticamente la facturación bruta de todas las citas ni el dinero pendiente de pagar al doctor.')
h('Porcentajes: ejemplo para estudiar')
para('Si una base distribuible de S/ 100 se reparte 60 % al médico y 40 % a la gestora, las partes son S/ 60 y S/ 40. Es un ejemplo aritmético; la base elegible, los parámetros vigentes, redondeos y exclusiones dependen del PL/SQL y deben verificarse en Oracle.')
h('Una particularidad del nombre Ganancia')
para('GananciaServiceImpl actualmente expone cancelarReprogramada para ADMINISTRADORA e invoca SP_CANCELAR_REPROGRAMADA. No es un calculador general de beneficios. La documentación reconoce una contradicción de negocio respecto a cancelaciones que sigue pendiente de decisión.')
h('Repaso')
para('<b>¿Pago de cita y pago al doctor son iguales?</b> No: el primero registra el pago por una cita; el segundo reduce o cancela una obligación de una liquidación al médico.')

title(7, 'Seguridad y frontend', 'La seguridad cruza todos los módulos. Angular ayuda a la navegación; el backend decide si una operación está autorizada.')
h('Inicio de sesión')
flow('LoginComponent → AuthService → /auth/login → SesionServiceImpl → UsuarioRepository + SesionRepository → JWT')
para('El servicio normaliza el usuario, comprueba estado y contraseña mediante PasswordEncoder, registra el acceso y abre una sesión Oracle. JwtService emite un token con usuario, sesión, rol y vencimiento. Las contraseñas se verifican con BCrypt; no se recuperan descifrándolas.')
h('Cada petición protegida')
para('authInterceptor añade Authorization: Bearer junto con el token. AuthFilter verifica la firma y vencimiento, consulta la sesión activa y comprueba que el rol coincida. Si autentica, coloca el identificador de usuario en el contexto. PermisosUsuario comprueba después el rol activo requerido por el servicio.')
para('La interfaz guarda la sesión en sessionStorage. Ante un 401 fuera del login, el interceptor elimina esa sesión y redirige al login. Un 403 propaga el error sin borrar automáticamente la sesión. Al cerrar sesión se intenta invalidar la sesión del token y Angular limpia su copia local.')
h('Correspondencia con las pantallas')
rows([['Componente','Relación con los módulos'],['doctores.component.ts','Gestión administrativa de médicos.'],['doctor.component.ts','Panel de trabajo del rol DOCTOR.'],['citas.component.ts','Operación administrativa de citas.'],['pacientes.component.ts','Gestión de pacientes.'],['finanzas.component.ts','Consultas y operaciones financieras.'],['core.ts / routes.ts','Servicios HTTP, sesión, interceptor y guardas de navegación.']])
h('Dos tipos de usuario bloqueado')
para('<b>Cuenta Oracle:</b> KARELY_BD2 conecta el backend a la base. <b>Cuenta de la aplicación:</b> una fila en USUARIO accede a la web. Un bloqueo de Oracle y un estado de la cuenta web se consultan y resuelven por separado. APP_JWT_SECRET es una clave de firma, no ninguna de esas contraseñas.')

title(8, 'Arranque, errores y pruebas', 'Usa el mensaje de causa para diagnosticar. BUILD FAILURE al final suele ser la consecuencia, no la explicación completa.')
rows([['Mensaje o síntoma','Qué revisar'],['APP_JWT_SECRET sin resolver','Falta la variable en el proceso que ejecuta Java. El script la genera; IntelliJ debe recibirla en su configuración.'],['Scripts deshabilitados','PowerShell impide ejecutar el .ps1. Puede iniciarse en un proceso con ExecutionPolicy Bypass.'],['ORA-12541','No se alcanza un listener en el host y puerto indicados.'],['ORA-12514','El listener responde, pero no reconoce el servicio solicitado.'],['401 / 403','401: no autenticado o sesión inválida. 403: acceso denegado por permiso.'],['400 por JSON o fecha','Solicitud inválida: el manejador se corrigió para no responder 500 en esos casos.']])
h('Comandos del proyecto')
flow('Backend: powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\\iniciar-backend.ps1" -Puerto 1521 -Servicio orcl')
para('El tnsnames.ora local revisado declara orcl en localhost:1521. Eso no garantiza que KARELY_BD2 esté en ese servicio ni que pueda autenticarse. Confirma los datos con una conexión funcional de SQL Developer. Mantén abierta la terminal del backend.')
flow('Frontend, desde su carpeta: npm.cmd start\nPruebas backend: .\\mvnw.cmd clean test\nPruebas frontend: npm.cmd test\nBuild frontend: npm.cmd run build -- --configuration production')
h('Evidencia disponible y límites')
para('La última verificación de esta revisión registró <b>31 pruebas de backend y 7 de frontend aprobadas</b>, además de una compilación de producción correcta. Es evidencia de esa ejecución, no una garantía permanente. Los resultados del backend están en target/surefire-reports.')
para('Los tests de Angular ejecutan servicios e interceptor con HTTP de pruebas; no renderizan pantallas. Los tests del backend simulan repositorios en varios escenarios. Todavía se necesitan pruebas reales de Oracle, concurrencia, SMTP y navegador; no están certificadas por esos 38 casos.')

title(9, 'Repaso para sustentar', 'Practica explicando un caso de uso completo sin recitar nombres de carpetas. Relaciona cada clase con una acción observable.')
items=[
('¿Por qué separar Service y ServiceImpl?', 'Service declara el contrato; ServiceImpl contiene la ejecución. El controlador depende de la interfaz. La separación facilita sustituir implementaciones y probar responsabilidades, aunque no sea obligatoria en todo proyecto.'),
('¿Repository y Persistence son lo mismo?', 'No. DoctorRepository conoce consultas de médicos y sus procedimientos. OracleJdbc conoce cómo ejecutar JDBC y reutilizar conexiones y parámetros.'),
('¿DTO y Entity son equivalentes?', 'No. DTO transporta o interpreta datos de la API; una entidad representa datos del dominio o persistencia. En este proyecto ApiInput es genérico y los records de entity todavía no estructuran todo el flujo.'),
('¿Por qué no acceder a Oracle directamente desde Angular?', 'El backend concentra credenciales de conexión, permisos, validaciones y operaciones. Angular consume HTTP y no necesita conocer la contraseña técnica de Oracle.'),
('¿Las reglas están todas en Java?', 'No. Los servicios coordinan; los procedimientos y demás objetos de Oracle contienen reglas importantes. Para validar el sistema completo hay que probar ambas partes.'),
('¿Por qué puede pasar un test y fallar el arranque?', 'Un test puede utilizar una clave JWT propia y un repositorio simulado. El arranque real necesita variables, listener, servicio, credenciales y esquema Oracle válidos.'),
('¿Qué demuestra retirar comentarios?', 'Solo una limpieza del código solicitada. No mejora por sí misma la lógica ni acredita que se cumplan todos los requisitos.')]
for question, answer in items:
    h(question)
    para(answer)
h('Fuentes locales y orden de lectura')
para('Raíz del backend: backend/src/main/java/pe/edu/karely/. Lee por módulo: controller → service → serviceimpl → repository → persistence/OracleJdbc.java. Después consulta config, security y dto. Frontend: frontend/src/app/core.ts, routes.ts y el componente del módulo.',)
story.append(p('Documentos de apoyo: docs/Arquitectura_y_trazabilidad.md; docs/ESTADO_IMPLEMENTACION.md; docs/PRUEBAS_MANUALES.md. Evidencia: docs/RESULTADOS_PRUEBAS_2026-11-20.txt y backend/target/surefire-reports. Revisa db/COMPLETAR_BACKEND_FREEPDB1.sql para estudiar PL/SQL; leerlo no implica ejecutarlo sobre la base.', 'StudySmall'))

def footer(c, doc):
    c.setStrokeColor(TEAL)
    c.setLineWidth(.7)
    c.line(50, 43, A4[0]-50, 43)
    c.setFont('ArialStudy', 8)
    c.setFillColor(NAVY)
    c.drawString(50, 29, 'Karely | Arquitectura y módulos | 20/11/2026')
    c.drawRightString(A4[0]-50, 29, str(doc.page))

target = OUT / 'Guia_estudio_Karely_por_modulos.pdf'
doc = SimpleDocTemplate(str(target), pagesize=A4, rightMargin=50, leftMargin=50,
                        topMargin=43, bottomMargin=59, title='Karely - Guía de estudio por módulos', author='Guía del proyecto Karely')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(target)

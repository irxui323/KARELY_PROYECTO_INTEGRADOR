import "@angular/compiler";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { sourceLoader } from "./helpers/security-loader.mjs";
import {
  createEnvironmentInjector,
  runInInjectionContext,
  ɵINJECTOR_SCOPE,
  PendingTasks,
  ChangeDetectorRef,
} from "@angular/core";
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { Router, provideRouter } from "@angular/router";
import { FormControl, FormGroup, NgControl } from "@angular/forms";
import { TestBed } from "@angular/core/testing";
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from "@angular/platform-browser/testing";
import { JSDOM } from "jsdom";

const load = sourceLoader();
const { AuthService } = await load("core/auth/auth-service");
const { authInterceptor } = await load("core/interceptors/auth-interceptor");
const { errorInterceptor } = await load("core/interceptors/error-interceptor");
const { errorText } = await load("core/utils/http-error");
const { DoctorDocumentos: DoctoresComponent } = await load(
  "features/doctores/pages/doctor-documentos/doctor-documentos",
);
const { DoctorEspecialidades } = await load(
  "features/doctores/pages/doctor-especialidades/doctor-especialidades",
);
const { CatalogoForm: AdminComponent } = await load(
  "features/administracion/pages/catalogo-form/catalogo-form",
);
const { LoginComponent } = await load("features/auth/pages/login/login");
const { authGuard } = await load("core/guards/auth-guard");
const { permisoGuard } = await load("core/guards/permiso-guard");
const { DOCTORES_ROUTES } = await load("features/doctores/doctores.routes");
const { PACIENTES_ROUTES } = await load("features/pacientes/pacientes.routes");
const { ControlDisabled } = await load("shared/directives/control-disabled");
const { AtencionForm: DoctorComponent } = await load(
  "features/atencion/pages/atencion-form/atencion-form",
);
const { AtencionService } = await load("features/atencion/services/atencion-service");
const { LiquidacionForm } = await load("features/finanzas/pages/liquidacion-form/liquidacion-form");
const { PacienteForm: PacientesComponent } = await load(
  "features/pacientes/pages/paciente-form/paciente-form",
);
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
});
for (const key of ["window", "document", "Node", "Element", "HTMLElement"]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: dom.window[key],
  });
}
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

let injector, http, auth, navigations;

test("doctores y pacientes tienen rutas independientes de listado y formulario", () => {
  for (const routes of [DOCTORES_ROUTES, PACIENTES_ROUTES]) {
    assert.ok(routes.some((route) => route.path === "nuevo"));
    assert.ok(routes.some((route) => route.path === ":id/editar"));
  }
});
beforeEach(() => {
  const values = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  navigations = [];
  injector = createEnvironmentInjector([
    { provide: ɵINJECTOR_SCOPE, useValue: "root" },
    { provide: PendingTasks, useValue: { add: () => () => {} } },
    { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideHttpClientTesting(),
    AuthService,
    DoctoresComponent,
    DoctorEspecialidades,
    AdminComponent,
    LoginComponent,
    {
      provide: Router,
      useValue: {
        parseUrl: (url) => ({ redirectTo: url }),
        navigateByUrl: (url) => {
          navigations.push(url);
          return Promise.resolve(true);
        },
      },
    },
  ]);
  http = injector.get(HttpTestingController);
  auth = injector.get(AuthService);
});
afterEach(() => {
  try {
    http.verify();
  } finally {
    injector.destroy();
  }
});

const expiraEn = (Math.floor(Date.now() / 1000) + 3600) * 1000;
const token = [
  Buffer.from(JSON.stringify({ alg: "HS256" })).toString("base64url"),
  Buffer.from(JSON.stringify({ exp: expiraEn / 1000 })).toString("base64url"),
  "firma",
].join(".");
const session = {
  token,
  expiraEn,
  usuario: "doctor",
  rol: "DOCTOR",
  idUsuario: 1,
};

test("un control deshabilitado conserva su dato al construir el payload", () => {
  const control = new FormControl("00000001", { nonNullable: true });
  const form = new FormGroup({ documento: control });
  const local = createEnvironmentInjector(
    [{ provide: NgControl, useValue: { control } }],
    injector,
  );
  try {
    const directive = runInInjectionContext(local, () => new ControlDisabled());
    directive.appControlDisabled = true;
    directive.ngOnChanges();
    assert.equal(control.disabled, true);
    assert.deepEqual(form.getRawValue(), { documento: "00000001" });
    directive.appControlDisabled = false;
    directive.ngOnChanges();
    assert.equal(control.enabled, true);
  } finally {
    local.destroy();
  }
});

test("pago rechaza fecha fin anterior y acepta un periodo del mismo dia", async () => {
  const component = runInInjectionContext(injector, () => new LiquidacionForm());
  component.liqGroup.setValue({ idDoctor: 1, fechaInicio: "2026-11-23",
    fechaFin: "2026-11-22", monto: 60, metodoPago: "EFECTIVO" });
  assert.equal(component.liqGroup.hasError("periodoInvalido"), true);
  await component.registrarPago();
  assert.match(component.error, /fecha de fin/);
  http.expectNone("/api/v1/liquidaciones");
  component.liqGroup.controls.fechaFin.setValue("2026-11-23");
  assert.equal(component.liqGroup.valid, true);
  component.liqGroup.controls.fechaFin.setValue("2026-11-25");
  assert.equal(component.liqGroup.valid, true);
});

test("calendarios de pago limitan el inicio y fin al periodo seleccionado", () => {
  const template = readFileSync(new URL(
    "../src/app/features/finanzas/pages/liquidacion-form/liquidacion-form.html", import.meta.url), "utf8");
  const inputs = template.match(/<input\b[^>]*formControlName="fecha(?:Inicio|Fin)"[^>]*>/g);
  assert.equal(inputs.length, 2);
  TestBed.overrideTemplate(LiquidacionForm, `<form [formGroup]="liqGroup">${inputs.join("")}</form>`);
  const fixture = mountComponent(LiquidacionForm);
  try {
    fixture.componentInstance.liqGroup.patchValue({ fechaInicio: "2026-11-23", fechaFin: "2026-11-25" });
    fixture.detectChanges();
    const inicio = fixture.nativeElement.querySelector('[formControlName="fechaInicio"]');
    const fin = fixture.nativeElement.querySelector('[formControlName="fechaFin"]');
    assert.equal(fin.min, "2026-11-23");
    assert.equal(inicio.max, "2026-11-25");
  } finally {
    fixture.destroy();
    TestBed.resetTestingModule();
  }
});

function mountComponent(component) {
  TestBed.configureTestingModule({
    imports: [component],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
    ],
  });
  const fixture = TestBed.createComponent(component);
  fixture.componentInstance.cargar = async () => {};
  return fixture;
}

test("el selector medico cambia una sola vez y bloquea campos de atencion cerrada", async () => {
  const fixture = mountComponent(DoctorComponent);
  try {
    const component = fixture.componentInstance;
    component.tab = "consultas";
    component.doctor = {
      idDoctor: 1,
      nombres: "Doctor",
      apellidos: "Prueba",
      estado: "ACTIVO",
      estadoDocumentacion: "COMPLETO",
    };
    component.citas = [
      {
        idCita: 31,
        estadoCita: "EN_ATENCION",
        fechaCita: "2026-11-21",
        nombrePaciente: "Paciente prueba",
      },
    ];
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector("select");
    let cambios = 0;
    const original = component.limpiarDetalleConsulta.bind(component);
    component.limpiarDetalleConsulta = () => {
      cambios++;
      original();
    };
    select.selectedIndex = 1;
    select.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    fixture.detectChanges();
    assert.equal(cambios, 1);
    assert.equal(component.medico.idCita, 31);
    TestBed.inject(HttpTestingController)
      .expectOne("/api/v1/atenciones/31/recibo")
      .flush(null, { status: 204, statusText: "No Content" });
    await fixture.whenStable();
    assert.equal(
      fixture.nativeElement.querySelector("textarea").disabled,
      true,
    );
    const start = [...fixture.nativeElement.querySelectorAll("button")].find(
      (button) => button.textContent.includes("Iniciar atención médica"),
    );
    start.click();
    fixture.detectChanges();
    assert.equal(select.disabled, true);
    const backend = TestBed.inject(HttpTestingController);
    backend
      .expectOne("/api/v1/atenciones/iniciar")
      .flush(
        { error: "Prueba de rechazo" },
        { status: 400, statusText: "Bad Request" },
      );
    await fixture.whenStable();
    backend.verify();
  } finally {
    fixture.destroy();
    TestBed.resetTestingModule();
  }
});

test("recibo se emite sin numero manual y se descarga como PDF", async () => {
  const service = runInInjectionContext(injector, () => new AtencionService());
  const emision = firstValueFrom(service.ejecutar("recibo-emitir", {
    idCita: 31, numeroRecibo: "NO-ENVIAR",
  }));
  const request = http.expectOne("/api/v1/atenciones/31/recibo");
  assert.deepEqual(request.request.body, {});
  request.flush({ accion: "SP_EMITIR_RECIBO", id: 20, mensaje: "Emitido" });
  assert.equal((await emision).id, 20);
  const descarga = firstValueFrom(service.descargarRecibo(31));
  const pdfRequest = http.expectOne("/api/v1/atenciones/31/recibo/pdf");
  assert.equal(pdfRequest.request.responseType, "blob");
  const pdf = new Blob(["%PDF"], { type: "application/pdf" });
  pdfRequest.flush(pdf);
  assert.equal((await descarga).type, "application/pdf");
});

test("detalle de atención consulta la cita atendida seleccionada", async () => {
  const service = runInInjectionContext(injector, () => new AtencionService());
  const carga = firstValueFrom(service.detalle(18));
  const request = http.expectOne("/api/v1/atenciones/18/detalle");
  assert.equal(request.request.method, "GET");
  request.flush({
    idCita: 18,
    paciente: "Lucía Herrera",
    doctor: "Dra. Elena Rojas",
    medicamentos: [],
  });
  assert.equal((await carga).idCita, 18);
});

test("editar paciente bloquea identificacion y nuevo paciente la habilita", () => {
  const fixture = mountComponent(PacientesComponent);
  try {
    const component = fixture.componentInstance;
    component.editar({
      idPaciente: 4,
      tipoDocumento: "DNI",
      numeroDocumento: "00000001",
      nombres: "Paciente",
      apellidos: "Prueba",
      estado: "ACTIVO",
    });
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input[placeholder="Número de identificación"]',
    );
    assert.equal(input.disabled, true);
    assert.equal(component.form.numeroDocumento, "00000001");
    component.nuevo();
    fixture.detectChanges();
    assert.equal(input.disabled, false);
  } finally {
    fixture.destroy();
    TestBed.resetTestingModule();
  }
});

test("guardas protegen una ruta y distinguen sesion de permisos", () => {
  assert.deepEqual(
    runInInjectionContext(injector, () => authGuard({}, {})),
    { redirectTo: "/login" },
  );
  auth.session.set(session);
  assert.equal(
    runInInjectionContext(injector, () => authGuard({}, {})),
    true,
  );
  assert.deepEqual(
    runInInjectionContext(injector, () =>
      permisoGuard({ data: { permiso: "USUARIOS_ADMINISTRAR" } }, {}),
    ),
    { redirectTo: "/acceso-denegado" },
  );
  assert.equal(
    runInInjectionContext(injector, () =>
      permisoGuard({ data: { permiso: "AGENDA_PROPIA" } }, {}),
    ),
    true,
  );
});

test("una sesion guardada dañada no se considera autenticada", () => {
  sessionStorage.setItem(
    "karely_session",
    JSON.stringify({ rol: "ADMINISTRADORA" }),
  );
  const restored = runInInjectionContext(injector, () => new AuthService());
  assert.equal(restored.session(), null);
  sessionStorage.setItem("karely_session", "{invalido");
  const malformed = runInInjectionContext(injector, () => new AuthService());
  assert.equal(malformed.session(), null);
});

test("login con campos vacios no envia una solicitud HTTP", async () => {
  const component = injector.get(LoginComponent);
  const pending = component.login();
  const unexpected = http.match("/api/v1/auth/login");
  for (const request of unexpected)
    request.flush({}, { status: 401, statusText: "Unauthorized" });
  await pending;
  assert.equal(unexpected.length, 0);
});

test("interceptor no envia credenciales a servicios externos", async () => {
  auth.session.set(session);
  const pending = firstValueFrom(
    injector.get(HttpClient).get("https://example.invalid/recurso"),
  );
  const request = http.expectOne("https://example.invalid/recurso");
  request.flush({ ok: true });
  await pending;
  assert.equal(request.request.headers.has("Authorization"), false);
});

test("el formulario reactivo de especialidad envia los identificadores seleccionados", async () => {
  const component = injector.get(DoctorEspecialidades);
  component.especialidadFormGroup.controls.idDoctor.setValue(12);
  component.especialidadFormGroup.controls.idEspecialidad.setValue(5);
  const pending = component.asignarEspecialidad();
  const request = http.expectOne("/api/v1/doctores/12/especialidades");
  assert.equal(request.request.body.idDoctor, undefined);
  assert.equal(request.request.body.idEspecialidad, 5);
  request.flush(
    { error: "Duplicado" },
    { status: 409, statusText: "Conflict" },
  );
  await pending;
});

test("login guarda la sesion solo despues de una respuesta correcta", async () => {
  const pending = auth.login("doctor", "clave");
  const request = http.expectOne("/api/v1/auth/login");
  assert.equal(auth.session(), null);
  assert.deepEqual(request.request.body, {
    username: "doctor",
    password: "clave",
  });
  request.flush(session);
  await pending;
  assert.deepEqual(auth.session(), session);
  assert.deepEqual(
    JSON.parse(sessionStorage.getItem("karely_session")),
    session,
  );
});

test("login rechazado no guarda sesion ni redirige", async () => {
  const pending = auth.login("doctor", "mala");
  const rejection = assert.rejects(pending, (e) => e.status === 401);
  http
    .expectOne("/api/v1/auth/login")
    .flush({}, { status: 401, statusText: "Unauthorized" });
  await rejection;
  assert.equal(auth.session(), null);
  assert.deepEqual(navigations, []);
});

test("interceptor envia el token en solicitudes autenticadas", async () => {
  auth.session.set(session);
  const pending = firstValueFrom(injector.get(HttpClient).get("/api/v1/citas"));
  const request = http.expectOne("/api/v1/citas");
  assert.equal(
    request.request.headers.get("Authorization"),
    "Bearer " + session.token,
  );
  request.flush([{ idCita: 31 }]);
  assert.deepEqual(await pending, [{ idCita: 31 }]);
});

test("un 401 protegido elimina la sesion y vuelve al login", async () => {
  auth.session.set(session);
  sessionStorage.setItem("karely_session", JSON.stringify(session));
  const pending = firstValueFrom(injector.get(HttpClient).get("/api/v1/citas"));
  const rejection = assert.rejects(pending, (e) => e.status === 401);
  http
    .expectOne("/api/v1/citas")
    .flush({}, { status: 401, statusText: "Unauthorized" });
  await rejection;
  assert.equal(auth.session(), null);
  assert.equal(sessionStorage.getItem("karely_session"), null);
  assert.deepEqual(navigations, ["/login"]);
});

test("un 403 conserva la sesion y propaga el error", async () => {
  auth.session.set(session);
  const rejection = assert.rejects(
    firstValueFrom(injector.get(HttpClient).get("/api/v1/usuarios")),
    (e) => e.status === 403,
  );
  http
    .expectOne("/api/v1/usuarios")
    .flush({}, { status: 403, statusText: "Forbidden" });
  await rejection;
  assert.deepEqual(auth.session(), session);
  assert.deepEqual(navigations, []);
});

test("logout limpia la sesion incluso si falla el servidor", async () => {
  auth.session.set(session);
  const pending = auth.logout();
  http
    .expectOne("/api/v1/auth/logout")
    .flush({}, { status: 500, statusText: "Error" });
  await pending;
  assert.equal(auth.session(), null);
  assert.deepEqual(navigations, ["/login"]);
});

test("errorText presenta detalle del servidor y dispone de mensaje por defecto", () => {
  assert.equal(errorText({ error: { error: "Cita ocupada" } }), "Cita ocupada");
  assert.equal(
    errorText({ error: { detail: "Documento inválido" } }),
    "Documento inválido",
  );
  assert.equal(errorText(null), "No se pudo completar la operación.");
});

test("los avisos no muestran direcciones HTTP, códigos de Oracle ni errores internos", () => {
  assert.equal(errorText({status:0,message:"Http failure response for /api/v1/citas: 0 Unknown Error"}),"No se pudo conectar con el sistema. Revisa tu conexión e inténtalo de nuevo.");
  assert.equal(errorText({status:500,error:{message:"SELECT * FROM CITA ORA-00942"}}),"No se pudo completar la operación. Inténtalo de nuevo en unos minutos.");
  assert.equal(errorText({status:400,error:{message:"ORA-20003: Este turno ya está ocupado.\nORA-06512: SQL interno"}}),"Este turno ya está ocupado.");
  assert.equal(errorText({error:{message:"OperaciÃ³n no permitida"}}),"Operación no permitida");
  assert.equal(errorText({error:{validationErrors:{nombres:"Completa los nombres.",correo:"Revisa el correo."}}}),"Completa los nombres.");
  assert.equal(errorText({status:403,error:{error:"Forbidden"}}),"Tu cuenta no tiene permiso para realizar esta acción.");
});

test("asignacion rechazada elimina el mensaje de exito anterior", async () => {
  const component = injector.get(DoctorEspecialidades);
  component.exito = "Especialidad asignada";
  component.especialidadForm = { idDoctor: 1, idEspecialidad: 2 };
  const pending = component.asignarEspecialidad();
  http
    .expectOne("/api/v1/doctores/1/especialidades")
    .flush(
      { error: "El doctor ya tiene asignada esta especialidad" },
      { status: 409, statusText: "Conflict" },
    );
  await pending;
  assert.equal(component.exito, "");
  assert.equal(
    component.error,
    "El doctor ya tiene asignada esta especialidad",
  );
});

test("quitar seleccion de doctor limpia la documentacion anterior", async () => {
  const component = injector.get(DoctoresComponent);
  component.documentos = [{ idDocumento: 4 }];
  component.selectedDoctor = 0;
  await component.cargarDocumentos();
  assert.deepEqual(component.documentos, []);
});

test("catalogo rechazado limpia el exito de la operacion anterior", async () => {
  const component = injector.get(AdminComponent);
  component.exito = "Actualización guardada";
  const pending = component.ejecutar("especialidad-crear", {
    nombre: "Dermatología",
    precioConsulta: 50,
  });
  http
    .expectOne("/api/v1/especialidades")
    .flush(
      { error: "Ya existe ese registro" },
      { status: 409, statusText: "Conflict" },
    );
  await pending;
  assert.equal(component.exito, "");
  assert.equal(component.error, "Ya existe ese registro");
});

test("validar sin titulo explica el requisito sin enviar una aprobacion", async () => {
  const component = injector.get(DoctoresComponent);
  component.selectedDoctor = 1;
  component.documentos = [
    { idDocumento: 4, tipoDocumento: "DNI", estado: "PENDIENTE" },
  ];
  const pending = component.aprobarDoctor();
  http
    .expectOne("/api/v1/doctores/1/documentos")
    .flush([{ idDocumento: 4, tipoDocumento: "DNI", estado: "PENDIENTE" }]);
  await new Promise((resolve) => setImmediate(resolve));
  const unexpected = http.match("/api/v1/doctores/1/validar-documentacion");
  for (const request of unexpected)
    request.flush(
      { error: "Falta título" },
      { status: 400, statusText: "Bad Request" },
    );
  await new Promise((resolve) => setImmediate(resolve));
  for (const request of http.match("/api/v1/doctores/1/documentos"))
    request.flush([]);
  await pending;
  assert.equal(unexpected.length, 0);
  assert.match(component.error, /DNI.*título/);
  assert.match(component.error, /Falta o fue rechazado: Título profesional/);
});

test("al cambiar de medico no se muestran respuestas atrasadas del anterior", async () => {
  const component = injector.get(DoctoresComponent);
  component.selectedDoctor = 1;
  const first = component.cargarDocumentos();
  const old = http.expectOne("/api/v1/doctores/1/documentos");
  component.selectedDoctor = 2;
  const second = component.cargarDocumentos();
  http.expectOne("/api/v1/doctores/2/documentos").flush([{ idDocumento: 20 }]);
  await second;
  old.flush([{ idDocumento: 10 }]);
  await first;
  assert.deepEqual(component.documentos, [{ idDocumento: 20 }]);
});

test("con DNI y titulo permite validar y actualiza los estados mostrados", async () => {
  const component = injector.get(DoctoresComponent);
  component.selectedDoctor = 1;
  component.documentos = [
    { idDocumento: 4, tipoDocumento: "DNI", estado: "PENDIENTE" },
    { idDocumento: 5, tipoDocumento: "TITULO", estado: "PENDIENTE" },
  ];
  component.dniConforme = true;
  component.tituloConforme = true;
  component.abiertos = new Set([4, 5]);
  const pending = component.aprobarDoctor();
  http.expectOne("/api/v1/doctores/1/documentos").flush([
    { idDocumento: 4, tipoDocumento: "DNI", estado: "PENDIENTE" },
    { idDocumento: 5, tipoDocumento: "TITULO", estado: "PENDIENTE" },
  ]);
  await new Promise((resolve) => setImmediate(resolve));
  const request = http.expectOne("/api/v1/doctores/1/validar-documentacion");
  assert.deepEqual(request.request.body, {
    dniConforme: true,
    tituloConforme: true,
    idDni: 4,
    idTitulo: 5,
  });
  request.flush({ ok: true });
  await new Promise((resolve) => setImmediate(resolve));
  for (const name of ["doctores"]) http.expectOne("/api/v1/" + name).flush([]);
  await new Promise((resolve) => setImmediate(resolve));
  http.expectOne("/api/v1/doctores/1/documentos").flush([
    { idDocumento: 4, tipoDocumento: "DNI", estado: "VALIDADO" },
    { idDocumento: 5, tipoDocumento: "TITULO", estado: "VALIDADO" },
  ]);
  await pending;
  assert.equal(component.error, "");
  assert.equal(component.exito, "Documentación validada");
  assert.ok(component.documentos.every((d) => d.estado === "VALIDADO"));
});

test("un DNI reciente rechazado no se sustituye por otro antiguo validado", async () => {
  const component = injector.get(DoctoresComponent);
  component.selectedDoctor = 1;
  component.documentos = [
    { idDocumento: 4, tipoDocumento: "DNI", estado: "VALIDADO" },
    { idDocumento: 6, tipoDocumento: "DNI", estado: "RECHAZADO" },
    { idDocumento: 5, tipoDocumento: "TITULO", estado: "PENDIENTE" },
  ];
  const pending = component.aprobarDoctor();
  http.expectOne("/api/v1/doctores/1/documentos").flush([
    { idDocumento: 4, tipoDocumento: "DNI", estado: "VALIDADO" },
    { idDocumento: 6, tipoDocumento: "DNI", estado: "RECHAZADO" },
    { idDocumento: 5, tipoDocumento: "TITULO", estado: "PENDIENTE" },
  ]);
  await pending;
  http.expectNone("/api/v1/doctores/1/validar-documentacion");
  assert.match(component.error, /DNI.*título/);
});

test("validar requiere confirmar la revisión de ambos documentos", async () => {
  const component = injector.get(DoctoresComponent);
  component.selectedDoctor = 1;
  const pending = component.aprobarDoctor();
  http.expectOne("/api/v1/doctores/1/documentos").flush([
    { idDocumento: 4, tipoDocumento: "DNI", estado: "PENDIENTE" },
    { idDocumento: 5, tipoDocumento: "TITULO", estado: "PENDIENTE" },
  ]);
  await pending;
  http.expectNone("/api/v1/doctores/1/validar-documentacion");
  assert.match(component.error, /revisa.*confirma/i);
});

test("acceso medico filtra doctores completos sin cuenta y borra la clave al cambiar", async () => {
  const { DoctorAcceso } = await load(
    "features/doctores/pages/doctor-acceso/doctor-acceso",
  );
  const page = runInInjectionContext(injector, () => new DoctorAcceso());
  page.doctores = [
    { idDoctor: 1, estadoDocumentacion: "COMPLETO" },
    { idDoctor: 2, estadoDocumentacion: "PENDIENTE" },
    { idDoctor: 3, estadoDocumentacion: "COMPLETO", idUsuario: 7 },
  ];
  assert.deepEqual(
    page.elegibles.map((d) => d.idDoctor),
    [1],
  );
  page.credenciales = {
    username: "ana",
    correo: "ana@test.com",
    passwordTemporal: "secreto",
  };
  page.cambiarDoctor();
  assert.equal(page.credenciales, null);
});

test("generar acceso entrega credenciales una vez y retira al doctor elegible", async () => {
  const { DoctorAcceso } = await load(
    "features/doctores/pages/doctor-acceso/doctor-acceso",
  );
  const page = runInInjectionContext(injector, () => new DoctorAcceso());
  page.doctores = [
    { idDoctor: 1, estadoDocumentacion: "COMPLETO", correo: "ana@test.com" },
  ];
  page.selectedDoctor = 1;
  page.username = "ana";
  const pending = page.generarAcceso();
  const duplicate = page.generarAcceso();
  const request = http.expectOne("/api/v1/doctores/1/acceso");
  assert.deepEqual(request.request.body, { username: "ana" });
  request.flush({
    username: "ana",
    correo: "ana@test.com",
    passwordTemporal: "generada",
  });
  await Promise.all([pending, duplicate]);
  assert.equal(page.credenciales.passwordTemporal, "generada");
  assert.equal(page.elegibles.length, 0);
  page.ngOnDestroy();
  assert.equal(page.credenciales, null);
});
test("cambiar doctor limpia conformidades y documentos abiertos", async () => {
  const component = injector.get(DoctoresComponent);
  component.dniConforme = true;
  component.tituloConforme = true;
  component.abiertos.add(4);
  component.selectedDoctor = 0;
  await component.cargarDocumentos();
  assert.equal(component.dniConforme, false);
  assert.equal(component.tituloConforme, false);
  assert.equal(component.abiertos.size, 0);
});

test("subir DNI conserva el título pendiente y bloquea doble envío sin alterar revisión", async () => {
  const page = injector.get(DoctoresComponent);
  page.selectedDoctor = 1;
  const dni = new File(["dni"], "dni.pdf");
  const titulo = new File(["titulo"], "titulo.pdf");
  page.archivos = { DNI: dni, TITULO: titulo };
  const pending = page.subirDocumento("DNI");
  page.dniConforme = true;
  await page.subirDocumento("TITULO");
  assert.equal(page.dniConforme, true);
  http
    .expectOne("/api/v1/doctores/1/documentos")
    .flush({ mensaje: "Guardado" });
  await new Promise((resolve) => setImmediate(resolve));
  http.expectOne("/api/v1/doctores/1/documentos").flush([]);
  await new Promise((resolve) => setImmediate(resolve));
  http.expectOne("/api/v1/doctores").flush([]);
  await pending;
  assert.equal(page.archivos.DNI, null);
  assert.equal(page.archivos.TITULO, titulo);
  assert.equal(page.guardadoPendiente, true);
});

test("administradora puede seleccionar atencion sin tener un registro de doctor", () => {
  const fixture = mountComponent(DoctorComponent);
  try {
    const service = TestBed.inject(AuthService);
    const original = service.session;
    service.session = () => ({ rol: "ADMINISTRADORA", idUsuario: 7 });
    const component = fixture.componentInstance;
    component.doctor = undefined;
    component.citas = [
      {
        idCita: 31,
        idDoctor: 2,
        nombreDoctor: "Ana",
        nombrePaciente: "Paciente",
        estadoCita: "EN_ATENCION",
      },
    ];
    component.medico = { idCita: 31, medioEntrega: "EMAIL" };
    fixture.detectChanges();
    assert.equal(component.citaListaParaAtender, true);
    assert.equal(component.nombreDoctor, "Todos los médicos");
    assert.ok(
      fixture.nativeElement.textContent.includes("Agenda y atención médica"),
    );
    assert.ok(
      !fixture.nativeElement.textContent.includes(
        "Esta cuenta todavía no está vinculada",
      ),
    );
    service.session = original;
  } finally {
    fixture.destroy();
  }
});

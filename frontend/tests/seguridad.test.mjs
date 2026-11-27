import "@angular/compiler";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  createEnvironmentInjector,
  runInInjectionContext,
  ChangeDetectorRef,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { sourceLoader } from "./helpers/security-loader.mjs";
const load = sourceLoader();
const { AuthService } = await load("core/auth/auth-service");
let injector, values, navigations, response;
const jwt = (exp) =>
  "eyJhbGciOiJIUzI1NiJ9." +
  Buffer.from(JSON.stringify({ exp })).toString("base64url") +
  ".signature";
const payload = (
  rol = "DOCTOR",
  exp = Math.floor(Date.now() / 1000) + 3600,
) => ({ token: jwt(exp), usuario: "ana", rol, idUsuario: 7 });
beforeEach(() => {
  values = new Map();
  navigations = [];
  globalThis.sessionStorage = {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, v),
    removeItem: (k) => values.delete(k),
  };
  response = payload();
  injector = createEnvironmentInjector([
    AuthService,
    { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
    { provide: HttpClient, useValue: { post: () => of(response) } },
    {
      provide: Router,
      useValue: {
        navigateByUrl: (url) => {
          navigations.push(url);
          return Promise.resolve(true);
        },
        parseUrl: (url) => ({ redirectTo: url }),
      },
    },
  ]);
});
afterEach(() => injector.destroy());
test("descarta sesión vencida restaurada y elimina su almacenamiento", () => {
  values.set("karely_session", JSON.stringify(payload("DOCTOR", 1)));
  const auth = injector.get(AuthService);
  assert.equal(auth.session(), null);
  assert.equal(values.has("karely_session"), false);
});
test("calcula vencimiento JWT y limita acciones a roles backend", async () => {
  const auth = injector.get(AuthService);
  const session = await auth.login("ana", "clave");
  assert.equal(
    session.expiraEn,
    JSON.parse(Buffer.from(session.token.split(".")[1], "base64url")).exp *
      1000,
  );
  assert.equal(auth.tienePermiso("ATENCION_REGISTRAR"), true);
  assert.equal(auth.tienePermiso("PAGOS_REGISTRAR"), false);
  response = payload("ADMINISTRADORA");
  await auth.login("ana", "clave");
  assert.equal(auth.tienePermiso("ASISTENCIA_REGISTRAR"), true);
  assert.equal(auth.tienePermiso("PAGOS_REGISTRAR"), true);
  assert.equal(auth.tienePermiso("DOCTORES_ESCRIBIR"), true);
});
test("vence sin actividad y muestra aviso al regresar a login", async () => {
  response = payload("DOCTOR", (Date.now() + 80) / 1000);
  const auth = injector.get(AuthService);
  await auth.login("ana", "clave");
  await new Promise((r) => setTimeout(r, 120));
  assert.equal(auth.session(), null);
  assert.match(navigations.at(-1), /sesionExpirada=1/);
});
test("rechaza destinos externos y preserva URL interna", async () => {
  const { returnUrlSeguro } = await load("core/utils/return-url");
  for (const url of [
    "https://otro.com",
    "//otro.com",
    "/\\otro.com",
    "/%2f%2fotro.com",
    "/login",
    "/login?x=1",
  ])
    assert.equal(returnUrlSeguro(url), null);
  assert.equal(returnUrlSeguro("/citas/editar/3?x=1"), "/citas/editar/3?x=1");
});
test("guard recuerda ruta solicitada y deniega operación sin permiso", async () => {
  const { authGuard } = await load("core/guards/auth-guard");
  const denied = runInInjectionContext(injector, () =>
    authGuard({}, { url: "/citas?estado=1" }),
  );
  assert.equal(denied.redirectTo, "/login?returnUrl=%2Fcitas%3Festado%3D1");
  const auth = injector.get(AuthService);
  await auth.login("ana", "clave");
  const { permisoGuard } = await load("core/guards/permiso-guard");
  assert.equal(
    runInInjectionContext(injector, () =>
      permisoGuard(
        { data: { permiso: "PAGOS_REGISTRAR" } },
        { url: "/finanzas" },
      ),
    ).redirectTo,
    "/acceso-denegado",
  );
});
test("invitado autenticado vuelve a su panel y sesión dañada se descarta", async () => {
  values.set("karely_session", "{dañado");
  const auth = injector.get(AuthService);
  assert.equal(auth.session(), null);
  await auth.login("ana", "clave");
  const { invitadoGuard } = await load("core/guards/invitado-guard");
  assert.equal(
    runInInjectionContext(injector, () => invitadoGuard({}, {})).redirectTo,
    "/doctor",
  );
});
test("menú expone lectura de doctores a tesorera sin acciones de escritura", async () => {
  response = payload("TESORERA");
  const auth = injector.get(AuthService);
  await auth.login("ana", "clave");
  assert.equal(auth.tienePermiso("PAGOS_REGISTRAR"), true);
  const { Sidebar } = await load("layout/sidebar/sidebar");
  const sidebar = runInInjectionContext(injector, () => new Sidebar());
  assert.equal(
    sidebar.menu.some((item) => item.path === "/doctores"),
    true,
  );
  assert.equal(
    sidebar.menu.some((item) => item.path === "/admin"),
    false,
  );
});
test("login vuelve al destino interno solicitado", async () => {
  response = payload("RECEPCIONISTA");
  const { ActivatedRoute } = await import("@angular/router");
  const { LoginComponent } = await load("features/auth/pages/login/login");
  const child = createEnvironmentInjector(
    [
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: {
              get: (key) => (key === "returnUrl" ? "/citas/confirmar" : null),
            },
          },
        },
      },
    ],
    injector,
  );
  try {
    const login = runInInjectionContext(child, () => new LoginComponent());
    login.loginForm.setValue({ username: "ana", password: "clave" });
    await login.login();
    assert.equal(navigations.at(-1), "/citas/confirmar");
  } finally {
    child.destroy();
  }
});
test("destruir servicio cancela el aviso programado", async () => {
  response = payload("DOCTOR", (Date.now() + 80) / 1000);
  await injector.get(AuthService).login("ana", "clave");
  injector.destroy();
  await new Promise((r) => setTimeout(r, 120));
  assert.equal(navigations.length, 0);
  injector = createEnvironmentInjector([]);
});
test("sesión restaurada recalcula expiraEn y descarta permisos inyectados", () => {
  values.set(
    "karely_session",
    JSON.stringify({
      ...payload("CAJERA"),
      expiraEn: 9999999999999,
      permisos: ["PAGOS_REGISTRAR"],
    }),
  );
  const auth = injector.get(AuthService);
  assert.equal(auth.estaAutenticado(), true);
  assert.equal(auth.tienePermiso("CITAS_CONFIRMAR"), true);
  assert.equal(auth.tienePermiso("PAGOS_REGISTRAR"), false);
  assert.equal("permisos" in auth.session(), false);
});
test("login ignora returnUrl externo y muestra vencimiento", async () => {
  const { ActivatedRoute } = await import("@angular/router");
  const { LoginComponent } = await load("features/auth/pages/login/login");
  const child = createEnvironmentInjector(
    [
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: {
              get: (key) =>
                key === "returnUrl"
                  ? "//otro.com"
                  : key === "sesionExpirada"
                    ? "1"
                    : null,
            },
          },
        },
      },
    ],
    injector,
  );
  try {
    const login = runInInjectionContext(child, () => new LoginComponent());
    assert.ok(login.aviso);
    login.loginForm.setValue({ username: "ana", password: "clave" });
    await login.login();
    assert.equal(navigations.at(-1), "/doctor");
  } finally {
    child.destroy();
  }
});

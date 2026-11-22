import { TestBed } from "@angular/core/testing";
import { PERMISOS_POR_ROL } from "../../core/config/permisos";
import { Rol, Permiso } from "../../core/auth/auth.model";
import { AuthService } from "../../core/auth/auth-service";
import { Sidebar } from "./sidebar";
import { permisoGuard } from "../../core/guards/permiso-guard";
import { DOCTORES_ROUTES } from "../../features/doctores/doctores.routes";
import { Router, provideRouter } from "@angular/router";
import { Component } from "@angular/core";

@Component({ standalone: true, template: "" })
class PaginaPrueba {}

describe("Área personal del doctor", () => {
  it("marca solamente la página médica actual, incluso con parámetros", async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: "doctor", component: PaginaPrueba },
          { path: "doctor/horarios", component: PaginaPrueba },
          { path: "doctor/consultas", component: PaginaPrueba },
        ]),
        {
          provide: AuthService,
          useValue: {
            session: () => ({ rol: "DOCTOR" }),
            estaAutenticado: () => true,
            tienePermiso: () => true,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    for (const [url, texto] of [
      ["/doctor", "Mi agenda"],
      ["/doctor/horarios", "Horarios"],
      ["/doctor/consultas?cita=2", "Atención"],
    ]) {
      await router.navigateByUrl(url);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const activos = fixture.nativeElement.querySelectorAll(
        "a.activa",
      ) as NodeListOf<HTMLAnchorElement>;
      expect([...activos].map((a) => a.textContent?.trim())).toEqual([texto]);
    }
  });
  it("el menú ofrece agenda, horarios y atención sin directorio", () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            session: () => ({ rol: "DOCTOR" }),
            estaAutenticado: () => true,
            tienePermiso: () => true,
          },
        },
      ],
    });
    const menu = TestBed.runInInjectionContext(() => new Sidebar()).menu;
    expect(menu.map((item) => item.path)).toEqual([
      "/doctor",
      "/doctor/horarios",
      "/doctor/consultas",
    ]);
    expect(menu.some((item) => item.path === "/doctores")).toBe(false);
  });
  for (const [ruta, destino] of [
    ["", "/doctor"],
    ["horarios", "/doctor/horarios"],
  ]) {
    it(`redirige el enlace administrativo ${ruta} al área propia`, () => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: AuthService,
            useValue: {
              session: () => ({ rol: "DOCTOR" }),
              estaAutenticado: () => true,
              tienePermiso: () => true,
            },
          },
          { provide: Router, useValue: { parseUrl: (url: string) => url } },
        ],
      });
      const route = DOCTORES_ROUTES.find((r) => r.path === ruta)!;
      const result = TestBed.runInInjectionContext(() =>
        permisoGuard({ data: route.data } as any, {} as any),
      );
      expect(result).toBe(destino);
    });
  }
});

describe("Administración de todos los módulos", () => {
  it("muestra todos los módulos y permite horarios generales", () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            session: () => ({ rol: "ADMINISTRADORA" }),
            estaAutenticado: () => true,
            tienePermiso: () => true,
          },
        },
        { provide: Router, useValue: { parseUrl: (url: string) => url } },
      ],
    });
    const menu = TestBed.runInInjectionContext(() => new Sidebar()).menu;
    expect(menu.map((item) => item.path)).toEqual([
      "/home",
      "/pacientes",
      "/doctores",
      "/citas",
      "/finanzas",
      "/doctor",
      "/admin",
    ]);
    const result = TestBed.runInInjectionContext(() =>
      permisoGuard(
        {
          data: {
            permiso: "HORARIOS_ESCRIBIR",
            redireccionAdmin: "/doctores/horarios",
          },
        } as any,
        {} as any,
      ),
    );
    expect(result).toBe("/doctores/horarios");
  });
});

describe("Módulos según el trabajador", () => {
  for (const [rol, rutas, titulo] of [
    [
      "RECEPCIONISTA",
      ["/home", "/pacientes", "/doctores", "/citas"],
      "RECEPCIÓN",
    ],
    ["CAJERA", ["/home", "/citas"], "CAJA"],
    ["TESORERA", ["/home", "/doctores", "/finanzas"], "TESORERÍA"],
  ] as const) {
    it(`limita el menú de ${rol}`, () => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: AuthService,
            useValue: {
              session: () => ({ rol }),
              estaAutenticado: () => true,
              tienePermiso: (p: Permiso) =>
                PERMISOS_POR_ROL[rol as Rol].includes(p),
            },
          },
        ],
      });
      const sidebar = TestBed.runInInjectionContext(() => new Sidebar());
      expect(sidebar.menu.map((i) => i.path)).toEqual([...rutas]);
      expect(sidebar.tituloPanel).toBe(titulo);
    });
  }
});

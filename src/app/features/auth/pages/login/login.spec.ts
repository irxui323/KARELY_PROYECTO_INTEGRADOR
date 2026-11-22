import { TestBed } from "@angular/core/testing";
import { ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../core/auth/auth-service";
import { LoginComponent } from "./login";

describe("Destino inicial del doctor", () => {
  for (const destino of [
    "/doctores/documentos",
    "/admin",
    "/acceso-denegado",
    "/",
  ]) {
    it(`abre agenda en lugar de recuperar ${destino}`, async () => {
      const navegar = vi.fn().mockResolvedValue(true);
      TestBed.configureTestingModule({
        providers: [
          {
            provide: AuthService,
            useValue: { login: async () => ({ rol: "DOCTOR" }) },
          },
          { provide: Router, useValue: { navigateByUrl: navegar } },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { queryParamMap: { get: () => destino } } },
          },
          { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
        ],
      });
      const pagina = TestBed.runInInjectionContext(() => new LoginComponent());
      pagina.loginForm.setValue({ username: "doctor", password: "clave" });
      await pagina.login();
      expect(navegar).toHaveBeenCalledWith("/doctor");
    });
  }
});

describe("Destino inicial de trabajadores", () => {
  for (const [rol, destino] of [
    ["RECEPCIONISTA", "/citas"],
    ["CAJERA", "/citas/confirmar"],
    ["TESORERA", "/finanzas"],
    ["ADMINISTRADORA", "/home"],
  ]) {
    it(`abre el área de ${rol}`, async () => {
      const navegar = vi.fn().mockResolvedValue(true);
      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: { login: async () => ({ rol }) } },
          { provide: Router, useValue: { navigateByUrl: navegar } },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { queryParamMap: { get: () => null } } },
          },
          { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
        ],
      });
      const pagina = TestBed.runInInjectionContext(() => new LoginComponent());
      pagina.loginForm.setValue({ username: "trabajador", password: "clave" });
      await pagina.login();
      expect(navegar).toHaveBeenCalledWith(destino);
    });
  }
});

import { TestBed } from "@angular/core/testing";
import { ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../core/auth/auth-service";
import { LoginComponent } from "./login";

describe("Destino inicial del doctor", () => {
  for (const destino of ["/doctores/documentos", "/admin", "/acceso-denegado", "/"]) {
    it(`abre agenda en lugar de recuperar ${destino}`, async () => {
      const navegar = vi.fn().mockResolvedValue(true);
      TestBed.configureTestingModule({providers: [
        {provide: AuthService, useValue: {login: async () => ({rol:"DOCTOR"})}},
        {provide: Router, useValue: {navigateByUrl: navegar}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParamMap: {get: () => destino}}}},
        {provide: ChangeDetectorRef, useValue: {markForCheck() {}}},
      ]});
      const pagina = TestBed.runInInjectionContext(() => new LoginComponent());
      pagina.loginForm.setValue({username:"doctor", password:"clave"});
      await pagina.login();
      expect(navegar).toHaveBeenCalledWith("/doctor");
    });
  }
});

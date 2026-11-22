import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth/auth-service";
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.estaAutenticado()
    ? inject(Router).parseUrl(
        auth.session()?.rol === "DOCTOR" ? "/doctor" : "/home",
      )
    : true;
};

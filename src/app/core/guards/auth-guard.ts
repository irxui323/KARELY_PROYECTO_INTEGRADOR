import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth/auth-service";
import { returnUrlSeguro } from "../utils/return-url";
export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(AuthService).estaAutenticado()) return true;
  const destino = returnUrlSeguro(state?.url);
  return inject(Router).parseUrl(
    destino ? "/login?returnUrl=" + encodeURIComponent(destino) : "/login",
  );
};

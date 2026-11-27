import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth/auth-service";
import { Permiso } from "../auth/auth.model";
import { authGuard } from "./auth-guard";
export const permisoGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  if (!auth.estaAutenticado()) return authGuard(route, state);
  if (auth.session()?.rol === "DOCTOR" && route.data["redireccionDoctor"])
    return inject(Router).parseUrl(route.data["redireccionDoctor"]);
  if (
    auth.session()?.rol === "ADMINISTRADORA" &&
    route.data["redireccionAdmin"]
  )
    return inject(Router).parseUrl(route.data["redireccionAdmin"]);
  const permiso = route.data["permiso"] as Permiso | undefined;
  return permiso && auth.tienePermiso(permiso)
    ? true
    : inject(Router).parseUrl("/acceso-denegado");
};

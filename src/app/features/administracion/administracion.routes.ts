import { Routes } from "@angular/router";
import { permisoGuard } from "../../core/guards/permiso-guard";
export const ADMINISTRACION_ROUTES: Routes = [
  {
    path: "",
    canActivate: [permisoGuard],
    data: { permiso: "USUARIOS_ADMINISTRAR" },
    loadComponent: () =>
      import("./pages/usuario-list/usuario-list").then((m) => m.UsuarioList),
  },
  {
    path: "usuarios/nuevo",
    canActivate: [permisoGuard],
    data: { permiso: "USUARIOS_ADMINISTRAR" },
    loadComponent: () =>
      import("./pages/usuario-form/usuario-form").then((m) => m.UsuarioForm),
  },
  {
    path: "parametros",
    canActivate: [permisoGuard],
    data: { permiso: "PARAMETROS_ADMINISTRAR" },
    loadComponent: () =>
      import("./pages/parametro-form/parametro-form").then(
        (m) => m.ParametroForm,
      ),
  },
  {
    path: "catalogos",
    canActivate: [permisoGuard],
    data: { permiso: "CATALOGOS_ADMINISTRAR" },
    loadComponent: () =>
      import("./pages/catalogo-form/catalogo-form").then((m) => m.CatalogoForm),
  },
  {
    path: "notificaciones",
    canActivate: [permisoGuard],
    data: { permiso: "NOTIFICACIONES_LEER" },
    loadComponent: () =>
      import("./pages/notificacion-list/notificacion-list").then(
        (m) => m.NotificacionList,
      ),
  },
  {
    path: "auditoria",
    canActivate: [permisoGuard],
    data: { permiso: "AUDITORIA_LEER" },
    loadComponent: () =>
      import("./pages/auditoria-list/auditoria-list").then(
        (m) => m.AuditoriaList,
      ),
  },
];

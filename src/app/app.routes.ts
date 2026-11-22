import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth-guard";
import { invitadoGuard } from "./core/guards/invitado-guard";
import { MainLayout } from "./layout/main-layout/main-layout";
export const routes: Routes = [
  {
    path: "login",
    canActivate: [invitadoGuard],
    loadChildren: () =>
      import("./features/auth/auth.routes").then((m) => m.AUTH_ROUTES),
  },
  {
    path: "recuperar-password",
    loadComponent: () =>
      import("./features/auth/pages/recuperar-password/recuperar-password").then(
        (m) => m.RecuperarPassword,
      ),
  },
  {
    path: "restablecer-password",
    loadComponent: () =>
      import("./features/auth/pages/restablecer-password/restablecer-password").then(
        (m) => m.RestablecerPassword,
      ),
  },
  {
    path: "",
    component: MainLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: "", pathMatch: "full", redirectTo: "home" },
      {
        path: "home",
        loadChildren: () =>
          import("./features/inicio/inicio.routes").then(
            (m) => m.INICIO_ROUTES,
          ),
      },
      {
        path: "pacientes",
        loadChildren: () =>
          import("./features/pacientes/pacientes.routes").then(
            (m) => m.PACIENTES_ROUTES,
          ),
      },
      {
        path: "doctores",
        loadChildren: () =>
          import("./features/doctores/doctores.routes").then(
            (m) => m.DOCTORES_ROUTES,
          ),
      },
      {
        path: "citas",
        loadChildren: () =>
          import("./features/citas/citas.routes").then((m) => m.CITAS_ROUTES),
      },
      {
        path: "doctor",
        loadChildren: () =>
          import("./features/atencion/atencion.routes").then(
            (m) => m.ATENCION_ROUTES,
          ),
      },
      {
        path: "finanzas",
        loadChildren: () =>
          import("./features/finanzas/finanzas.routes").then(
            (m) => m.FINANZAS_ROUTES,
          ),
      },
      {
        path: "admin",
        loadChildren: () =>
          import("./features/administracion/administracion.routes").then(
            (m) => m.ADMINISTRACION_ROUTES,
          ),
      },
      {
        path: "acceso-denegado",
        loadComponent: () =>
          import("./shared/pages/acceso-denegado/acceso-denegado").then(
            (m) => m.AccesoDenegado,
          ),
      },
      {
        path: "**",
        loadComponent: () =>
          import("./shared/pages/no-encontrado/no-encontrado").then(
            (m) => m.NoEncontrado,
          ),
      },
    ],
  },
];

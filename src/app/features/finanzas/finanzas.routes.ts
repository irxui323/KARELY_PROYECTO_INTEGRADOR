import { Routes } from "@angular/router";
import { permisoGuard } from "../../core/guards/permiso-guard";
export const FINANZAS_ROUTES: Routes = [
  {
    path: "",
    canActivate: [permisoGuard],
    data: { permiso: "FINANZAS_LEER" },
    loadComponent: () =>
      import("./pages/liquidacion-list/liquidacion-list").then(
        (m) => m.LiquidacionList,
      ),
  },
  {
    path: "liquidaciones/nueva",
    redirectTo: "pagos",
    pathMatch: "full",
  },
  {
    path: "pagos",
    canActivate: [permisoGuard],
    data: { permiso: "PAGOS_REGISTRAR" },
    loadComponent: () =>
      import("./pages/liquidacion-form/liquidacion-form").then(
        (m) => m.LiquidacionForm,
      ),
  },
  {
    path: "ingresos",
    canActivate: [permisoGuard],
    data: { permiso: "FINANZAS_LEER" },
    loadComponent: () =>
      import("./pages/ingreso-list/ingreso-list").then((m) => m.IngresoList),
  },
];

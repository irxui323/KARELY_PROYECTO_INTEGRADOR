import { Routes } from "@angular/router";
import { permisoGuard } from "../../core/guards/permiso-guard";
export const CITAS_ROUTES: Routes = [
  {
    path: "",
    canActivate: [permisoGuard],
    data: { permiso: "CITAS_LEER" },
    loadComponent: () =>
      import("./pages/cita-list/cita-list").then((m) => m.CitaList),
  },
  {
    path: "nueva",
    canActivate: [permisoGuard],
    data: { permiso: "CITAS_RESERVAR" },
    loadComponent: () =>
      import("./pages/cita-reserva/cita-reserva").then((m) => m.CitaReserva),
  },
  {
    path: "confirmar",
    canActivate: [permisoGuard],
    data: { permiso: "CITAS_CONFIRMAR" },
    loadComponent: () =>
      import("./pages/cita-confirmacion/cita-confirmacion").then(
        (m) => m.CitaConfirmacion,
      ),
  },
  {
    path: ":id/reprogramar",
    canActivate: [permisoGuard],
    data: { permiso: "CITAS_REPROGRAMAR" },
    loadComponent: () =>
      import("./pages/cita-reprogramacion/cita-reprogramacion").then(
        (m) => m.CitaReprogramacion,
      ),
  },
];

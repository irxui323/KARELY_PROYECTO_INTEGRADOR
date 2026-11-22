import { Routes } from "@angular/router";
import { permisoGuard } from "../../core/guards/permiso-guard";
export const ATENCION_ROUTES: Routes = [
  {
    path: "",
    canActivate: [permisoGuard],
    data: { permiso: "AGENDA_PROPIA" },
    loadComponent: () =>
      import("./pages/agenda-list/agenda-list").then((m) => m.AgendaList),
  },
  {
    path: "horarios",
    canActivate: [permisoGuard],
    data: {
      permiso: "HORARIOS_ESCRIBIR",
      redireccionAdmin: "/doctores/horarios",
    },
    loadComponent: () =>
      import("./pages/disponibilidad-form/disponibilidad-form").then(
        (m) => m.DisponibilidadForm,
      ),
  },
  {
    path: "consultas",
    canActivate: [permisoGuard],
    data: { permiso: "ATENCION_REGISTRAR" },
    loadComponent: () =>
      import("./pages/atencion-form/atencion-form").then((m) => m.AtencionForm),
  },
];

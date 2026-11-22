import { Routes } from "@angular/router";
import { permisoGuard } from "../../core/guards/permiso-guard";
export const PACIENTES_ROUTES: Routes = [
  {
    path: "",
    canActivate: [permisoGuard],
    data: { permiso: "PACIENTES_LEER" },
    loadComponent: () =>
      import("./pages/paciente-list/paciente-list").then((m) => m.PacienteList),
  },
  {
    path: "nuevo",
    canActivate: [permisoGuard],
    data: { permiso: "PACIENTES_ESCRIBIR" },
    loadComponent: () =>
      import("./pages/paciente-form/paciente-form").then((m) => m.PacienteForm),
  },
  {
    path: ":id/editar",
    canActivate: [permisoGuard],
    data: { permiso: "PACIENTES_ESCRIBIR" },
    loadComponent: () =>
      import("./pages/paciente-form/paciente-form").then((m) => m.PacienteForm),
  },
  {
    path: "admision",
    canActivate: [permisoGuard],
    data: { permiso: "ASISTENCIA_REGISTRAR" },
    loadComponent: () =>
      import("./pages/paciente-admision/paciente-admision").then(
        (m) => m.PacienteAdmision,
      ),
  },
];

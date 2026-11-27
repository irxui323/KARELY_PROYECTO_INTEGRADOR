import { Routes } from "@angular/router";
import { permisoGuard } from "../../core/guards/permiso-guard";
export const DOCTORES_ROUTES: Routes = [
  {
    path: "acceso",
    canActivate: [permisoGuard],
    data: { permiso: "DOCTORES_ESCRIBIR" },
    loadComponent: () =>
      import("./pages/doctor-acceso/doctor-acceso").then((m) => m.DoctorAcceso),
  },
  {
    path: "",
    pathMatch: "full",
    canActivate: [permisoGuard],
    data: { permiso: "DOCTORES_LEER", redireccionDoctor: "/doctor" },
    loadComponent: () =>
      import("./pages/doctor-list/doctor-list").then((m) => m.DoctorList),
  },
  {
    path: "nuevo",
    canActivate: [permisoGuard],
    data: { permiso: "DOCTORES_ESCRIBIR" },
    loadComponent: () =>
      import("./pages/doctor-form/doctor-form").then((m) => m.DoctorForm),
  },
  {
    path: ":id/editar",
    canActivate: [permisoGuard],
    data: { permiso: "DOCTORES_ESCRIBIR" },
    loadComponent: () =>
      import("./pages/doctor-form/doctor-form").then((m) => m.DoctorForm),
  },
  {
    path: "especialidades",
    canActivate: [permisoGuard],
    data: { permiso: "ESPECIALIDADES_ASIGNAR" },
    loadComponent: () =>
      import("./pages/doctor-especialidades/doctor-especialidades").then(
        (m) => m.DoctorEspecialidades,
      ),
  },
  {
    path: "horarios",
    canActivate: [permisoGuard],
    data: { permiso: "HORARIOS_LEER", redireccionDoctor: "/doctor/horarios" },
    loadComponent: () =>
      import("./pages/doctor-horarios/doctor-horarios").then(
        (m) => m.DoctorHorarios,
      ),
  },
  {
    path: "documentos",
    canActivate: [permisoGuard],
    data: { permiso: "DOCUMENTOS_ADMINISTRAR" },
    loadComponent: () =>
      import("./pages/doctor-documentos/doctor-documentos").then(
        (m) => m.DoctorDocumentos,
      ),
  },
];

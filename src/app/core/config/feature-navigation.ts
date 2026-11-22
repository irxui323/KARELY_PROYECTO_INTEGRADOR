import { Permiso } from "../auth/auth.model";
export interface FeatureLink {
  path: string;
  label: string;
  permiso: Permiso;
}
export const FEATURE_NAVIGATION: Record<string, FeatureLink[]> = {
  doctores: [
    {
      path: "/doctores/acceso",
      label: "Acceso médico",
      permiso: "DOCTORES_ESCRIBIR",
    },
    {
      path: "/doctores",
      label: "Listado",
      permiso: "DOCTORES_LEER",
    },
    {
      path: "/doctores/nuevo",
      label: "Registrar",
      permiso: "DOCTORES_ESCRIBIR",
    },
    {
      path: "/doctores/especialidades",
      label: "Especialidades",
      permiso: "ESPECIALIDADES_ASIGNAR",
    },
    {
      path: "/doctores/horarios",
      label: "Horarios",
      permiso: "HORARIOS_LEER",
    },
    {
      path: "/doctores/documentos",
      label: "Documentación",
      permiso: "DOCUMENTOS_ADMINISTRAR",
    },
  ],
  pacientes: [
    {
      path: "/pacientes",
      label: "Listado",
      permiso: "PACIENTES_LEER",
    },
    {
      path: "/pacientes/nuevo",
      label: "Registrar",
      permiso: "PACIENTES_ESCRIBIR",
    },
    {
      path: "/pacientes/admision",
      label: "Admisión",
      permiso: "ASISTENCIA_REGISTRAR",
    },
  ],
  citas: [
    {
      path: "/citas",
      label: "Citas",
      permiso: "CITAS_LEER",
    },
    {
      path: "/citas/nueva",
      label: "Reservar",
      permiso: "CITAS_RESERVAR",
    },
    {
      path: "/citas/confirmar",
      label: "Confirmar pago",
      permiso: "CITAS_CONFIRMAR",
    },
  ],
  atencion: [
    {
      path: "/doctor",
      label: "Mi agenda",
      permiso: "AGENDA_PROPIA",
    },
    {
      path: "/doctor/horarios",
      label: "Horarios",
      permiso: "HORARIOS_ESCRIBIR",
    },
    {
      path: "/doctor/consultas",
      label: "Atención",
      permiso: "ATENCION_REGISTRAR",
    },
  ],
  finanzas: [
    {
      path: "/finanzas",
      label: "Liquidaciones",
      permiso: "FINANZAS_LEER",
    },
    {
      path: "/finanzas/pagos",
      label: "Registrar pago",
      permiso: "PAGOS_REGISTRAR",
    },
    {
      path: "/finanzas/ingresos",
      label: "Ingresos",
      permiso: "FINANZAS_LEER",
    },
  ],
  administracion: [
    {
      path: "/admin",
      label: "Usuarios",
      permiso: "USUARIOS_ADMINISTRAR",
    },
    {
      path: "/admin/usuarios/nuevo",
      label: "Nuevo usuario",
      permiso: "USUARIOS_ADMINISTRAR",
    },
    {
      path: "/admin/parametros",
      label: "Parámetros",
      permiso: "PARAMETROS_ADMINISTRAR",
    },
    {
      path: "/admin/catalogos",
      label: "Catálogos",
      permiso: "CATALOGOS_ADMINISTRAR",
    },
    {
      path: "/admin/notificaciones",
      label: "Notificaciones",
      permiso: "NOTIFICACIONES_LEER",
    },
    {
      path: "/admin/auditoria",
      label: "Auditoría",
      permiso: "AUDITORIA_LEER",
    },
  ],
};

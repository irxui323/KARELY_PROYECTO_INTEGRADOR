import { Permiso, Rol } from "../auth/auth.model";
import { PERMISOS_POR_ROL } from "./permisos";
export interface MenuItem {
  path: string;
  label: string;
  icon: string;
  roles: Rol[];
  permiso?: Permiso;
}
function item(
  path: string,
  label: string,
  icon: string,
  permiso?: Permiso,
): MenuItem {
  return {
    path,
    label,
    icon,
    permiso,
    roles: (Object.keys(PERMISOS_POR_ROL) as Rol[]).filter(
      (rol) => !permiso || PERMISOS_POR_ROL[rol].includes(permiso),
    ),
  };
}
export const MENU: MenuItem[] = [
  item("/home", "Inicio", "ICON_MENU.png"),
  item("/pacientes", "Pacientes", "ICON_PACIENTES.png", "PACIENTES_LEER"),
  item("/doctores", "Doctores", "ICON_DOCTORES.png", "DOCTORES_LEER"),
  item("/citas", "Citas Médicas", "ICON_CITAS.png", "CITAS_LEER"),
  item("/finanzas", "Finanzas", "ICON_FINANZAS.png", "FINANZAS_LEER"),
  item("/doctor", "Doctor / Consultas", "ICON_DOCTORES.png", "AGENDA_PROPIA"),
  item(
    "/admin",
    "Administración",
    "ICON_GESTIONAR_DOCTORES.png",
    "USUARIOS_ADMINISTRAR",
  ),
];

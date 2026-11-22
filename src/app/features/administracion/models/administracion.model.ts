export interface Usuario {
  idUsuario: number;
  username: string;
  correo: string;
  rol: string;
  estado: string;
}
export interface RolCatalogo {
  estado?: string;
  idRol: number;
  nombre: string;
}
export interface Parametro {
  idParametro: number;
  nombre: string;
  valor: string;
  descripcion?: string;
}
export interface Auditoria {
  idAuditoria: number;
  fechaOperacion: string;
  idUsuario: number;
  tablaAfectada: string;
  accion: string;
  detalle: string;
}
export interface Notificacion {
  idNotificacion: number;
  tipo: string;
  canal: string;
  codigoEvento: string;
  estado: string;
}
export interface AdministracionRequest {
  idUsuario?: number | null;
  idRol?: number | null;
  username?: string | null;
  correo?: string | null;
  password?: string | null;
  nombre?: string | null;
  precioConsulta?: number | null;
  ubicacion?: string | null;
  horaInicio?: string | null;
  horaFin?: string | null;
  estado?: string | null;
  valor?: string | null;
}
export type AdministracionAccion =
  | "especialidad-crear"
  | "consultorio-crear"
  | "franja-crear"
  | "usuario-rol"
  | "usuario-estado"
  | "parametro-cambiar";

export interface AccesoUsuario { idUsuario: number; username: string; correo: string; password: string; }

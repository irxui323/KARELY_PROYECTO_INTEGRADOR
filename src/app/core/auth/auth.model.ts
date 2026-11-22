export type Rol =
  "ADMINISTRADORA" | "RECEPCIONISTA" | "DOCTOR" | "CAJERA" | "TESORERA";
export type Permiso =
  | "PACIENTES_LEER"
  | "PACIENTES_ESCRIBIR"
  | "ASISTENCIA_REGISTRAR"
  | "DOCTORES_LEER"
  | "DOCTORES_ESCRIBIR"
  | "DOCUMENTOS_ADMINISTRAR"
  | "ESPECIALIDADES_ASIGNAR"
  | "HORARIOS_LEER"
  | "HORARIOS_ESCRIBIR"
  | "CITAS_LEER"
  | "CITAS_RESERVAR"
  | "CITAS_CONFIRMAR"
  | "CITAS_REPROGRAMAR"
  | "AGENDA_PROPIA"
  | "ATENCION_REGISTRAR"
  | "FINANZAS_LEER"
  | "PAGOS_REGISTRAR"
  | "USUARIOS_ADMINISTRAR"
  | "CATALOGOS_ADMINISTRAR"
  | "PARAMETROS_ADMINISTRAR"
  | "AUDITORIA_LEER"
  | "NOTIFICACIONES_LEER";
export interface LoginResponse {
  token: string;
  usuario: string;
  rol: Rol;
  idUsuario: number;
}
export interface Session extends LoginResponse {
  expiraEn: number;
}
export interface LoginRequest {
  username: string;
  password: string;
}

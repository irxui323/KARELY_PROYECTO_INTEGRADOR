export interface Doctor {
  idDoctor: number;
  idUsuario?: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  correo?: string;
  estado: string;
  estadoDocumentacion: string;
}
export interface DocumentoDoctor {
  idDocumento: number;
  idDoctor: number;
  tipoDocumento: string;
  nombreArchivo: string;
  tipoMime: string;
  estado: string;
  fechaValidacion?: string;
  motivoRechazo?: string;
}
export interface Disponibilidad {
  idDisponibilidad: number;
  idDoctor: number;
  idFranja: number;
  nombreDoctor: string;
  fechaTurno: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  idEspecialidad?: number | null;
  nombreEspecialidad?: string | null;
}
export interface DoctorRequest {
  idDoctor?: number | null;
  idUsuario?: number | null;
  idEspecialidad?: number | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  telefono?: string | null;
  correo?: string | null;
  estado?: string | null;
  fecha?: string | null;
  idFranja?: number | null;
}
export type DoctorAccion =
  | "doctor-crear"
  | "doctor-editar"
  | "doctor-especialidad"
  | "disponibilidad-registrar";

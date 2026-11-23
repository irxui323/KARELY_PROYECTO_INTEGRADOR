export interface Cita {
  idEspecialidad?: number;
  idConsultorio?: number;
  reprogramaciones?: number;
  idCita: number;
  idPaciente: number;
  idDoctor: number;
  fechaCita: string;
  horaInicio: string;
  horaFin: string;
  nombrePaciente: string;
  nombreDoctor: string;
  estadoCita: string;
  especialidad?: string;
  nombreEspecialidad?: string;
  consultorio?: string;
  nombreConsultorio?: string;
  montoTotal?: number;
}
export interface Reserva {
  idPreReserva: number;
  monto: number;
  fechaExpiracion: string;
  estado?: string;
}
export interface CitaRequest {
  idCita?: number | null;
  idPaciente?: number | null;
  idDoctor?: number | null;
  idEspecialidad?: number | null;
  idConsultorio?: number | null;
  idFranja?: number | null;
  fecha?: string | null;
  idPreReserva?: number | null;
  metodoPago?: string | null;
  fechaNueva?: string | null;
  idFranjaNueva?: number | null;
  idConsultorioNuevo?: number | null;
  motivo?: string | null;
  aceptacionPaciente?: string | null;
}
export type CitaAccion =
  | "prereserva-crear"
  | "cita-confirmar"
  | "cita-reprogramar"
  | "asistencia-registrar";
export interface TurnoDisponible {
  idDoctor: number;
  idFranja: number;
  horaInicio: string;
  horaFin: string;
}
export interface DoctorDisponible {
  idDoctor: number;
  nombre: string;
  turnos: TurnoDisponible[];
}
export interface DisponibilidadDia {
  fecha: string;
  idDoctor: number;
  total: number;
}

export interface Atencion {
  idReceta?: number | null;
  indicacionesReceta?: string | null;
  idAtencion: number;
  idCita: number;
  estado: string;
  diagnostico?: string;
  observaciones?: string;
}
export interface Recibo {
  idRecibo: number;
  idCita: number;
  numeroRecibo: string;
  monto: number;
  fechaEmision: string;
  correo?: string | null;
  fechaEntrega?: string | null;
  medioEntrega?: string | null;
}

export interface MedicamentoDetalle {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  observaciones?: string | null;
}

export interface DetalleAtencion {
  idCita: number;
  paciente: string;
  doctor: string;
  especialidad: string;
  fechaCita: string;
  horaInicio: string;
  estadoCita: string;
  diagnostico?: string | null;
  observaciones?: string | null;
  indicacionesReceta?: string | null;
  medicamentos: MedicamentoDetalle[];
  numeroRecibo?: string | null;
  medioEntrega?: string | null;
}
export interface AtencionRequest {
  idCita?: number | null;
  idReceta?: number | null;
  medioEntrega?: string | null;
  diagnostico?: string | null;
  observaciones?: string | null;
  medicamento?: string | null;
  dosis?: string | null;
  frecuencia?: string | null;
  duracion?: string | null;
  observacionesMedicamento?: string | null;
  indicaciones?: string | null;
  numeroRecibo?: string | null;
}
export type AtencionAccion =
  | "atencion-iniciar"
  | "diagnostico-registrar"
  | "receta-crear"
  | "medicamento-agregar"
  | "recibo-emitir"
  | "recibo-entregar"
  | "atencion-cerrar";

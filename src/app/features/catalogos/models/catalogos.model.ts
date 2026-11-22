export interface Especialidad {
  idEspecialidad: number;
  nombre: string;
  precioConsulta: number;
  estado: string;
}
export interface Franja {
  idFranja: number;
  horaInicio: string;
  horaFin: string;
  estado: string;
}
export interface Consultorio {
  idConsultorio: number;
  nombre: string;
  ubicacion?: string;
  estado: string;
}

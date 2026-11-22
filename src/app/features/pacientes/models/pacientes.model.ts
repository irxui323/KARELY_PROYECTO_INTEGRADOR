export interface Paciente {
  idPaciente: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  estado: string;
  fechaNacimiento?: string;
}
export interface PacienteRequest {
  idPaciente?: number | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
  estado?: string | null;
  fechaNacimiento?: string | null;
}

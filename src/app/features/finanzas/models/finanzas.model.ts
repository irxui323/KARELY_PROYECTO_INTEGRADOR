export interface Liquidacion {
  idLiquidacion: number;
  idDoctor: number;
  nombreDoctor: string;
  periodoInicio: string;
  periodoFin: string;
  montoPagado: number;
  metodoPago: string;
  numeroOperacion: string;
  numeroBoleta: string;
  fechaPago: string;
  saldoPendiente: number;
}

export interface Ingreso {
  idCita: number;
  idDoctor: number;
  fechaCita: string;
  concepto: string;
  montoIngreso: number;
}

export interface SaldoDoctor {
  idDoctor: number;
  fechaCorte: string;
  saldoPendiente: number;
}

export interface FinanzasRequest {
  idDoctor: number;
  fechaInicio: string;
  fechaFin: string;
  monto: number;
  metodoPago: string;
  numeroOperacion: string;
  numeroBoleta: string;
}

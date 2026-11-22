import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { OperationResponse } from "../../../core/models/operation-response";
import {
  FinanzasRequest,
  Ingreso,
  Liquidacion,
  SaldoDoctor,
} from "../models/finanzas.model";
@Injectable({ providedIn: "root" })
export class FinanzasService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  liquidaciones() {
    return this.http.get<Liquidacion[]>(this.url + "/liquidaciones");
  }
  ingresos() {
    return this.http.get<Ingreso[]>(this.url + "/reportes/ingresos");
  }
  saldo(idDoctor: number, fechaCorte: string) {
    return this.http.get<SaldoDoctor>(this.url + "/liquidaciones/saldo", {
      params: { idDoctor, fechaCorte },
    });
  }

  pagar(data: FinanzasRequest) {
    return this.http.post<OperationResponse>(this.url + "/liquidaciones", data);
  }
}

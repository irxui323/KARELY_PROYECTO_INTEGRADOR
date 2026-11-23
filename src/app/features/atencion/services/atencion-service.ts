import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { OperationResponse } from "../../../core/models/operation-response";
import {
  Atencion,
  AtencionAccion,
  AtencionRequest,
  Recibo,
} from "../models/atencion.model";
@Injectable({ providedIn: "root" })
export class AtencionService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  listar() {
    return this.http.get<Atencion[]>(this.url + "/atenciones");
  }
  recibo(idCita: number) {
    return this.http.get<Recibo | null>(
      `${this.url}/atenciones/${idCita}/recibo`,
    );
  }
  descargarRecibo(idCita: number) {
    return this.http.get(`${this.url}/atenciones/${idCita}/recibo/pdf`, {
      responseType: "blob",
    });
  }
  ejecutar(action: AtencionAccion, data: AtencionRequest) {
    const recurso = this.url + "/atenciones";
    const {
      idCita,
      idReceta,
      diagnostico,
      observaciones,
      indicaciones,
      medicamento,
      dosis,
      frecuencia,
      duracion,
      medioEntrega,
    } = data;
    const detalle = recurso + "/" + idCita;
    switch (action) {
      case "atencion-iniciar":
        return this.http.post<OperationResponse>(recurso + "/iniciar", {
          idCita,
        });
      case "diagnostico-registrar":
        return this.http.post<OperationResponse>(detalle + "/diagnostico", {
          diagnostico,
          observaciones,
        });
      case "receta-crear":
        return this.http.post<OperationResponse>(detalle + "/receta", {
          indicaciones,
        });
      case "medicamento-agregar":
        return this.http.post<OperationResponse>(
          recurso + "/recetas/" + idReceta + "/medicamentos",
          {
            medicamento,
            dosis,
            frecuencia,
            duracion,
            observaciones,
          },
        );
      case "recibo-emitir":
        return this.http.post<OperationResponse>(detalle + "/recibo", {});
      case "recibo-entregar":
        return this.http.post<OperationResponse>(detalle + "/entrega", {
          medioEntrega,
        });
      case "atencion-cerrar":
        return this.http.post<OperationResponse>(detalle + "/cerrar", null);
    }
  }
}

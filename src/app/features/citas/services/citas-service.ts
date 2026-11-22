import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { OperationResponse } from "../../../core/models/operation-response";
import { Cita, CitaAccion, CitaRequest, Reserva } from "../models/citas.model";
import { DoctorDisponible, DisponibilidadDia } from "../models/citas.model";
@Injectable({ providedIn: "root" })
export class CitaService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  disponibilidadMes(
    idEspecialidad: number,
    mes: string,
    idConsultorio?: number | null,
  ) {
    let params = new HttpParams()
      .set("idEspecialidad", idEspecialidad)
      .set("mes", mes + "-01");
    if (idConsultorio) params = params.set("idConsultorio", idConsultorio);
    return this.http.get<DisponibilidadDia[]>(
      this.url + "/citas/disponibilidad-mes",
      { params },
    );
  }
  disponibilidad(
    idEspecialidad: number,
    fecha?: string | null,
    idConsultorio?: number | null,
  ) {
    let params = new HttpParams().set("idEspecialidad", idEspecialidad);
    if (fecha) params = params.set("fecha", fecha);
    if (idConsultorio) params = params.set("idConsultorio", idConsultorio);
    return this.http.get<DoctorDisponible[]>(
      this.url + "/citas/disponibilidad",
      { params },
    );
  }
  listar() {
    return this.http.get<Cita[]>(this.url + "/citas");
  }
  reservas() {
    return this.http.get<Reserva[]>(this.url + "/citas/reservas");
  }
  ejecutar(action: CitaAccion, data: CitaRequest) {
    const recurso = this.url + "/citas";
    const {
      idCita,
      idPaciente,
      idDoctor,
      idEspecialidad,
      idConsultorio,
      idFranja,
      fecha,
      idPreReserva,
      metodoPago,
      fechaNueva,
      idFranjaNueva,
      idConsultorioNuevo,
      motivo,
      aceptacionPaciente,
    } = data;
    const detalle = recurso + "/" + idCita;
    switch (action) {
      case "prereserva-crear":
        return this.http.post<OperationResponse>(recurso + "/reservas", {
          idPaciente,
          idDoctor,
          idEspecialidad,
          idConsultorio,
          idFranja,
          fecha,
        });
      case "cita-confirmar":
        return this.http.post<OperationResponse>(recurso + "/confirmar", {
          idPreReserva,
          metodoPago,
        });
      case "cita-reprogramar":
        return this.http.post<OperationResponse>(detalle + "/reprogramar", {
          fechaNueva,
          idFranjaNueva,
          idConsultorioNuevo,
          motivo,
          aceptacionPaciente,
        });
      case "asistencia-registrar":
        return this.http.post<OperationResponse>(detalle + "/asistencia", null);
    }
  }
}

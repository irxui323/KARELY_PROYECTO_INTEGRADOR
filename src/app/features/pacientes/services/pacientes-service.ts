import { PaginaResponse } from "../../../core/models/pagina-response";
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { OperationResponse } from "../../../core/models/operation-response";
import { Paciente, PacienteRequest } from "../models/pacientes.model";
@Injectable({ providedIn: "root" })
export class PacienteService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  listar() {
    return this.http.get<Paciente[]>(this.url + "/pacientes");
  }
  guardar({ idPaciente, ...data }: PacienteRequest) {
    const recurso = this.url + "/pacientes";
    return idPaciente
      ? this.http.put<OperationResponse>(recurso + "/" + idPaciente, data)
      : this.http.post<OperationResponse>(recurso, data);
  }

  listarPagina(pagina = 0, tamanio = 10, filtro = "") {
    return this.http.get<PaginaResponse<Paciente>>(this.url + "/pacientes", {
      params: { pagina, tamanio, filtro },
    });
  }
}

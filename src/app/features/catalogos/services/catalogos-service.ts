import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../../../environments/environment";
import {
  ConsultaDni,
  Consultorio,
  Especialidad,
  Franja,
} from "../models/catalogos.model";
@Injectable({ providedIn: "root" })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  especialidades() {
    return this.http.get<Especialidad[]>(this.url + "/especialidades");
  }
  franjas() {
    return this.http.get<Franja[]>(this.url + "/franjas");
  }
  consultorios() {
    return this.http.get<Consultorio[]>(this.url + "/consultorios");
  }
  consultarDni(dni: string) {
    return this.http.get<ConsultaDni>(this.url + "/catalogos/dni/" + dni);
  }
}

import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { OperationResponse } from "../../../core/models/operation-response";
import { Especialidad } from "../../catalogos/models/catalogos.model";
import {
  Disponibilidad,
  Doctor,
  DoctorAccion,
  DoctorRequest,
  DocumentoDoctor,
} from "../models/doctores.model";
@Injectable({ providedIn: "root" })
export class DoctorService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  listar() {
    return this.http.get<Doctor[]>(this.url + "/doctores");
  }
  especialidades(idDoctor: number) {
    return this.http.get<Especialidad[]>(
      this.url + "/doctores/" + idDoctor + "/especialidades",
    );
  }
  quitarEspecialidad(idDoctor: number, idEspecialidad: number) {
    return this.http.delete<OperationResponse>(
      this.url + "/doctores/" + idDoctor + "/especialidades/" + idEspecialidad,
    );
  }
  disponibilidades() {
    return this.http.get<Disponibilidad[]>(
      this.url + "/doctores/disponibilidades",
    );
  }
  ejecutar(action: DoctorAccion, data: DoctorRequest) {
    const recurso = this.url + "/doctores";
    const { idDoctor, idUsuario, idEspecialidad, fecha, idFranja, ...doctor } =
      data;
    const detalle = recurso + "/" + idDoctor;
    switch (action) {
      case "doctor-crear":
        return this.http.post<OperationResponse>(recurso, doctor);
      case "doctor-editar":
        return this.http.put<OperationResponse>(detalle, doctor);
      case "doctor-especialidad":
        return this.http.post<OperationResponse>(detalle + "/especialidades", {
          idEspecialidad,
        });
      case "disponibilidad-registrar":
        return this.http.post<OperationResponse>(
          detalle + "/disponibilidades",
          { fecha, idFranja, idEspecialidad },
        );
    }
  }
  validarDocumentacion(
    id: number,
    body: {
      dniConforme: boolean;
      tituloConforme: boolean;
      idDni: number;
      idTitulo: number;
    },
  ) {
    return this.http.post<OperationResponse>(
      this.url + "/doctores/" + id + "/validar-documentacion",
      body,
    );
  }
  rechazarDocumento(id: number, idDocumento: number, motivo: string) {
    return this.http.post<OperationResponse>(
      this.url + "/doctores/" + id + "/documentos/" + idDocumento + "/rechazar",
      { motivo },
    );
  }
  crearAcceso(id: number, username: string) {
    return this.http.post<{
      username: string;
      correo: string;
      passwordTemporal: string;
    }>(this.url + "/doctores/" + id + "/acceso", { username });
  }
  descargarDocumento(id: number, idDocumento: number) {
    return this.http.get(this.url + "/doctores/documentos/" + idDocumento, {
      responseType: "blob",
    });
  }
  documentos(id: number) {
    return this.http.get<DocumentoDoctor[]>(
      this.url + "/doctores/" + id + "/documentos",
    );
  }
  subir(id: number, tipo: string, archivo: File) {
    const form = new FormData();
    form.append("tipo", tipo);
    form.append("archivo", archivo);
    return this.http.post<OperationResponse>(
      this.url + "/doctores/" + id + "/documentos",
      form,
    );
  }
}

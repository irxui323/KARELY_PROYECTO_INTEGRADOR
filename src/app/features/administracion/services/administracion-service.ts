import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { OperationResponse } from "../../../core/models/operation-response";
import {
  AccesoUsuario,
  AdministracionAccion,
  AdministracionRequest,
  Auditoria,
  Notificacion,
  Parametro,
  RolCatalogo,
  Usuario,
} from "../models/administracion.model";
@Injectable({ providedIn: "root" })
export class AdministracionService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  usuarios() {
    return this.http.get<Usuario[]>(this.url + "/usuarios");
  }
  roles() {
    return this.http.get<RolCatalogo[]>(this.url + "/usuarios/roles");
  }
  parametros() {
    return this.http.get<Parametro[]>(this.url + "/parametros");
  }
  auditoria() {
    return this.http.get<Auditoria[]>(this.url + "/auditoria");
  }
  notificaciones() {
    return this.http.get<Notificacion[]>(this.url + "/notificaciones");
  }
  ejecutar(action: AdministracionAccion, data: AdministracionRequest) {
    const {
      idUsuario,
      idRol,
      nombre,
      precioConsulta,
      ubicacion,
      horaInicio,
      horaFin,
      estado,
      valor,
    } = data;
    switch (action) {
      case "especialidad-crear":
        return this.http.post<OperationResponse>(this.url + "/especialidades", {
          nombre,
          precioConsulta,
          estado,
        });
      case "consultorio-crear":
        return this.http.post<OperationResponse>(this.url + "/consultorios", {
          nombre,
          ubicacion,
          estado,
        });
      case "franja-crear":
        return this.http.post<OperationResponse>(this.url + "/franjas", {
          horaInicio,
          horaFin,
          estado,
        });
      case "usuario-rol":
        return this.http.patch<OperationResponse>(
          this.url + "/usuarios/" + idUsuario + "/rol",
          { idRol },
        );
      case "usuario-estado":
        return this.http.patch<OperationResponse>(
          this.url + "/usuarios/" + idUsuario + "/estado",
          { estado },
        );
      case "parametro-cambiar":
        return this.http.put<OperationResponse>(
          this.url + "/parametros/" + encodeURIComponent(nombre ?? ""),
          { valor },
        );
    }
  }
  crearUsuario(data: AdministracionRequest) {
    return this.http.post<AccesoUsuario>(this.url + "/usuarios", {idRol:data.idRol, username:data.username, correo:data.correo});
  }
}

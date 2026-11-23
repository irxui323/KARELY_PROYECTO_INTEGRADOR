var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from '../../../../environments/environment.mjs';
let DoctorService = class DoctorService {
    http = inject(HttpClient);
    url = environment.apiUrl;
    listar() {
        return this.http.get(this.url + "/doctores");
    }
    especialidades(idDoctor) {
        return this.http.get(this.url + "/doctores/" + idDoctor + "/especialidades");
    }
    quitarEspecialidad(idDoctor, idEspecialidad) {
        return this.http.delete(this.url + "/doctores/" + idDoctor + "/especialidades/" + idEspecialidad);
    }
    disponibilidades() {
        return this.http.get(this.url + "/doctores/disponibilidades");
    }
    ejecutar(action, data) {
        const recurso = this.url + "/doctores";
        const { idDoctor, idUsuario, idEspecialidad, fecha, idFranja, ...doctor } = data;
        const detalle = recurso + "/" + idDoctor;
        switch (action) {
            case "doctor-crear":
                return this.http.post(recurso, doctor);
            case "doctor-editar":
                return this.http.put(detalle, doctor);
            case "doctor-especialidad":
                return this.http.post(detalle + "/especialidades", {
                    idEspecialidad,
                });
            case "disponibilidad-registrar":
                return this.http.post(detalle + "/disponibilidades", { fecha, idFranja, idEspecialidad });
        }
    }
    validarDocumentacion(id, body) {
        return this.http.post(this.url + "/doctores/" + id + "/validar-documentacion", body);
    }
    rechazarDocumento(id, idDocumento, motivo) {
        return this.http.post(this.url + "/doctores/" + id + "/documentos/" + idDocumento + "/rechazar", { motivo });
    }
    crearAcceso(id, username) {
        return this.http.post(this.url + "/doctores/" + id + "/acceso", { username });
    }
    descargarDocumento(id, idDocumento) {
        return this.http.get(this.url + "/doctores/documentos/" + idDocumento, {
            responseType: "blob",
        });
    }
    documentos(id) {
        return this.http.get(this.url + "/doctores/" + id + "/documentos");
    }
    subir(id, tipo, archivo) {
        const form = new FormData();
        form.append("tipo", tipo);
        form.append("archivo", archivo);
        return this.http.post(this.url + "/doctores/" + id + "/documentos", form);
    }
    listarPagina(pagina = 0, tamanio = 10, filtro = "") {
        return this.http.get(this.url + "/doctores", {
            params: { pagina, tamanio, filtro },
        });
    }
    disponibilidadesPagina(pagina = 0, tamanio = 10, filtro = "") {
        return this.http.get(this.url + "/doctores/disponibilidades", {
            params: { pagina, tamanio, filtro },
        });
    }
};
DoctorService = __decorate([
    Injectable({ providedIn: "root" })
], DoctorService);
export { DoctorService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdG9yZXMtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL2ZlYXR1cmVzL2RvY3RvcmVzL3NlcnZpY2VzLyIsInNvdXJjZXMiOlsiZG9jdG9yZXMtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBVzVELElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWE7SUFDUCxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFCLEdBQUcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO0lBQzFDLE1BQU07UUFDSixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLElBQUksQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUNELGNBQWMsQ0FBQyxRQUFnQjtRQUM3QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUNsQixJQUFJLENBQUMsR0FBRyxHQUFHLFlBQVksR0FBRyxRQUFRLEdBQUcsaUJBQWlCLENBQ3ZELENBQUM7SUFDSixDQUFDO0lBQ0Qsa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxjQUFzQjtRQUN6RCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUNyQixJQUFJLENBQUMsR0FBRyxHQUFHLFlBQVksR0FBRyxRQUFRLEdBQUcsa0JBQWtCLEdBQUcsY0FBYyxDQUN6RSxDQUFDO0lBQ0osQ0FBQztJQUNELGdCQUFnQjtRQUNkLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQ2xCLElBQUks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Q0FDTCxDQUFDO0lBQ0osQ0FBQztJQUVELFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxFQUFFLEVBQUUsTUFBTSxHQUFHLEVBQUU7UUFDaEQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBeUIsSUFBSSxDQUFDLEdBQUcsR0FBRyxXQUFXLEVBQUU7WUFDbkUsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUU7U0FDcEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHNCQUFzQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxNQUFNLEdBQUcsRUFBRTtRQUMxRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUNsQixJQUFJLENBQUMsR0FBRyxHQUFHLDRCQUE0QixFQUN2QztZQUNFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFO1NBQ3BDLENBQ0YsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFBO0FBdkdZLGFBQWE7SUFEekIsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDO0dBQ3RCLGFBQWEsQ0F1R3pCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGFnaW5hUmVzcG9uc2UgfSBmcm9tIFwiLi4vLi4vLi4vY29yZS9tb2RlbHMvcGFnaW5hLXJlc3BvbnNlXCI7XG5pbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3RhYmxlLCBpbmplY3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgZW52aXJvbm1lbnQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vZW52aXJvbm1lbnRzL2Vudmlyb25tZW50XCI7XG5pbXBvcnQgeyBPcGVyYXRpb25SZXNwb25zZSB9IGZyb20gXCIuLi8uLi8uLi9jb3JlL21vZGVscy9vcGVyYXRpb24tcmVzcG9uc2VcIjtcbmltcG9ydCB7IEVzcGVjaWFsaWRhZCB9IGZyb20gXCIuLi8uLi9jYXRhbG9nb3MvbW9kZWxzL2NhdGFsb2dvcy5tb2RlbFwiO1xuaW1wb3J0IHtcbiAgRGlzcG9uaWJpbGlkYWQsXG4gIERvY3RvcixcbiAgRG9jdG9yQWNjaW9uLFxuICBEb2N0b3JSZXF1ZXN0LFxuICBEb2N1bWVudG9Eb2N0b3IsXG59IGZyb20gXCIuLi9tb2RlbHMvZG9jdG9yZXMubW9kZWxcIjtcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogXCJyb290XCIgfSlcbmV4cG9ydCBjbGFzcyBEb2N0b3JTZXJ2aWNlIHtcbiAgcHJpdmF0ZSByZWFkb25seSBodHRwID0gaW5qZWN0KEh0dHBDbGllbnQpO1xuICBwcml2YXRlIHJlYWRvbmx5IHVybCA9IGVudmlyb25tZW50LmFwaVVybDtcbiAgbGlzdGFyKCkge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PERvY3RvcltdPih0aGlzLnVybCArIFwiL2RvY3RvcmVzXCIpO1xuICB9XG4gIGVzcGVjaWFsaWRhZGVzKGlkRG9jdG9yOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldDxFc3BlY2lhbGlkYWRbXT4oXG4gICAgICB0aGlzLnVybCArIFwiL2RvY3RvcmVzL1wiICsgaWREb2N0b3IgKyBcIi9lc3BlY2lhbGlkYWRlc1wiLFxuICAgICk7XG4gIH1cbiAgcXVpdGFyRXNwZWNpYWxpZGFkKGlkRG9jdG9yOiBudW1iZXIsIGlkRXNwZWNpYWxpZGFkOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZTxPcGVyYXRpb25SZXNwb25zZT4oXG4gICAgICB0aGlzLnVybCArIFwiL2RvY3RvcmVzL1wiICsgaWREb2N0b3IgKyBcIi9lc3BlY2lhbGlkYWRlcy9cIiArIGlkRXNwZWNpYWxpZGFkLFxuICAgICk7XG4gIH1cbiAgZGlzcG9uaWJpbGlkYWRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldDxEaXNwb25pYmlsaWRhZFtdPihcbiAgICAgIHRoaXMudXJsICsgXCIvZG9jdG9yZXMvZGlzcG9uaWJpbGlkYWRlc1wiLFxuICAgICk7XG4gIH1cbiAgZWplY3V0YXIoYWN0aW9uOiBEb2N0b3JBY2Npb24sIGRhdGE6IERvY3RvclJlcXVlc3QpIHtcbiAgICBjb25zdCByZWN1cnNvID0gdGhpcy51cmwgKyBcIi9kb2N0b3Jlc1wiO1xuICAgIGNvbnN0IHsgaWREb2N0b3IsIGlkVXN1YXJpbywgaWRFc3BlY2lhbGlkYWQsIGZlY2hhLCBpZEZyYW5qYSwgLi4uZG9jdG9yIH0gPVxuICAgICAgZGF0YTtcbiAgICBjb25zdCBkZXRhbGxlID0gcmVjdXJzbyArIFwiL1wiICsgaWREb2N0b3I7XG4gICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgIGNhc2UgXCJkb2N0b3ItY3JlYXJcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PE9wZXJhdGlvblJlc3BvbnNlPihyZWN1cnNvLCBkb2N0b3IpO1xuICAgICAgY2FzZSBcImRvY3Rvci1lZGl0YXJcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQ8T3BlcmF0aW9uUmVzcG9uc2U+KGRldGFsbGUsIGRvY3Rvcik7XG4gICAgICBjYXNlIFwiZG9jdG9yLWVzcGVjaWFsaWRhZFwiOlxuICAgICAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8T3BlcmF0aW9uUmVzcG9uc2U+KGRldGFsbGUgKyBcIi9lc3BlY2lhbGlkYWRlc1wiLCB7XG4gICAgICAgICAgaWRFc3BlY2lhbGlkYWQsXG4gICAgICAgIH0pO1xuICAgICAgY2FzZSBcImRpc3BvbmliaWxpZGFkLXJlZ2lzdHJhclwiOlxuICAgICAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8T3BlcmF0aW9uUmVzcG9uc2U+KFxuICAgICAgICAgIGRldGFsbGUgKyBcIi9kaXNwb25pYmlsaWRhZGVzXCIsXG4gICAgICAgICAgeyBmZWNoYSwgaWRGcmFuamEsIGlkRXNwZWNpYWxpZGFkIH0sXG4gICAgICAgICk7XG4gICAgfVxuICB9XG4gIHZhbGlkYXJEb2N1bWVudGFjaW9uKFxuICAgIGlkOiBudW1iZXIsXG4gICAgYm9keToge1xuICAgICAgZG5pQ29uZm9ybWU6IGJvb2xlYW47XG4gICAgICB0aXR1bG9Db25mb3JtZTogYm9vbGVhbjtcbiAgICAgIGlkRG5pOiBudW1iZXI7XG4gICAgICBpZFRpdHVsbzogbnVtYmVyO1xuICAgIH0sXG4gICkge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxPcGVyYXRpb25SZXNwb25zZT4oXG4gICAgICB0aGlzLnVybCArIFwiL2RvY3RvcmVzL1wiICsgaWQgKyBcIi92YWxpZGFyLWRvY3VtZW50YWNpb25cIixcbiAgICAgIGJvZHksXG4gICAgKTtcbiAgfVxuICByZWNoYXphckRvY3VtZW50byhpZDogbnVtYmVyLCBpZERvY3VtZW50bzogbnVtYmVyLCBtb3Rpdm86IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxPcGVyYXRpb25SZXNwb25zZT4oXG4gICAgICB0aGlzLnVybCArIFwiL2RvY3RvcmVzL1wiICsgaWQgKyBcIi9kb2N1bWVudG9zL1wiICsgaWREb2N1bWVudG8gKyBcIi9yZWNoYXphclwiLFxuICAgICAgeyBtb3Rpdm8gfSxcbiAgICApO1xuICB9XG4gIGNyZWFyQWNjZXNvKGlkOiBudW1iZXIsIHVzZXJuYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8e1xuICAgICAgdXNlcm5hbWU6IHN0cmluZztcbiAgICAgIGNvcnJlbzogc3RyaW5nO1xuICAgICAgcGFzc3dvcmRUZW1wb3JhbDogc3RyaW5nO1xuICAgIH0+KHRoaXMudXJsICsgXCIvZG9jdG9yZXMvXCIgKyBpZCArIFwiL2FjY2Vzb1wiLCB7IHVzZXJuYW1lIH0pO1xuICB9XG4gIGRlc2NhcmdhckRvY3VtZW50byhpZDogbnVtYmVyLCBpZERvY3VtZW50bzogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQodGhpcy51cmwgKyBcIi9kb2N0b3Jlcy9kb2N1bWVudG9zL1wiICsgaWREb2N1bWVudG8sIHtcbiAgICAgIHJlc3BvbnNlVHlwZTogXCJibG9iXCIsXG4gICAgfSk7XG4gIH1cbiAgZG9jdW1lbnRvcyhpZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8RG9jdW1lbnRvRG9jdG9yW10+KFxuICAgICAgdGhpcy51cmwgKyBcIi9kb2N0b3Jlcy9cIiArIGlkICsgXCIvZG9jdW1lbnRvc1wiLFxuICAgICk7XG4gIH1cbiAgc3ViaXIoaWQ6IG51bWJlciwgdGlwbzogc3RyaW5nLCBhcmNoaXZvOiBGaWxlKSB7XG4gICAgY29uc3QgZm9ybSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgIGZvcm0uYXBwZW5kKFwidGlwb1wiLCB0aXBvKTtcbiAgICBmb3JtLmFwcGVuZChcImFyY2hpdm9cIiwgYXJjaGl2byk7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PE9wZXJhdGlvblJlc3BvbnNlPihcbiAgICAgIHRoaXMudXJsICsgXCIvZG9jdG9yZXMvXCIgKyBpZCArIFwiL2RvY3VtZW50b3NcIixcbiAgICAgIGZvcm0sXG4gICAgKTtcbiAgfVxuXG4gIGxpc3RhclBhZ2luYShwYWdpbmEgPSAwLCB0YW1hbmlvID0gMTAsIGZpbHRybyA9IFwiXCIpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldDxQYWdpbmFSZXNwb25zZTxEb2N0b3I+Pih0aGlzLnVybCArIFwiL2RvY3RvcmVzXCIsIHtcbiAgICAgIHBhcmFtczogeyBwYWdpbmEsIHRhbWFuaW8sIGZpbHRybyB9LFxuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9uaWJpbGlkYWRlc1BhZ2luYShwYWdpbmEgPSAwLCB0YW1hbmlvID0gMTAsIGZpbHRybyA9IFwiXCIpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldDxQYWdpbmFSZXNwb25zZTxEaXNwb25pYmlsaWRhZD4+KFxuICAgICAgdGhpcy51cmwgKyBcIi9kb2N0b3Jlcy9kaXNwb25pYmlsaWRhZGVzXCIsXG4gICAgICB7XG4gICAgICAgIHBhcmFtczogeyBwYWdpbmEsIHRhbWFuaW8sIGZpbHRybyB9LFxuICAgICAgfSxcbiAgICApO1xuICB9XG59XG4iXX0=
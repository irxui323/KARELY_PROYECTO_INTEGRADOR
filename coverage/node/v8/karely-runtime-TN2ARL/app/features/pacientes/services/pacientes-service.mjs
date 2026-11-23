var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from '../../../../environments/environment.mjs';
let PacienteService = class PacienteService {
    http = inject(HttpClient);
    url = environment.apiUrl;
    listar() {
        return this.http.get(this.url + "/pacientes");
    }
    guardar({ idPaciente, ...data }) {
        const recurso = this.url + "/pacientes";
        return idPaciente
            ? this.http.put(recurso + "/" + idPaciente, data)
            : this.http.post(recurso, data);
    }
    listarPagina(pagina = 0, tamanio = 10, filtro = "") {
        return this.http.get(this.url + "/pacientes", {
            params: { pagina, tamanio, filtro },
        });
    }
};
PacienteService = __decorate([
    Injectable({ providedIn: "root" })
], PacienteService);
export { PacienteService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFjaWVudGVzLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9DOi9VTklWRVJTSURBRC9MUDIvU0VNQU5BMTEva2FyZWx5X21vZGVybm8vZnJvbnRlbmQvc3JjL2FwcC9mZWF0dXJlcy9wYWNpZW50ZXMvc2VydmljZXMvIiwic291cmNlcyI6WyJwYWNpZW50ZXMtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBSTVELElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWU7SUFDVCxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFCLEdBQUcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO0lBQzFDLE1BQU07UUFDSixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFhLElBQUksQ0FBQyxHQUFHLEdBQUcsWUFBWSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUNELE9BQU8sQ0FBQyxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUksRUFBbUI7UUFDOUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxZQUFZLENBQUM7UUFDeEMsT0FBTyxVQUFVO1lBQ2YsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFvQixPQUFPLEdBQUcsR0FBRyxHQUFHLFVBQVUsRUFBRSxJQUFJLENBQUM7WUFDcEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFvQixPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxFQUFFLEVBQUUsTUFBTSxHQUFHLEVBQUU7UUFDaEQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBMkIsSUFBSSxDQUFDLEdBQUcsR0FBRyxZQUFZLEVBQUU7WUFDdEUsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUU7U0FDcEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGLENBQUE7QUFsQlksZUFBZTtJQUQzQixVQUFVLENBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUM7R0FDdEIsZUFBZSxDQWtCM0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQYWdpbmFSZXNwb25zZSB9IGZyb20gXCIuLi8uLi8uLi9jb3JlL21vZGVscy9wYWdpbmEtcmVzcG9uc2VcIjtcbmltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdGFibGUsIGluamVjdCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBlbnZpcm9ubWVudCB9IGZyb20gXCIuLi8uLi8uLi8uLi9lbnZpcm9ubWVudHMvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7IE9wZXJhdGlvblJlc3BvbnNlIH0gZnJvbSBcIi4uLy4uLy4uL2NvcmUvbW9kZWxzL29wZXJhdGlvbi1yZXNwb25zZVwiO1xuaW1wb3J0IHsgUGFjaWVudGUsIFBhY2llbnRlUmVxdWVzdCB9IGZyb20gXCIuLi9tb2RlbHMvcGFjaWVudGVzLm1vZGVsXCI7XG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46IFwicm9vdFwiIH0pXG5leHBvcnQgY2xhc3MgUGFjaWVudGVTZXJ2aWNlIHtcbiAgcHJpdmF0ZSByZWFkb25seSBodHRwID0gaW5qZWN0KEh0dHBDbGllbnQpO1xuICBwcml2YXRlIHJlYWRvbmx5IHVybCA9IGVudmlyb25tZW50LmFwaVVybDtcbiAgbGlzdGFyKCkge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PFBhY2llbnRlW10+KHRoaXMudXJsICsgXCIvcGFjaWVudGVzXCIpO1xuICB9XG4gIGd1YXJkYXIoeyBpZFBhY2llbnRlLCAuLi5kYXRhIH06IFBhY2llbnRlUmVxdWVzdCkge1xuICAgIGNvbnN0IHJlY3Vyc28gPSB0aGlzLnVybCArIFwiL3BhY2llbnRlc1wiO1xuICAgIHJldHVybiBpZFBhY2llbnRlXG4gICAgICA/IHRoaXMuaHR0cC5wdXQ8T3BlcmF0aW9uUmVzcG9uc2U+KHJlY3Vyc28gKyBcIi9cIiArIGlkUGFjaWVudGUsIGRhdGEpXG4gICAgICA6IHRoaXMuaHR0cC5wb3N0PE9wZXJhdGlvblJlc3BvbnNlPihyZWN1cnNvLCBkYXRhKTtcbiAgfVxuXG4gIGxpc3RhclBhZ2luYShwYWdpbmEgPSAwLCB0YW1hbmlvID0gMTAsIGZpbHRybyA9IFwiXCIpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldDxQYWdpbmFSZXNwb25zZTxQYWNpZW50ZT4+KHRoaXMudXJsICsgXCIvcGFjaWVudGVzXCIsIHtcbiAgICAgIHBhcmFtczogeyBwYWdpbmEsIHRhbWFuaW8sIGZpbHRybyB9LFxuICAgIH0pO1xuICB9XG59XG4iXX0=
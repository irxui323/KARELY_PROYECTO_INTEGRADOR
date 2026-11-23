var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from '../../../../environments/environment.mjs';
let CitaService = class CitaService {
    http = inject(HttpClient);
    url = environment.apiUrl;
    disponibilidadMes(idEspecialidad, mes, idConsultorio) {
        let params = new HttpParams()
            .set("idEspecialidad", idEspecialidad)
            .set("mes", mes + "-01");
        if (idConsultorio)
            params = params.set("idConsultorio", idConsultorio);
        return this.http.get(this.url + "/citas/disponibilidad-mes", { params });
    }
    disponibilidad(idEspecialidad, fecha, idConsultorio) {
        let params = new HttpParams().set("idEspecialidad", idEspecialidad);
        if (fecha)
            params = params.set("fecha", fecha);
        if (idConsultorio)
            params = params.set("idConsultorio", idConsultorio);
        return this.http.get(this.url + "/citas/disponibilidad", { params });
    }
    listar() {
        return this.http.get(this.url + "/citas");
    }
    reservas() {
        return this.http.get(this.url + "/citas/reservas");
    }
    ejecutar(action, data) {
        const recurso = this.url + "/citas";
        const { idCita, idPaciente, idDoctor, idEspecialidad, idConsultorio, idFranja, fecha, idPreReserva, metodoPago, fechaNueva, idFranjaNueva, idConsultorioNuevo, motivo, aceptacionPaciente, } = data;
        const detalle = recurso + "/" + idCita;
        switch (action) {
            case "prereserva-crear":
                return this.http.post(recurso + "/reservas", {
                    idPaciente,
                    idDoctor,
                    idEspecialidad,
                    idConsultorio,
                    idFranja,
                    fecha,
                });
            case "cita-confirmar":
                return this.http.post(recurso + "/confirmar", {
                    idPreReserva,
                    metodoPago,
                });
            case "cita-reprogramar":
                return this.http.post(detalle + "/reprogramar", {
                    fechaNueva,
                    idFranjaNueva,
                    idConsultorioNuevo,
                    motivo,
                    aceptacionPaciente,
                });
            case "asistencia-registrar":
                return this.http.post(detalle + "/asistencia", null);
        }
    }
    listarPagina(pagina = 0, tamanio = 10, filtro = "", vista = "proximas") {
        return this.http.get(this.url + "/citas", {
            params: { pagina, tamanio, filtro, vista },
        });
    }
};
CitaService = __decorate([
    Injectable({ providedIn: "root" })
], CitaService);
export { CitaService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2l0YXMtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL2ZlYXR1cmVzL2NpdGFzL3NlcnZpY2VzLyIsInNvdXJjZXMiOlsiY2l0YXMtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzlELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUs1RCxJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFXO0lBQ0wsSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMxQixHQUFHLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztJQUMxQyxpQkFBaUIsQ0FDZixjQUFzQixFQUN0QixHQUFXLEVBQ1gsYUFBNkI7UUFFN0IsSUFBSSxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUU7YUFDMUIsR0FBRyxDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQzthQUNyQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUMzQixJQUFJLGFBQWE7WUFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDdkUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDbEIsSUFBSSxDQUFDLEdBQUcsR0FBRywyQkFBMkIsRUFDdEMsRUFBRSxNQUFNLEVBQUUsQ0FDWCxDQUFDO0lBQ0osQ0FBQztJQUNELGNBQWMsQ0FDWixjQUFzQixFQUN0QixLQUFxQixFQUNyQixhQUE2QjtRQUU3QixJQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNwRSxJQUFJLEtBQUs7WUFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0MsSUFBSSxhQUFhO1lBQUUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQ2xCLElBQUksQ0FBQyxHQUFHLEdBQUcsdUJBQXVCLEVBQ2xDLEVBQUUsTUFBTSxFQUFFLENBQ1gsQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNO1FBQ0osT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBUyxJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFDRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBWSxJQUFJLENBQUMsR0FBRyxHQUFHLGlCQUFpQixDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUNELFFBQVEsQ0FBQyxNQUFrQixFQUFFLElBQWlCO1FBQzVDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDO1FBQ3BDLE1BQU0sRUFDSixNQUFNLEVBQ04sVUFBVSxFQUNWLFFBQVEsRUFDUixjQUFjLEVBQ2QsYUFBYSxFQUNiLFFBQVEsRUFDUixLQUFLLEVBQ0wsWUFBWSxFQUNaLFVBQVUsRUFDVixVQUFVLEVBQ1YsYUFBYSxFQUNiLGtCQUFrQixFQUNsQixNQUFNLEVBQ04sa0JBQWtCLEdBQ25CLEdBQUcsSUFBSSxDQUFDO1FBQ1QsTUFBTSxPQUFPLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUM7UUFDdkMsUUFBUSxNQUFNLEVBQUUsQ0FBQztZQUNmLEtBQUssa0JBQWtCO2dCQUNyQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFvQixPQUFPLEdBQUcsV0FBVyxFQUFFO29CQUM5RCxVQUFVO29CQUNWLFFBQVE7b0JBQ1IsY0FBYztvQkFDZCxhQUFhO29CQUNiLFFBQVE7b0JBQ1IsS0FBSztpQkFDTixDQUFDLENBQUM7WUFDTCxLQUFLLGdCQUFnQjtnQkFDbkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBb0IsT0FBTyxHQUFHLFlBQVksRUFBRTtvQkFDL0QsWUFBWTtvQkFDWixVQUFVO2lCQUNYLENBQUMsQ0FBQztZQUNMLEtBQUssa0JBQWtCO2dCQUNyQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFvQixPQUFPLEdBQUcsY0FBYyxFQUFFO29CQUNqRSxVQUFVO29CQUNWLGFBQWE7b0JBQ2Isa0JBQWtCO29CQUNsQixNQUFNO29CQUNOLGtCQUFrQjtpQkFDbkIsQ0FBQyxDQUFDO1lBQ0wsS0FBSyxzQkFBc0I7Z0JBQ3pCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQW9CLE9BQU8sR0FBRyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUUsQ0FBQztJQUNILENBQUM7SUFFRCxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxPQUFPLEdBQUcsRUFBRSxFQUFFLE1BQU0sR0FBRyxFQUFFLEVBQUUsS0FBSyxHQUFHLFVBQVU7UUFDcEUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBdUIsSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLEVBQUU7WUFDOUQsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFO1NBQzNDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRixDQUFBO0FBeEZZLFdBQVc7SUFEdkIsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDO0dBQ3RCLFdBQVcsQ0F3RnZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGFnaW5hUmVzcG9uc2UgfSBmcm9tIFwiLi4vLi4vLi4vY29yZS9tb2RlbHMvcGFnaW5hLXJlc3BvbnNlXCI7XG5pbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwUGFyYW1zIH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3RhYmxlLCBpbmplY3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgZW52aXJvbm1lbnQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vZW52aXJvbm1lbnRzL2Vudmlyb25tZW50XCI7XG5pbXBvcnQgeyBPcGVyYXRpb25SZXNwb25zZSB9IGZyb20gXCIuLi8uLi8uLi9jb3JlL21vZGVscy9vcGVyYXRpb24tcmVzcG9uc2VcIjtcbmltcG9ydCB7IENpdGEsIENpdGFBY2Npb24sIENpdGFSZXF1ZXN0LCBSZXNlcnZhIH0gZnJvbSBcIi4uL21vZGVscy9jaXRhcy5tb2RlbFwiO1xuaW1wb3J0IHsgRG9jdG9yRGlzcG9uaWJsZSwgRGlzcG9uaWJpbGlkYWREaWEgfSBmcm9tIFwiLi4vbW9kZWxzL2NpdGFzLm1vZGVsXCI7XG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46IFwicm9vdFwiIH0pXG5leHBvcnQgY2xhc3MgQ2l0YVNlcnZpY2Uge1xuICBwcml2YXRlIHJlYWRvbmx5IGh0dHAgPSBpbmplY3QoSHR0cENsaWVudCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgdXJsID0gZW52aXJvbm1lbnQuYXBpVXJsO1xuICBkaXNwb25pYmlsaWRhZE1lcyhcbiAgICBpZEVzcGVjaWFsaWRhZDogbnVtYmVyLFxuICAgIG1lczogc3RyaW5nLFxuICAgIGlkQ29uc3VsdG9yaW8/OiBudW1iZXIgfCBudWxsLFxuICApIHtcbiAgICBsZXQgcGFyYW1zID0gbmV3IEh0dHBQYXJhbXMoKVxuICAgICAgLnNldChcImlkRXNwZWNpYWxpZGFkXCIsIGlkRXNwZWNpYWxpZGFkKVxuICAgICAgLnNldChcIm1lc1wiLCBtZXMgKyBcIi0wMVwiKTtcbiAgICBpZiAoaWRDb25zdWx0b3JpbykgcGFyYW1zID0gcGFyYW1zLnNldChcImlkQ29uc3VsdG9yaW9cIiwgaWRDb25zdWx0b3Jpbyk7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8RGlzcG9uaWJpbGlkYWREaWFbXT4oXG4gICAgICB0aGlzLnVybCArIFwiL2NpdGFzL2Rpc3BvbmliaWxpZGFkLW1lc1wiLFxuICAgICAgeyBwYXJhbXMgfSxcbiAgICApO1xuICB9XG4gIGRpc3BvbmliaWxpZGFkKFxuICAgIGlkRXNwZWNpYWxpZGFkOiBudW1iZXIsXG4gICAgZmVjaGE/OiBzdHJpbmcgfCBudWxsLFxuICAgIGlkQ29uc3VsdG9yaW8/OiBudW1iZXIgfCBudWxsLFxuICApIHtcbiAgICBsZXQgcGFyYW1zID0gbmV3IEh0dHBQYXJhbXMoKS5zZXQoXCJpZEVzcGVjaWFsaWRhZFwiLCBpZEVzcGVjaWFsaWRhZCk7XG4gICAgaWYgKGZlY2hhKSBwYXJhbXMgPSBwYXJhbXMuc2V0KFwiZmVjaGFcIiwgZmVjaGEpO1xuICAgIGlmIChpZENvbnN1bHRvcmlvKSBwYXJhbXMgPSBwYXJhbXMuc2V0KFwiaWRDb25zdWx0b3Jpb1wiLCBpZENvbnN1bHRvcmlvKTtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldDxEb2N0b3JEaXNwb25pYmxlW10+KFxuICAgICAgdGhpcy51cmwgKyBcIi9jaXRhcy9kaXNwb25pYmlsaWRhZFwiLFxuICAgICAgeyBwYXJhbXMgfSxcbiAgICApO1xuICB9XG4gIGxpc3RhcigpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldDxDaXRhW10+KHRoaXMudXJsICsgXCIvY2l0YXNcIik7XG4gIH1cbiAgcmVzZXJ2YXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8UmVzZXJ2YVtdPih0aGlzLnVybCArIFwiL2NpdGFzL3Jlc2VydmFzXCIpO1xuICB9XG4gIGVqZWN1dGFyKGFjdGlvbjogQ2l0YUFjY2lvbiwgZGF0YTogQ2l0YVJlcXVlc3QpIHtcbiAgICBjb25zdCByZWN1cnNvID0gdGhpcy51cmwgKyBcIi9jaXRhc1wiO1xuICAgIGNvbnN0IHtcbiAgICAgIGlkQ2l0YSxcbiAgICAgIGlkUGFjaWVudGUsXG4gICAgICBpZERvY3RvcixcbiAgICAgIGlkRXNwZWNpYWxpZGFkLFxuICAgICAgaWRDb25zdWx0b3JpbyxcbiAgICAgIGlkRnJhbmphLFxuICAgICAgZmVjaGEsXG4gICAgICBpZFByZVJlc2VydmEsXG4gICAgICBtZXRvZG9QYWdvLFxuICAgICAgZmVjaGFOdWV2YSxcbiAgICAgIGlkRnJhbmphTnVldmEsXG4gICAgICBpZENvbnN1bHRvcmlvTnVldm8sXG4gICAgICBtb3Rpdm8sXG4gICAgICBhY2VwdGFjaW9uUGFjaWVudGUsXG4gICAgfSA9IGRhdGE7XG4gICAgY29uc3QgZGV0YWxsZSA9IHJlY3Vyc28gKyBcIi9cIiArIGlkQ2l0YTtcbiAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgY2FzZSBcInByZXJlc2VydmEtY3JlYXJcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PE9wZXJhdGlvblJlc3BvbnNlPihyZWN1cnNvICsgXCIvcmVzZXJ2YXNcIiwge1xuICAgICAgICAgIGlkUGFjaWVudGUsXG4gICAgICAgICAgaWREb2N0b3IsXG4gICAgICAgICAgaWRFc3BlY2lhbGlkYWQsXG4gICAgICAgICAgaWRDb25zdWx0b3JpbyxcbiAgICAgICAgICBpZEZyYW5qYSxcbiAgICAgICAgICBmZWNoYSxcbiAgICAgICAgfSk7XG4gICAgICBjYXNlIFwiY2l0YS1jb25maXJtYXJcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PE9wZXJhdGlvblJlc3BvbnNlPihyZWN1cnNvICsgXCIvY29uZmlybWFyXCIsIHtcbiAgICAgICAgICBpZFByZVJlc2VydmEsXG4gICAgICAgICAgbWV0b2RvUGFnbyxcbiAgICAgICAgfSk7XG4gICAgICBjYXNlIFwiY2l0YS1yZXByb2dyYW1hclwiOlxuICAgICAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8T3BlcmF0aW9uUmVzcG9uc2U+KGRldGFsbGUgKyBcIi9yZXByb2dyYW1hclwiLCB7XG4gICAgICAgICAgZmVjaGFOdWV2YSxcbiAgICAgICAgICBpZEZyYW5qYU51ZXZhLFxuICAgICAgICAgIGlkQ29uc3VsdG9yaW9OdWV2byxcbiAgICAgICAgICBtb3Rpdm8sXG4gICAgICAgICAgYWNlcHRhY2lvblBhY2llbnRlLFxuICAgICAgICB9KTtcbiAgICAgIGNhc2UgXCJhc2lzdGVuY2lhLXJlZ2lzdHJhclwiOlxuICAgICAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8T3BlcmF0aW9uUmVzcG9uc2U+KGRldGFsbGUgKyBcIi9hc2lzdGVuY2lhXCIsIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIGxpc3RhclBhZ2luYShwYWdpbmEgPSAwLCB0YW1hbmlvID0gMTAsIGZpbHRybyA9IFwiXCIsIHZpc3RhID0gXCJwcm94aW1hc1wiKSB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8UGFnaW5hUmVzcG9uc2U8Q2l0YT4+KHRoaXMudXJsICsgXCIvY2l0YXNcIiwge1xuICAgICAgcGFyYW1zOiB7IHBhZ2luYSwgdGFtYW5pbywgZmlsdHJvLCB2aXN0YSB9LFxuICAgIH0pO1xuICB9XG59XG4iXX0=
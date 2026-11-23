var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from '../../../../environments/environment.mjs';
let AtencionService = class AtencionService {
    http = inject(HttpClient);
    url = environment.apiUrl;
    listar() {
        return this.http.get(this.url + "/atenciones");
    }
    recibo(idCita) {
        return this.http.get(`${this.url}/atenciones/${idCita}/recibo`);
    }
    descargarRecibo(idCita) {
        return this.http.get(`${this.url}/atenciones/${idCita}/recibo/pdf`, {
            responseType: "blob",
        });
    }
    ejecutar(action, data) {
        const recurso = this.url + "/atenciones";
        const { idCita, idReceta, diagnostico, observaciones, indicaciones, medicamento, dosis, frecuencia, duracion, medioEntrega, } = data;
        const detalle = recurso + "/" + idCita;
        switch (action) {
            case "atencion-iniciar":
                return this.http.post(recurso + "/iniciar", {
                    idCita,
                });
            case "diagnostico-registrar":
                return this.http.post(detalle + "/diagnostico", {
                    diagnostico,
                    observaciones,
                });
            case "receta-crear":
                return this.http.post(detalle + "/receta", {
                    indicaciones,
                });
            case "medicamento-agregar":
                return this.http.post(recurso + "/recetas/" + idReceta + "/medicamentos", {
                    medicamento,
                    dosis,
                    frecuencia,
                    duracion,
                    observaciones,
                });
            case "recibo-emitir":
                return this.http.post(detalle + "/recibo", {});
            case "recibo-entregar":
                return this.http.post(detalle + "/entrega", {
                    medioEntrega,
                });
            case "atencion-cerrar":
                return this.http.post(detalle + "/cerrar", null);
        }
    }
};
AtencionService = __decorate([
    Injectable({ providedIn: "root" })
], AtencionService);
export { AtencionService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXRlbmNpb24tc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL2ZlYXR1cmVzL2F0ZW5jaW9uL3NlcnZpY2VzLyIsInNvdXJjZXMiOlsiYXRlbmNpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBUzVELElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWU7SUFDVCxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFCLEdBQUcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO0lBQzFDLE1BQU07UUFDSixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFhLElBQUksQ0FBQyxHQUFHLEdBQUcsYUFBYSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUNELE1BQU0sQ0FBQyxNQUFjO1FBQ25CLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQ2xCLEdBQUcsSUFBSSxDQUFDLEdBQUcsZUFBZSxNQUFNLFNBQVMsQ0FDMUMsQ0FBQztJQUNKLENBQUM7SUFDRCxlQUFlLENBQUMsTUFBYztRQUM1QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsZUFBZSxNQUFNLGFBQWEsRUFBRTtZQUNsRSxZQUFZLEVBQUUsTUFBTTtTQUNyQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsUUFBUSxDQUFDLE1BQXNCLEVBQUUsSUFBcUI7UUFDcEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxhQUFhLENBQUM7UUFDekMsTUFBTSxFQUNKLE1BQU0sRUFDTixRQUFRLEVBQ1IsV0FBVyxFQUNYLGFBQWEsRUFDYixZQUFZLEVBQ1osV0FBVyxFQUNYLEtBQUssRUFDTCxVQUFVLEVBQ1YsUUFBUSxFQUNSLFlBQVksR0FDYixHQUFHLElBQUksQ0FBQztRQUNULE1BQU0sT0FBTyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO1FBQ3ZDLFFBQVEsTUFBTSxFQUFFLENBQUM7WUFDZixLQUFLLGtCQUFrQjtnQkFDckIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBb0IsT0FBTyxHQUFHLFVBQVUsRUFBRTtvQkFDN0QsTUFBTTtpQkFDUCxDQUFDLENBQUM7WUFDTCxLQUFLLHVCQUF1QjtnQkFDMUIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBb0IsT0FBTyxHQUFHLGNBQWMsRUFBRTtvQkFDakUsV0FBVztvQkFDWCxhQUFhO2lCQUNkLENBQUMsQ0FBQztZQUNMLEtBQUssY0FBYztnQkFDakIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBb0IsT0FBTyxHQUFHLFNBQVMsRUFBRTtvQkFDNUQsWUFBWTtpQkFDYixDQUFDLENBQUM7WUFDTCxLQUFLLHFCQUFxQjtnQkFDeEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDbkIsT0FBTyxHQUFHLFdBQVcsR0FBRyxRQUFRLEdBQUcsZUFBZSxFQUNsRDtvQkFDRSxXQUFXO29CQUNYLEtBQUs7b0JBQ0wsVUFBVTtvQkFDVixRQUFRO29CQUNSLGFBQWE7aUJBQ2QsQ0FDRixDQUFDO1lBQ0osS0FBSyxlQUFlO2dCQUNsQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFvQixPQUFPLEdBQUcsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3BFLEtBQUssaUJBQWlCO2dCQUNwQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFvQixPQUFPLEdBQUcsVUFBVSxFQUFFO29CQUM3RCxZQUFZO2lCQUNiLENBQUMsQ0FBQztZQUNMLEtBQUssaUJBQWlCO2dCQUNwQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFvQixPQUFPLEdBQUcsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hFLENBQUM7SUFDSCxDQUFDO0NBQ0YsQ0FBQTtBQWxFWSxlQUFlO0lBRDNCLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQztHQUN0QixlQUFlLENBa0UzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdGFibGUsIGluamVjdCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBlbnZpcm9ubWVudCB9IGZyb20gXCIuLi8uLi8uLi8uLi9lbnZpcm9ubWVudHMvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7IE9wZXJhdGlvblJlc3BvbnNlIH0gZnJvbSBcIi4uLy4uLy4uL2NvcmUvbW9kZWxzL29wZXJhdGlvbi1yZXNwb25zZVwiO1xuaW1wb3J0IHtcbiAgQXRlbmNpb24sXG4gIEF0ZW5jaW9uQWNjaW9uLFxuICBBdGVuY2lvblJlcXVlc3QsXG4gIFJlY2libyxcbn0gZnJvbSBcIi4uL21vZGVscy9hdGVuY2lvbi5tb2RlbFwiO1xuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiBcInJvb3RcIiB9KVxuZXhwb3J0IGNsYXNzIEF0ZW5jaW9uU2VydmljZSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgaHR0cCA9IGluamVjdChIdHRwQ2xpZW50KTtcbiAgcHJpdmF0ZSByZWFkb25seSB1cmwgPSBlbnZpcm9ubWVudC5hcGlVcmw7XG4gIGxpc3RhcigpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldDxBdGVuY2lvbltdPih0aGlzLnVybCArIFwiL2F0ZW5jaW9uZXNcIik7XG4gIH1cbiAgcmVjaWJvKGlkQ2l0YTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8UmVjaWJvIHwgbnVsbD4oXG4gICAgICBgJHt0aGlzLnVybH0vYXRlbmNpb25lcy8ke2lkQ2l0YX0vcmVjaWJvYCxcbiAgICApO1xuICB9XG4gIGRlc2NhcmdhclJlY2libyhpZENpdGE6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KGAke3RoaXMudXJsfS9hdGVuY2lvbmVzLyR7aWRDaXRhfS9yZWNpYm8vcGRmYCwge1xuICAgICAgcmVzcG9uc2VUeXBlOiBcImJsb2JcIixcbiAgICB9KTtcbiAgfVxuICBlamVjdXRhcihhY3Rpb246IEF0ZW5jaW9uQWNjaW9uLCBkYXRhOiBBdGVuY2lvblJlcXVlc3QpIHtcbiAgICBjb25zdCByZWN1cnNvID0gdGhpcy51cmwgKyBcIi9hdGVuY2lvbmVzXCI7XG4gICAgY29uc3Qge1xuICAgICAgaWRDaXRhLFxuICAgICAgaWRSZWNldGEsXG4gICAgICBkaWFnbm9zdGljbyxcbiAgICAgIG9ic2VydmFjaW9uZXMsXG4gICAgICBpbmRpY2FjaW9uZXMsXG4gICAgICBtZWRpY2FtZW50byxcbiAgICAgIGRvc2lzLFxuICAgICAgZnJlY3VlbmNpYSxcbiAgICAgIGR1cmFjaW9uLFxuICAgICAgbWVkaW9FbnRyZWdhLFxuICAgIH0gPSBkYXRhO1xuICAgIGNvbnN0IGRldGFsbGUgPSByZWN1cnNvICsgXCIvXCIgKyBpZENpdGE7XG4gICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgIGNhc2UgXCJhdGVuY2lvbi1pbmljaWFyXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxPcGVyYXRpb25SZXNwb25zZT4ocmVjdXJzbyArIFwiL2luaWNpYXJcIiwge1xuICAgICAgICAgIGlkQ2l0YSxcbiAgICAgICAgfSk7XG4gICAgICBjYXNlIFwiZGlhZ25vc3RpY28tcmVnaXN0cmFyXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxPcGVyYXRpb25SZXNwb25zZT4oZGV0YWxsZSArIFwiL2RpYWdub3N0aWNvXCIsIHtcbiAgICAgICAgICBkaWFnbm9zdGljbyxcbiAgICAgICAgICBvYnNlcnZhY2lvbmVzLFxuICAgICAgICB9KTtcbiAgICAgIGNhc2UgXCJyZWNldGEtY3JlYXJcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PE9wZXJhdGlvblJlc3BvbnNlPihkZXRhbGxlICsgXCIvcmVjZXRhXCIsIHtcbiAgICAgICAgICBpbmRpY2FjaW9uZXMsXG4gICAgICAgIH0pO1xuICAgICAgY2FzZSBcIm1lZGljYW1lbnRvLWFncmVnYXJcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PE9wZXJhdGlvblJlc3BvbnNlPihcbiAgICAgICAgICByZWN1cnNvICsgXCIvcmVjZXRhcy9cIiArIGlkUmVjZXRhICsgXCIvbWVkaWNhbWVudG9zXCIsXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWVkaWNhbWVudG8sXG4gICAgICAgICAgICBkb3NpcyxcbiAgICAgICAgICAgIGZyZWN1ZW5jaWEsXG4gICAgICAgICAgICBkdXJhY2lvbixcbiAgICAgICAgICAgIG9ic2VydmFjaW9uZXMsXG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgXCJyZWNpYm8tZW1pdGlyXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxPcGVyYXRpb25SZXNwb25zZT4oZGV0YWxsZSArIFwiL3JlY2lib1wiLCB7fSk7XG4gICAgICBjYXNlIFwicmVjaWJvLWVudHJlZ2FyXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxPcGVyYXRpb25SZXNwb25zZT4oZGV0YWxsZSArIFwiL2VudHJlZ2FcIiwge1xuICAgICAgICAgIG1lZGlvRW50cmVnYSxcbiAgICAgICAgfSk7XG4gICAgICBjYXNlIFwiYXRlbmNpb24tY2VycmFyXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxPcGVyYXRpb25SZXNwb25zZT4oZGV0YWxsZSArIFwiL2NlcnJhclwiLCBudWxsKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
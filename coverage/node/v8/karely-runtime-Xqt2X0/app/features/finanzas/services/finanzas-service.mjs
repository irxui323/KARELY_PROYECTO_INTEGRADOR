var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from '../../../../environments/environment.mjs';
let FinanzasService = class FinanzasService {
    http = inject(HttpClient);
    url = environment.apiUrl;
    liquidaciones() {
        return this.http.get(this.url + "/liquidaciones");
    }
    ingresos() {
        return this.http.get(this.url + "/reportes/ingresos");
    }
    saldo(idDoctor, fechaCorte) {
        return this.http.get(this.url + "/liquidaciones/saldo", {
            params: { idDoctor, fechaCorte },
        });
    }
    pagar(data) {
        return this.http.post(this.url + "/liquidaciones", data);
    }
    liquidacionesPagina(pagina = 0, tamanio = 10, filtro = "") {
        return this.http.get(this.url + "/liquidaciones", {
            params: { pagina, tamanio, filtro },
        });
    }
    ingresosPagina(pagina = 0, tamanio = 10, filtro = "") {
        return this.http.get(this.url + "/reportes/ingresos", {
            params: { pagina, tamanio, filtro },
        });
    }
};
FinanzasService = __decorate([
    Injectable({ providedIn: "root" })
], FinanzasService);
export { FinanzasService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluYW56YXMtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL2ZlYXR1cmVzL2ZpbmFuemFzL3NlcnZpY2VzLyIsInNvdXJjZXMiOlsiZmluYW56YXMtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBUzVELElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWU7SUFDVCxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFCLEdBQUcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO0lBQzFDLGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFnQixJQUFJLENBQUMsR0FBRyxHQUFHLGdCQUFnQixDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUNELFFBQVE7UUFDTixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFZLElBQUksQ0FBQyxHQUFHLEdBQUcsb0JBQW9CLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBQ0QsS0FBSyxDQUFDLFFBQWdCLEVBQUUsVUFBa0I7UUFDeEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBYyxJQUFJLENBQUMsR0FBRyxHQUFHLHNCQUFzQixFQUFFO1lBQ25FLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUU7U0FDakMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFxQjtRQUN6QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFvQixJQUFJLENBQUMsR0FBRyxHQUFHLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxFQUFFLEVBQUUsTUFBTSxHQUFHLEVBQUU7UUFDdkQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxnQkFBZ0IsRUFDM0I7WUFDRSxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRTtTQUNwQyxDQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxNQUFNLEdBQUcsRUFBRTtRQUNsRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUNsQixJQUFJLENBQUMsR0FBRyxHQUFHLG9CQUFvQixFQUMvQjtZQUNFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFO1NBQ3BDLENBQ0YsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFBO0FBcENZLGVBQWU7SUFEM0IsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDO0dBQ3RCLGVBQWUsQ0FvQzNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGFnaW5hUmVzcG9uc2UgfSBmcm9tIFwiLi4vLi4vLi4vY29yZS9tb2RlbHMvcGFnaW5hLXJlc3BvbnNlXCI7XG5pbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3RhYmxlLCBpbmplY3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgZW52aXJvbm1lbnQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vZW52aXJvbm1lbnRzL2Vudmlyb25tZW50XCI7XG5pbXBvcnQgeyBPcGVyYXRpb25SZXNwb25zZSB9IGZyb20gXCIuLi8uLi8uLi9jb3JlL21vZGVscy9vcGVyYXRpb24tcmVzcG9uc2VcIjtcbmltcG9ydCB7XG4gIEZpbmFuemFzUmVxdWVzdCxcbiAgSW5ncmVzbyxcbiAgTGlxdWlkYWNpb24sXG4gIFNhbGRvRG9jdG9yLFxufSBmcm9tIFwiLi4vbW9kZWxzL2ZpbmFuemFzLm1vZGVsXCI7XG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46IFwicm9vdFwiIH0pXG5leHBvcnQgY2xhc3MgRmluYW56YXNTZXJ2aWNlIHtcbiAgcHJpdmF0ZSByZWFkb25seSBodHRwID0gaW5qZWN0KEh0dHBDbGllbnQpO1xuICBwcml2YXRlIHJlYWRvbmx5IHVybCA9IGVudmlyb25tZW50LmFwaVVybDtcbiAgbGlxdWlkYWNpb25lcygpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldDxMaXF1aWRhY2lvbltdPih0aGlzLnVybCArIFwiL2xpcXVpZGFjaW9uZXNcIik7XG4gIH1cbiAgaW5ncmVzb3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8SW5ncmVzb1tdPih0aGlzLnVybCArIFwiL3JlcG9ydGVzL2luZ3Jlc29zXCIpO1xuICB9XG4gIHNhbGRvKGlkRG9jdG9yOiBudW1iZXIsIGZlY2hhQ29ydGU6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PFNhbGRvRG9jdG9yPih0aGlzLnVybCArIFwiL2xpcXVpZGFjaW9uZXMvc2FsZG9cIiwge1xuICAgICAgcGFyYW1zOiB7IGlkRG9jdG9yLCBmZWNoYUNvcnRlIH0sXG4gICAgfSk7XG4gIH1cblxuICBwYWdhcihkYXRhOiBGaW5hbnphc1JlcXVlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8T3BlcmF0aW9uUmVzcG9uc2U+KHRoaXMudXJsICsgXCIvbGlxdWlkYWNpb25lc1wiLCBkYXRhKTtcbiAgfVxuXG4gIGxpcXVpZGFjaW9uZXNQYWdpbmEocGFnaW5hID0gMCwgdGFtYW5pbyA9IDEwLCBmaWx0cm8gPSBcIlwiKSB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8UGFnaW5hUmVzcG9uc2U8TGlxdWlkYWNpb24+PihcbiAgICAgIHRoaXMudXJsICsgXCIvbGlxdWlkYWNpb25lc1wiLFxuICAgICAge1xuICAgICAgICBwYXJhbXM6IHsgcGFnaW5hLCB0YW1hbmlvLCBmaWx0cm8gfSxcbiAgICAgIH0sXG4gICAgKTtcbiAgfVxuXG4gIGluZ3Jlc29zUGFnaW5hKHBhZ2luYSA9IDAsIHRhbWFuaW8gPSAxMCwgZmlsdHJvID0gXCJcIikge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PFBhZ2luYVJlc3BvbnNlPEluZ3Jlc28+PihcbiAgICAgIHRoaXMudXJsICsgXCIvcmVwb3J0ZXMvaW5ncmVzb3NcIixcbiAgICAgIHtcbiAgICAgICAgcGFyYW1zOiB7IHBhZ2luYSwgdGFtYW5pbywgZmlsdHJvIH0sXG4gICAgICB9LFxuICAgICk7XG4gIH1cbn1cbiJdfQ==
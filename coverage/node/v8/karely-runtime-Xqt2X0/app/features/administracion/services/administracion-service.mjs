var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from '../../../../environments/environment.mjs';
let AdministracionService = class AdministracionService {
    http = inject(HttpClient);
    url = environment.apiUrl;
    usuarios() {
        return this.http.get(this.url + "/usuarios");
    }
    roles() {
        return this.http.get(this.url + "/usuarios/roles");
    }
    parametros() {
        return this.http.get(this.url + "/parametros");
    }
    auditoria() {
        return this.http.get(this.url + "/auditoria");
    }
    notificaciones() {
        return this.http.get(this.url + "/notificaciones");
    }
    ejecutar(action, data) {
        const { idUsuario, idRol, nombre, precioConsulta, ubicacion, horaInicio, horaFin, estado, valor, } = data;
        switch (action) {
            case "especialidad-crear":
                return this.http.post(this.url + "/especialidades", {
                    nombre,
                    precioConsulta,
                    estado,
                });
            case "consultorio-crear":
                return this.http.post(this.url + "/consultorios", {
                    nombre,
                    ubicacion,
                    estado,
                });
            case "franja-crear":
                return this.http.post(this.url + "/franjas", {
                    horaInicio,
                    horaFin,
                    estado,
                });
            case "usuario-rol":
                return this.http.patch(this.url + "/usuarios/" + idUsuario + "/rol", { idRol });
            case "usuario-estado":
                return this.http.patch(this.url + "/usuarios/" + idUsuario + "/estado", { estado });
            case "parametro-cambiar":
                return this.http.put(this.url + "/parametros/" + encodeURIComponent(nombre ?? ""), { valor });
        }
    }
    crearUsuario(data) {
        return this.http.post(this.url + "/usuarios", {
            idRol: data.idRol,
            username: data.username,
            correo: data.correo,
        });
    }
    usuariosPagina(pagina = 0, tamanio = 10, filtro = "") {
        return this.http.get(this.url + "/usuarios", {
            params: { pagina, tamanio, filtro },
        });
    }
    auditoriaPagina(pagina = 0, tamanio = 10, filtro = "") {
        return this.http.get(this.url + "/auditoria", {
            params: { pagina, tamanio, filtro },
        });
    }
    notificacionesPagina(pagina = 0, tamanio = 10, filtro = "") {
        return this.http.get(this.url + "/notificaciones", {
            params: { pagina, tamanio, filtro },
        });
    }
};
AdministracionService = __decorate([
    Injectable({ providedIn: "root" })
], AdministracionService);
export { AdministracionService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5pc3RyYWNpb24tc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL2ZlYXR1cmVzL2FkbWluaXN0cmFjaW9uL3NlcnZpY2VzLyIsInNvdXJjZXMiOlsiYWRtaW5pc3RyYWNpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBYTVELElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXFCO0lBQ2YsSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMxQixHQUFHLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztJQUMxQyxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBWSxJQUFJLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFDRCxLQUFLO1FBQ0gsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBZ0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFDRCxVQUFVO1FBQ1IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBYyxJQUFJLENBQUMsR0FBRyxHQUFHLGFBQWEsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFDRCxTQUFTO1FBQ1AsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBYyxJQUFJLENBQUMsR0FBRyxHQUFHLFlBQVksQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFDRCxjQUFjO1FBQ1osT0FBTyxJQUFJLENBQUMs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TyxHQUFHLEVBQUUsRUFBRSxNQUFNLEdBQUcsRUFBRTtRQUN4RCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUNsQixJQUFJLENBQUMsR0FBRyxHQUFHLGlCQUFpQixFQUM1QjtZQUNFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFO1NBQ3BDLENBQ0YsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFBO0FBOUZZLHFCQUFxQjtJQURqQyxVQUFVLENBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUM7R0FDdEIscUJBQXFCLENBOEZqQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBhZ2luYVJlc3BvbnNlIH0gZnJvbSBcIi4uLy4uLy4uL2NvcmUvbW9kZWxzL3BhZ2luYS1yZXNwb25zZVwiO1xuaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSwgaW5qZWN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGVudmlyb25tZW50IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2Vudmlyb25tZW50cy9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHsgT3BlcmF0aW9uUmVzcG9uc2UgfSBmcm9tIFwiLi4vLi4vLi4vY29yZS9tb2RlbHMvb3BlcmF0aW9uLXJlc3BvbnNlXCI7XG5pbXBvcnQge1xuICBBY2Nlc29Vc3VhcmlvLFxuICBBZG1pbmlzdHJhY2lvbkFjY2lvbixcbiAgQWRtaW5pc3RyYWNpb25SZXF1ZXN0LFxuICBBdWRpdG9yaWEsXG4gIE5vdGlmaWNhY2lvbixcbiAgUGFyYW1ldHJvLFxuICBSb2xDYXRhbG9nbyxcbiAgVXN1YXJpbyxcbn0gZnJvbSBcIi4uL21vZGVscy9hZG1pbmlzdHJhY2lvbi5tb2RlbFwiO1xuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiBcInJvb3RcIiB9KVxuZXhwb3J0IGNsYXNzIEFkbWluaXN0cmFjaW9uU2VydmljZSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgaHR0cCA9IGluamVjdChIdHRwQ2xpZW50KTtcbiAgcHJpdmF0ZSByZWFkb25seSB1cmwgPSBlbnZpcm9ubWVudC5hcGlVcmw7XG4gIHVzdWFyaW9zKCkge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PFVzdWFyaW9bXT4odGhpcy51cmwgKyBcIi91c3Vhcmlvc1wiKTtcbiAgfVxuICByb2xlcygpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldDxSb2xDYXRhbG9nb1tdPih0aGlzLnVybCArIFwiL3VzdWFyaW9zL3JvbGVzXCIpO1xuICB9XG4gIHBhcmFtZXRyb3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8UGFyYW1ldHJvW10+KHRoaXMudXJsICsgXCIvcGFyYW1ldHJvc1wiKTtcbiAgfVxuICBhdWRpdG9yaWEoKSB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8QXVkaXRvcmlhW10+KHRoaXMudXJsICsgXCIvYXVkaXRvcmlhXCIpO1xuICB9XG4gIG5vdGlmaWNhY2lvbmVzKCkge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PE5vdGlmaWNhY2lvbltdPih0aGlzLnVybCArIFwiL25vdGlmaWNhY2lvbmVzXCIpO1xuICB9XG4gIGVqZWN1dGFyKGFjdGlvbjogQWRtaW5pc3RyYWNpb25BY2Npb24sIGRhdGE6IEFkbWluaXN0cmFjaW9uUmVxdWVzdCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGlkVXN1YXJpbyxcbiAgICAgIGlkUm9sLFxuICAgICAgbm9tYnJlLFxuICAgICAgcHJlY2lvQ29uc3VsdGEsXG4gICAgICB1YmljYWNpb24sXG4gICAgICBob3JhSW5pY2lvLFxuICAgICAgaG9yYUZpbixcbiAgICAgIGVzdGFkbyxcbiAgICAgIHZhbG9yLFxuICAgIH0gPSBkYXRhO1xuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlIFwiZXNwZWNpYWxpZGFkLWNyZWFyXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxPcGVyYXRpb25SZXNwb25zZT4odGhpcy51cmwgKyBcIi9lc3BlY2lhbGlkYWRlc1wiLCB7XG4gICAgICAgICAgbm9tYnJlLFxuICAgICAgICAgIHByZWNpb0NvbnN1bHRhLFxuICAgICAgICAgIGVzdGFkbyxcbiAgICAgICAgfSk7XG4gICAgICBjYXNlIFwiY29uc3VsdG9yaW8tY3JlYXJcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PE9wZXJhdGlvblJlc3BvbnNlPih0aGlzLnVybCArIFwiL2NvbnN1bHRvcmlvc1wiLCB7XG4gICAgICAgICAgbm9tYnJlLFxuICAgICAgICAgIHViaWNhY2lvbixcbiAgICAgICAgICBlc3RhZG8sXG4gICAgICAgIH0pO1xuICAgICAgY2FzZSBcImZyYW5qYS1jcmVhclwiOlxuICAgICAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8T3BlcmF0aW9uUmVzcG9uc2U+KHRoaXMudXJsICsgXCIvZnJhbmphc1wiLCB7XG4gICAgICAgICAgaG9yYUluaWNpbyxcbiAgICAgICAgICBob3JhRmluLFxuICAgICAgICAgIGVzdGFkbyxcbiAgICAgICAgfSk7XG4gICAgICBjYXNlIFwidXN1YXJpby1yb2xcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wYXRjaDxPcGVyYXRpb25SZXNwb25zZT4oXG4gICAgICAgICAgdGhpcy51cmwgKyBcIi91c3Vhcmlvcy9cIiArIGlkVXN1YXJpbyArIFwiL3JvbFwiLFxuICAgICAgICAgIHsgaWRSb2wgfSxcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgXCJ1c3VhcmlvLWVzdGFkb1wiOlxuICAgICAgICByZXR1cm4gdGhpcy5odHRwLnBhdGNoPE9wZXJhdGlvblJlc3BvbnNlPihcbiAgICAgICAgICB0aGlzLnVybCArIFwiL3VzdWFyaW9zL1wiICsgaWRVc3VhcmlvICsgXCIvZXN0YWRvXCIsXG4gICAgICAgICAgeyBlc3RhZG8gfSxcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgXCJwYXJhbWV0cm8tY2FtYmlhclwiOlxuICAgICAgICByZXR1cm4gdGhpcy5odHRwLnB1dDxPcGVyYXRpb25SZXNwb25zZT4oXG4gICAgICAgICAgdGhpcy51cmwgKyBcIi9wYXJhbWV0cm9zL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KG5vbWJyZSA/PyBcIlwiKSxcbiAgICAgICAgICB7IHZhbG9yIH0sXG4gICAgICAgICk7XG4gICAgfVxuICB9XG4gIGNyZWFyVXN1YXJpbyhkYXRhOiBBZG1pbmlzdHJhY2lvblJlcXVlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8QWNjZXNvVXN1YXJpbz4odGhpcy51cmwgKyBcIi91c3Vhcmlvc1wiLCB7XG4gICAgICBpZFJvbDogZGF0YS5pZFJvbCxcbiAgICAgIHVzZXJuYW1lOiBkYXRhLnVzZXJuYW1lLFxuICAgICAgY29ycmVvOiBkYXRhLmNvcnJlbyxcbiAgICB9KTtcbiAgfVxuXG4gIHVzdWFyaW9zUGFnaW5hKHBhZ2luYSA9IDAsIHRhbWFuaW8gPSAxMCwgZmlsdHJvID0gXCJcIikge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PFBhZ2luYVJlc3BvbnNlPFVzdWFyaW8+Pih0aGlzLnVybCArIFwiL3VzdWFyaW9zXCIsIHtcbiAgICAgIHBhcmFtczogeyBwYWdpbmEsIHRhbWFuaW8sIGZpbHRybyB9LFxuICAgIH0pO1xuICB9XG5cbiAgYXVkaXRvcmlhUGFnaW5hKHBhZ2luYSA9IDAsIHRhbWFuaW8gPSAxMCwgZmlsdHJvID0gXCJcIikge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PFBhZ2luYVJlc3BvbnNlPEF1ZGl0b3JpYT4+KHRoaXMudXJsICsgXCIvYXVkaXRvcmlhXCIsIHtcbiAgICAgIHBhcmFtczogeyBwYWdpbmEsIHRhbWFuaW8sIGZpbHRybyB9LFxuICAgIH0pO1xuICB9XG5cbiAgbm90aWZpY2FjaW9uZXNQYWdpbmEocGFnaW5hID0gMCwgdGFtYW5pbyA9IDEwLCBmaWx0cm8gPSBcIlwiKSB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8UGFnaW5hUmVzcG9uc2U8Tm90aWZpY2FjaW9uPj4oXG4gICAgICB0aGlzLnVybCArIFwiL25vdGlmaWNhY2lvbmVzXCIsXG4gICAgICB7XG4gICAgICAgIHBhcmFtczogeyBwYWdpbmEsIHRhbWFuaW8sIGZpbHRybyB9LFxuICAgICAgfSxcbiAgICApO1xuICB9XG59XG4iXX0=
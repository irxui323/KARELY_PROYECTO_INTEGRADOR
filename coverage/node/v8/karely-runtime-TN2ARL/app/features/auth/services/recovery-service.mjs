var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from '../../../../environments/environment.mjs';
let RecoveryService = class RecoveryService {
    http = inject(HttpClient);
    solicitar(correo) {
        return firstValueFrom(this.http.post(environment.apiUrl + "/auth/recuperacion", { correo }));
    }
    restablecer(token, password, confirmacionPassword) {
        return firstValueFrom(this.http.post(environment.apiUrl + "/auth/restablecer-password", {
            token,
            password,
            confirmacionPassword,
        }));
    }
};
RecoveryService = __decorate([
    Injectable({ providedIn: "root" })
], RecoveryService);
export { RecoveryService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3Zlcnktc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL2ZlYXR1cmVzL2F1dGgvc2VydmljZXMvIiwic291cmNlcyI6WyJyZWNvdmVyeS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUU1RCxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFlO0lBQ1QsSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMzQyxTQUFTLENBQUMsTUFBYztRQUN0QixPQUFPLGNBQWMsQ0FDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBRVgsV0FBVyxDQUFDLE1BQU0sR0FBRyxvQkFBb0IsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQzFELENBQUM7SUFDSixDQUFDO0lBQ0QsV0FBVyxDQUFDLEtBQWEsRUFBRSxRQUFnQixFQUFFLG9CQUE0QjtRQUN2RSxPQUFPLGNBQWMsQ0FDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBRVgsV0FBVyxDQUFDLE1BQU0sR0FBRyw0QkFBNEIsRUFBRTtZQUNwRCxLQUFLO1lBQ0wsUUFBUTtZQUNSLG9CQUFvQjtTQUNyQixDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFBO0FBcEJZLGVBQWU7SUFEM0IsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDO0dBQ3RCLGVBQWUsQ0FvQjNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSwgaW5qZWN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGZpcnN0VmFsdWVGcm9tIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGVudmlyb25tZW50IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2Vudmlyb25tZW50cy9lbnZpcm9ubWVudFwiO1xuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiBcInJvb3RcIiB9KVxuZXhwb3J0IGNsYXNzIFJlY292ZXJ5U2VydmljZSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgaHR0cCA9IGluamVjdChIdHRwQ2xpZW50KTtcbiAgc29saWNpdGFyKGNvcnJlbzogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGZpcnN0VmFsdWVGcm9tKFxuICAgICAgdGhpcy5odHRwLnBvc3Q8e1xuICAgICAgICBtZW5zYWplOiBzdHJpbmc7XG4gICAgICB9PihlbnZpcm9ubWVudC5hcGlVcmwgKyBcIi9hdXRoL3JlY3VwZXJhY2lvblwiLCB7IGNvcnJlbyB9KSxcbiAgICApO1xuICB9XG4gIHJlc3RhYmxlY2VyKHRva2VuOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIGNvbmZpcm1hY2lvblBhc3N3b3JkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZmlyc3RWYWx1ZUZyb20oXG4gICAgICB0aGlzLmh0dHAucG9zdDx7XG4gICAgICAgIG1lbnNhamU6IHN0cmluZztcbiAgICAgIH0+KGVudmlyb25tZW50LmFwaVVybCArIFwiL2F1dGgvcmVzdGFibGVjZXItcGFzc3dvcmRcIiwge1xuICAgICAgICB0b2tlbixcbiAgICAgICAgcGFzc3dvcmQsXG4gICAgICAgIGNvbmZpcm1hY2lvblBhc3N3b3JkLFxuICAgICAgfSksXG4gICAgKTtcbiAgfVxufVxuIl19
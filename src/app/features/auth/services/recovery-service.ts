import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../../environments/environment";
@Injectable({ providedIn: "root" })
export class RecoveryService {
    private readonly http = inject(HttpClient);
    solicitar(correo: string) {
        return firstValueFrom(this.http.post<{
            mensaje: string;
        }>(environment.apiUrl + "/auth/recuperacion", { correo }));
    }
    restablecer(token: string, password: string, confirmacionPassword: string) {
        return firstValueFrom(this.http.post<{
            mensaje: string;
        }>(environment.apiUrl + "/auth/restablecer-password", { token, password, confirmacionPassword }));
    }
}

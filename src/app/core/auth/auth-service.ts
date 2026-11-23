import { HttpClient } from "@angular/common/http";
import { DestroyRef, Injectable, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import { PERMISOS_POR_ROL } from "../config/permisos";
import { LoginResponse, Permiso, Session } from "./auth.model";
const API_URL = environment.apiUrl;
@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private timer?: ReturnType<typeof setTimeout>;
  private avisoTimer?: ReturnType<typeof setTimeout>;
  session = signal<Session | null>(this.read());
  porVencer = signal(false);
  constructor() {
    this.programarVencimiento();
    this.destroyRef.onDestroy(() => this.cancelarTemporizador());
  }
  private validar(value: unknown): Session | null {
    if (!value || typeof value !== "object") return null;
    const s = value as Partial<LoginResponse>;
    if (
      typeof s.token !== "string" ||
      typeof s.usuario !== "string" ||
      !s.usuario.trim() ||
      !Number.isInteger(s.idUsuario) ||
      Number(s.idUsuario) <= 0 ||
      !Object.hasOwn(PERMISOS_POR_ROL, s.rol ?? "")
    )
      return null;
    try {
      const parts = s.token.split(".");
      if (parts.length !== 3 || parts.some((part) => !part)) return null;
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp))
        return null;
      const expiraEn = payload.exp * 1000;
      if (!Number.isFinite(expiraEn) || expiraEn <= Date.now()) return null;
      return {
        token: s.token,
        usuario: s.usuario,
        rol: s.rol!,
        idUsuario: s.idUsuario!,
        expiraEn,
      };
    } catch {
      return null;
    }
  }
  private read(): Session | null {
    try {
      const session = this.validar(
        JSON.parse(sessionStorage.getItem("karely_session") || "null"),
      );
      if (!session) sessionStorage.removeItem("karely_session");
      return session;
    } catch {
      sessionStorage.removeItem("karely_session");
      return null;
    }
  }
  private cancelarTemporizador() {
    if (this.timer !== undefined) clearTimeout(this.timer);
    if (this.avisoTimer !== undefined) clearTimeout(this.avisoTimer);
    this.timer = undefined;
    this.avisoTimer = undefined;
  }
  private programarVencimiento() {
    this.cancelarTemporizador();
    this.porVencer.set(false);
    const session = this.session();
    if (!session) return;
    const restante = Math.max(session.expiraEn - Date.now(), 0);
    this.avisoTimer = setTimeout(
      () => this.porVencer.set(true),
      Math.max(restante - 60_000, 0),
    );
    this.timer = setTimeout(
      () => {
        if (session.expiraEn <= Date.now()) this.clear(true);
        else this.programarVencimiento();
      },
      Math.min(restante, 2147483647),
    );
  }
  estaAutenticado(): boolean {
    const session = this.session();
    if (!session) return false;
    if (session.expiraEn <= Date.now()) {
      this.clear(true);
      return false;
    }
    return true;
  }
  tienePermiso(permiso: Permiso): boolean {
    return (
      this.estaAutenticado() &&
      !!PERMISOS_POR_ROL[this.session()!.rol]?.includes(permiso)
    );
  }
  async login(username: string, password: string): Promise<Session> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(API_URL + "/auth/login", {
        username,
        password,
      }),
    );
    const session = this.validar(response);
    if (!session)
      throw new Error(
        "La respuesta de inicio de sesiÃ³n no contiene una sesiÃ³n vÃ¡lida",
      );
    sessionStorage.setItem("karely_session", JSON.stringify(session));
    this.session.set(session);
    this.programarVencimiento();
    return session;
  }
  async logout() {
    try {
      await firstValueFrom(this.http.post(API_URL + "/auth/logout", {}));
    } catch {
    } finally {
      this.clear();
    }
  }
  limpiarSesionLocal() {
    this.cancelarTemporizador();
    sessionStorage.removeItem("karely_session");
    this.session.set(null);
    this.porVencer.set(false);
  }
  clear(expirada = false) {
    this.limpiarSesionLocal();
    void this.router.navigateByUrl(
      expirada ? "/login?sesionExpirada=1" : "/login",
    );
  }
}

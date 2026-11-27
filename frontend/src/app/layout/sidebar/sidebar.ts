import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../core/auth/auth-service";
import { MENU } from "../../core/config/menu";
import { FEATURE_NAVIGATION } from "../../core/config/feature-navigation";
@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: "./sidebar.html",
  styleUrl: "./sidebar.css",
})
export class Sidebar {
  auth = inject(AuthService);
  get tituloPanel(): string {
    const rol = this.auth.session()?.rol;
    return rol === "DOCTOR"
      ? "PANEL MÉDICO"
      : rol === "RECEPCIONISTA"
        ? "RECEPCIÓN"
        : rol === "CAJERA"
          ? "CAJA"
          : rol === "TESORERA"
            ? "TESORERÍA"
            : "PANEL DE ADMINISTRACIÓN";
  }
  get esDoctor() {
    return this.auth.session()?.rol === "DOCTOR";
  }
  get menu() {
    const autenticado = this.auth.estaAutenticado();
    if (autenticado && this.esDoctor) {
      return FEATURE_NAVIGATION.atencion
        .filter((link) => this.auth.tienePermiso(link.permiso))
        .map((link) => ({
          ...link,
          icon: link.path === "/doctor" ? "ICON_MENU.png" : "ICON_DOCTORES.png",
        }));
    }
    return MENU.filter(
      (item) =>
        autenticado && (!item.permiso || this.auth.tienePermiso(item.permiso)),
    ).map((item) =>
      this.auth.session()?.rol === "CAJERA" && item.path === "/citas"
        ? { ...item, label: "Cobros y citas" }
        : item,
    );
  }
}

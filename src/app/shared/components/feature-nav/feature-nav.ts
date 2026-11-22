import { Component, Input, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../core/auth/auth-service";
import { FEATURE_NAVIGATION } from "../../../core/config/feature-navigation";
@Component({
  selector: "app-feature-nav",
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: "./feature-nav.html",
})
export class FeatureNav {
  @Input() feature = "";
  private readonly auth = inject(AuthService);
  get links() {
    return (FEATURE_NAVIGATION[this.feature] || []).filter((link) =>
      this.auth.tienePermiso(link.permiso),
    ).map(link => this.feature === "atencion" && this.auth.session()?.rol === "ADMINISTRADORA"
      ? { ...link, label: link.path === "/doctor" ? "Agenda general" : link.label, path: link.path === "/doctor/horarios" ? "/doctores/horarios" : link.path }
      : link);
  }
}

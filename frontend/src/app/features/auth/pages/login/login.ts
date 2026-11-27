import { ChangeDetectorRef, Component, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../../core/auth/auth-service";
import { errorText } from "../../../../core/utils/http-error";
import { INICIO_POR_ROL } from "../../../../core/config/permisos";
import { returnUrlSeguro } from "../../../../core/utils/return-url";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./login.html",
  styleUrl: "./login.css",
})
export class LoginComponent {
  private readonly changeDetector = inject(ChangeDetectorRef);

  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute, { optional: true });
  aviso =
    this.route?.snapshot.queryParamMap.get("sesionExpirada") === "1"
      ? "Tu sesión ha vencido. Inicia sesión nuevamente."
      : "";
  mostrar = false;
  error = "";
  loading = false;
  readonly loginForm = new FormGroup({
    username: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  async login() {
    try {
      if (this.loading) return;
      if (this.loginForm.invalid) {
        this.loginForm.markAllAsTouched();
        this.error = "Introduce tu usuario y contraseña";
        return;
      }
      this.error = "";
      this.loading = true;
      try {
        const { username, password } = this.loginForm.getRawValue();
        const s = await this.auth.login(username, password);
        const destino = returnUrlSeguro(
          this.route?.snapshot.queryParamMap.get("returnUrl"),
        );
        const destinoMedico =
          destino &&
          /^\/doctor(?:\/(?:horarios|consultas))?(?:[?#]|$)/.test(destino)
            ? destino
            : "/doctor";
        await this.router.navigateByUrl(
          s.rol === "DOCTOR"
            ? destinoMedico
            : (destino ?? INICIO_POR_ROL[s.rol]),
        );
      } catch (e) {
        this.error = errorText(e);
      } finally {
        this.loading = false;
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
}

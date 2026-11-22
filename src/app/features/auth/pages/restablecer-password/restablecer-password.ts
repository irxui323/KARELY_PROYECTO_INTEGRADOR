import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectorRef, Component, OnDestroy, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AuthService } from "../../../../core/auth/auth-service";
import { RecoveryService } from "../../services/recovery-service";
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./restablecer-password.html",
  styleUrl: "../recovery.css",
})
export class RestablecerPassword implements OnDestroy {
  private readonly service = inject(RecoveryService);
  private readonly auth = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private token =
    new URLSearchParams(inject(ActivatedRoute).snapshot.fragment ?? "").get(
      "token",
    ) ?? "";
  error = "";
  loading = false;
  exito = false;
  enlaceInvalido = !/^[A-Za-z0-9_-]{43}$/.test(this.token);
  readonly form = new FormGroup(
    {
      password: new FormControl("", {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(72),
          (control) =>
            new TextEncoder().encode(control.value ?? "").length <= 72
              ? null
              : { maxBytes: true },
        ],
      }),
      confirmacionPassword: new FormControl("", {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(72),
          (control) =>
            new TextEncoder().encode(control.value ?? "").length <= 72
              ? null
              : { maxBytes: true },
        ],
      }),
    },
    {
      validators: (group) =>
        group.get("password")?.value ===
        group.get("confirmacionPassword")?.value
          ? null
          : { noCoinciden: true },
    },
  );
  constructor() {
    history.replaceState(
      history.state,
      "",
      location.pathname + location.search,
    );
  }
  ngOnDestroy() {
    this.token = "";
    this.form.reset();
  }
  async enviar() {
    if (this.loading || this.exito || this.enlaceInvalido) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error =
        "Usa al menos 12 caracteres, hasta 72 bytes UTF-8, y comprueba que ambas contraseñas coincidan.";
      return;
    }
    this.error = "";
    this.loading = true;
    try {
      const { password, confirmacionPassword } = this.form.getRawValue();
      await this.service.restablecer(
        this.token,
        password,
        confirmacionPassword,
      );
      this.token = "";
      this.form.reset();
      this.auth.limpiarSesionLocal();
      this.exito = true;
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 400) {
        this.error =
          "No se pudo restablecer. Comprueba que la contraseña sea nueva o solicita otro enlace si venció.";
      } else {
        this.error =
          "No se pudo actualizar la contraseña. Inténtalo nuevamente en unos minutos.";
      }
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }
}

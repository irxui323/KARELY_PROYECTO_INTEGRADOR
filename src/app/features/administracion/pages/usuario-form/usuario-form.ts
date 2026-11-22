import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import {
  AdministracionRequest,
  RolCatalogo,
} from "../../models/administracion.model";
import { AdministracionService } from "../../services/administracion-service";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FeatureNav],
  templateUrl: "./usuario-form.html",
  styleUrl: "./usuario-form.css",
})
export class UsuarioForm implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  guardando = false;

  private readonly router = inject(Router);
  constructor() {
    this.nuevo = {};
  }
  private administracionService = inject(AdministracionService);
  error = "";
  exito = "";
  roles: RolCatalogo[] = [];
  readonly nuevoGroup = new FormGroup({
    idRol: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    username: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    correo: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(12)],
    }),
  });
  get nuevo(): AdministracionRequest {
    return this.nuevoGroup.getRawValue();
  }
  set nuevo(value: AdministracionRequest) {
    this.nuevoGroup.reset(value);
  }
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        this.roles = await firstValueFrom(this.administracionService.roles());
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async crearUsuario() {
    if (this.guardando) return;
    this.guardando = true;
    try {
      if (this.nuevoGroup.invalid) {
        this.nuevoGroup.markAllAsTouched();
        this.exito = "";
        this.error =
          "Completa el rol, el usuario, un correo válido y una contraseña de al menos 12 caracteres.";
        return;
      }
      this.error = "";
      try {
        await firstValueFrom(
          this.administracionService.crearUsuario(this.nuevo),
        );
        this.exito = "Usuario creado";
        this.nuevo = {};
        void this.router.navigateByUrl("/admin");
        await this.cargar();
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
}

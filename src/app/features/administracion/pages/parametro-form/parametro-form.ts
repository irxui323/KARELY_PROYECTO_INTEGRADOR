import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import {
  AdministracionAccion,
  AdministracionRequest,
  Parametro,
} from "../../models/administracion.model";
import { AdministracionService } from "../../services/administracion-service";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FeatureNav],
  templateUrl: "./parametro-form.html",
  styleUrl: "./parametro-form.css",
})
export class ParametroForm implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  guardando = false;
  constructor() {
    this.config = { nombre: "", valor: "" };
  }
  private administracionService = inject(AdministracionService);
  error = "";
  exito = "";
  parametros: Parametro[] = [];
  readonly configGroup = new FormGroup({
    nombre: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    valor: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  get config(): AdministracionRequest {
    return this.configGroup.getRawValue();
  }
  set config(value: AdministracionRequest) {
    this.configGroup.reset(value);
  }
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        this.parametros = await firstValueFrom(
          this.administracionService.parametros(),
        );
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async ejecutar(a: AdministracionAccion, d: AdministracionRequest) {
    if (this.guardando) return;
    this.guardando = true;
    try {
      this.configGroup.patchValue(d);
      if (this.configGroup.invalid) {
        this.configGroup.markAllAsTouched();
        this.exito = "";
        this.error = "Selecciona el parámetro e introduce su valor.";
        return;
      }
      this.error = "";
      this.exito = "";
      try {
        await firstValueFrom(this.administracionService.ejecutar(a, d));
        this.exito = "Actualización guardada";
        await this.cargar();
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
  cambiarParametro() {
    this.ejecutar("parametro-cambiar", this.config);
  }
}

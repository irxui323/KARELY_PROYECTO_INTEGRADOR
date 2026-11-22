import { ChangeDetectorRef, Component, inject } from "@angular/core";
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
} from "../../models/administracion.model";
import { AdministracionService } from "../../services/administracion-service";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FeatureNav],
  templateUrl: "./catalogo-form.html",
  styleUrl: "./catalogo-form.css",
})
export class CatalogoForm {
  private readonly changeDetector = inject(ChangeDetectorRef);
  guardando = false;
  constructor() {
    this.esp = {};
    this.cons = {};
    this.franja = {};
  }
  private administracionService = inject(AdministracionService);
  error = "";
  exito = "";
  readonly espGroup = new FormGroup({
    nombre: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    precioConsulta: new FormControl<number | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  get esp(): AdministracionRequest {
    return this.espGroup.getRawValue();
  }
  set esp(value: AdministracionRequest) {
    this.espGroup.reset(value);
  }
  readonly consGroup = new FormGroup({
    nombre: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    ubicacion: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
    }),
  });
  get cons(): AdministracionRequest {
    return this.consGroup.getRawValue();
  }
  set cons(value: AdministracionRequest) {
    this.consGroup.reset(value);
  }
  readonly franjaGroup = new FormGroup({
    horaInicio: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    horaFin: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  get franja(): AdministracionRequest {
    return this.franjaGroup.getRawValue();
  }
  set franja(value: AdministracionRequest) {
    this.franjaGroup.reset(value);
  }
  async ejecutar(a: AdministracionAccion, d: AdministracionRequest) {
    if (this.guardando) return;
    this.guardando = true;
    try {
      this.error = "";
      this.exito = "";
      try {
        await firstValueFrom(this.administracionService.ejecutar(a, d));
        this.exito = "Actualización guardada";
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
}

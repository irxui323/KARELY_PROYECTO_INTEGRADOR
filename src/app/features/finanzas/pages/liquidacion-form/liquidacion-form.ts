import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ModuleHeader } from "../../../../shared/components/module-header/module-header";
import { SiPermiso } from "../../../../shared/directives/si-permiso";
import { Doctor } from "../../../doctores/models/doctores.model";
import { DoctorService } from "../../../doctores/services/doctores-service";
import { FinanzasService } from "../../services/finanzas-service";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FeatureNav, SiPermiso, ModuleHeader],
  templateUrl: "./liquidacion-form.html",
  styleUrl: "./liquidacion-form.css",
})
export class LiquidacionForm implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly doctoresService = inject(DoctorService);
  private readonly finanzasService = inject(FinanzasService);
  guardando = false;
  error = "";
  exito = "";
  doctores: Doctor[] = [];

  readonly liqGroup = new FormGroup({
    idDoctor: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    fechaInicio: new FormControl("", {
      nonNullable: true,
      validators: Validators.required,
    }),
    fechaFin: new FormControl("", {
      nonNullable: true,
      validators: Validators.required,
    }),
    monto: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
    ]),
    metodoPago: new FormControl("TRANSFERENCIA", {
      nonNullable: true,
      validators: Validators.required,
    }),
  }, {
    validators: (form) => {
      const inicio = form.get("fechaInicio")?.value;
      const fin = form.get("fechaFin")?.value;
      return inicio && fin && fin < inicio ? { periodoInvalido: true } : null;
    },
  });

  ngOnInit() {
    void this.cargar();
  }

  async cargar() {
    this.error = "";
    try {
      this.doctores = await firstValueFrom(this.doctoresService.listar());
    } catch (error) {
      this.error = errorText(error);
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  async registrarPago() {
    if (this.guardando) return;
    this.error = "";
    this.exito = "";
    const { idDoctor, monto, fechaInicio, fechaFin, metodoPago } =
      this.liqGroup.getRawValue();
    if (this.liqGroup.hasError("periodoInvalido")) {
      this.liqGroup.markAllAsTouched();
      this.error = "La fecha de fin debe ser igual o posterior a la fecha de inicio.";
      return;
    }
    if (
      this.liqGroup.invalid ||
      idDoctor === null ||
      monto === null ||
      !Number.isFinite(monto)
    ) {
      this.liqGroup.markAllAsTouched();
      this.error = "Completa los datos del médico, el periodo y el pago.";
      return;
    }
    if (fechaInicio > fechaFin) {
      this.error =
        "La fecha de fin debe ser igual o posterior a la fecha de inicio.";
      return;
    }

    this.guardando = true;
    try {
      const resultado = await firstValueFrom(
        this.finanzasService.pagar({
          idDoctor,
          fechaInicio,
          fechaFin,
          monto,
          metodoPago,
        }),
      );
      this.exito = "Operación realizada correctamente";
      this.liqGroup.reset();
    } catch (error) {
      this.error = errorText(error);
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
}

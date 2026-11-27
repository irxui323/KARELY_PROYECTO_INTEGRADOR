import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ModuleHeader } from "../../../../shared/components/module-header/module-header";
import { CitaRequest, Reserva } from "../../models/citas.model";
import { CitaService } from "../../services/citas-service";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FeatureNav, RouterLink, ModuleHeader],
  templateUrl: "./cita-confirmacion.html",
  styleUrl: "./cita-confirmacion.css",
})
export class CitaConfirmacion implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  guardando = false;

  private readonly route = inject(ActivatedRoute, { optional: true });
  constructor() {
    this.pago = { metodoPago: "EFECTIVO" };
  }
  private citasService = inject(CitaService);
  error = "";
  exito = "";
  reservas: Reserva[] = [];
  readonly pagoGroup = new FormGroup({
    idPreReserva: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    metodoPago: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^(EFECTIVO|TARJETA|YAPE|PLIN|TRANSFERENCIA)$/),
      ],
    }),
  });
  get pago(): CitaRequest {
    return this.pagoGroup.getRawValue();
  }
  set pago(value: CitaRequest) {
    this.pagoGroup.reset(value);
  }
  ngOnInit() {
    const id = Number(this.route?.snapshot.queryParamMap.get("reserva"));
    if (id > 0) this.pagoGroup.controls.idPreReserva.setValue(id);
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        this.reservas = await firstValueFrom(this.citasService.reservas());
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async confirmarPago() {
    if (this.guardando) return;
    this.guardando = true;
    try {
      this.error = "";
      this.exito = "";
      if (this.pagoGroup.invalid) {
        this.pagoGroup.markAllAsTouched();
        this.error = "Selecciona una pre-reserva vigente y el método de pago.";
        return;
      }
      try {
        const r = await firstValueFrom(
          this.citasService.ejecutar("cita-confirmar", this.pago),
        );
        this.exito = "Pago registrado y cita confirmada correctamente.";
        this.pagoGroup.controls.idPreReserva.reset(null);
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

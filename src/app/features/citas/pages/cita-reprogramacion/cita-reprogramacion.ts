import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { Consultorio, Franja } from "../../../catalogos/models/catalogos.model";
import { CatalogoService } from "../../../catalogos/services/catalogos-service";
import { Cita, CitaRequest } from "../../models/citas.model";
import { CitaService } from "../../services/citas-service";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FeatureNav],
  templateUrl: "./cita-reprogramacion.html",
  styleUrl: "./cita-reprogramacion.css",
})
export class CitaReprogramacion implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  guardando = false;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute, { optional: true });
  constructor() {
    this.repro = { aceptacionPaciente: "N" };
  }
  private citasService = inject(CitaService);
  private catalogoService = inject(CatalogoService);
  error = "";
  exito = "";
  consultorios: Consultorio[] = [];
  franjas: Franja[] = [];
  citas: Cita[] = [];
  readonly reproGroup = new FormGroup({
    idCita: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fechaNueva: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idFranjaNueva: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idConsultorioNuevo: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    motivo: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    aceptacionPaciente: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  get repro(): CitaRequest {
    return this.reproGroup.getRawValue();
  }
  set repro(value: CitaRequest) {
    this.reproGroup.reset(value);
  }
  ngOnInit() {
    const id = Number(this.route?.snapshot.paramMap.get("id"));
    if (id > 0) this.reproGroup.controls.idCita.setValue(id);
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        [this.citas, this.consultorios, this.franjas] = await Promise.all([
          firstValueFrom(this.citasService.listar()),
          firstValueFrom(this.catalogoService.consultorios()),
          firstValueFrom(this.catalogoService.franjas()),
        ]);
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async reprogramar() {
    if (this.guardando) return;
    this.guardando = true;
    try {
      if (this.reproGroup.invalid) {
        this.reproGroup.markAllAsTouched();
        this.exito = "";
        this.error = "Completa los datos obligatorios de la reprogramación.";
        return;
      }
      this.error = "";
      try {
        await firstValueFrom(
          this.citasService.ejecutar("cita-reprogramar", this.repro),
        );
        this.exito = "Cita reprogramada sin nuevo cobro";
        await this.cargar();
        void this.router.navigateByUrl("/citas");
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
}

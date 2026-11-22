import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../../../core/auth/auth-service";
import { errorText } from "../../../../core/utils/http-error";
import { fechaActual, fechaNoPasada } from "../../../../core/utils/fecha";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ControlDisabled } from "../../../../shared/directives/control-disabled";
import {
  Franja,
  Especialidad,
} from "../../../catalogos/models/catalogos.model";
import { CatalogoService } from "../../../catalogos/services/catalogos-service";
import {
  Disponibilidad,
  Doctor,
  DoctorRequest,
} from "../../../doctores/models/doctores.model";
import { DoctorService } from "../../../doctores/services/doctores-service";
type PestanaMedica = "citas" | "horarios" | "consultas";
@Component({
  standalone: true,
  imports: [ControlDisabled, ReactiveFormsModule, FeatureNav],
  templateUrl: "./disponibilidad-form.html",
  styleUrl: "./disponibilidad-form.css",
})
export class DisponibilidadForm implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  guardando = false;
  get fechaMinima() {
    return fechaActual();
  }
  constructor() {
    this.horario = { fecha: "", idFranja: null };
  }
  private doctoresService = inject(DoctorService);
  private catalogoService = inject(CatalogoService);
  private auth = inject(AuthService);
  error = "";
  exito = "";
  cargando = false;
  procesando = false;
  doctor: Doctor | undefined;
  franjas: Franja[] = [];
  especialidades: Especialidad[] = [];
  prepararClasificacion(h: Disponibilidad) {
    this.horario = {
      idDoctor: this.doctor?.idDoctor,
      fecha: h.fechaTurno,
      idFranja: h.idFranja,
      idEspecialidad: null,
    };
    this.exito =
      "Selecciona la especialidad y guarda para clasificar este horario pendiente.";
  }
  disponibles: Disponibilidad[] = [];
  readonly horarioGroup = new FormGroup({
    idEspecialidad: new FormControl<number | null | undefined>(undefined, {
      validators: [Validators.required],
    }),
    idDoctor: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
    }),
    fecha: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required, fechaNoPasada],
    }),
    idFranja: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  get horario(): DoctorRequest {
    return this.horarioGroup.getRawValue();
  }
  set horario(value: DoctorRequest) {
    this.horarioGroup.reset(value);
  }
  get nombreDoctor(): string {
    return this.doctor
      ? `${this.doctor.nombres} ${this.doctor.apellidos}`
      : "Sin médico asociado";
  }
  get puedeRegistrarHorario(): boolean {
    return (
      !!this.doctor &&
      this.doctor.estado === "ACTIVO" &&
      this.doctor.estadoDocumentacion === "COMPLETO"
    );
  }
  ngOnInit() {
    void this.cargar();
  }
  fechaLegible(valor: unknown): string {
    if (valor == null) return "—";
    const txt = String(valor).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) {
      const [anio, mes, dia] = txt.split("-");
      return `${dia}/${mes}/${anio}`;
    }
    return String(valor);
  }
  async cargar() {
    try {
      if (this.cargando) return;
      this.cargando = true;
      this.error = "";
      try {
        [this.doctores, this.franjas, this.disponibles] = await Promise.all([
          firstValueFrom(this.doctoresService.listar()),
          firstValueFrom(this.catalogoService.franjas()),
          firstValueFrom(this.doctoresService.disponibilidades()),
        ]);
        this.doctor = this.doctores.find(
          (d) => Number(d.idUsuario) === this.auth.session()?.idUsuario,
        );
        this.disponibles = this.disponibles.filter(
          (d) => d.idDoctor === this.doctor?.idDoctor,
        );
        this.horarioGroup.controls.idDoctor.setValue(this.doctor?.idDoctor);
        this.especialidades = this.doctor
          ? (
              await firstValueFrom(
                this.doctoresService.especialidades(this.doctor.idDoctor),
              )
            ).filter((e) => e.estado === "ACTIVO")
          : [];
      } catch (e) {
        this.error = errorText(e);
      } finally {
        this.cargando = false;
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async guardarHorario(): Promise<void> {
    if (this.guardando) return;
    this.guardando = true;
    try {
      this.error = "";
      this.exito = "";
      this.horarioGroup.controls.fecha.updateValueAndValidity();
      if (this.horarioGroup.controls.fecha.hasError("fechaPasada")) {
        this.horarioGroup.controls.fecha.markAsTouched();
        this.error = "La fecha del horario no puede ser anterior a hoy.";
        return;
      }
      if (
        !this.puedeRegistrarHorario ||
        this.horarioGroup.controls.fecha.invalid ||
        !this.horario.idEspecialidad ||
        !this.horario.idFranja
      ) {
        this.error =
          "Selecciona tu especialidad, una fecha y una franja. El médico debe estar activo y validado.";
        return;
      }
      this.procesando = true;
      try {
        await firstValueFrom(
          this.doctoresService.ejecutar("disponibilidad-registrar", {
            idDoctor: this.doctor?.idDoctor,
            fecha: this.horario.fecha,
            idFranja: this.horario.idFranja,
            idEspecialidad: this.horario.idEspecialidad,
          }),
        );
        this.exito = "Disponibilidad registrada correctamente.";
        this.horarioGroup.controls.idFranja.setValue(null);
        await this.cargar();
      } catch (e) {
        this.error = errorText(e);
      } finally {
        this.procesando = false;
      }
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
  doctores: Doctor[] = [];
}

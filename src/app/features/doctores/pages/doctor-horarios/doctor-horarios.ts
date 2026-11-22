import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { fechaActual, fechaNoPasada } from "../../../../core/utils/fecha";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { SiPermiso } from "../../../../shared/directives/si-permiso";
import {
  Franja,
  Especialidad,
} from "../../../catalogos/models/catalogos.model";
import { ControlDisabled } from "../../../../shared/directives/control-disabled";
import { CatalogoService } from "../../../catalogos/services/catalogos-service";
import {
  Disponibilidad,
  Doctor,
  DoctorAccion,
  DoctorRequest,
} from "../../models/doctores.model";
import { DoctorService } from "../../services/doctores-service";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FeatureNav, SiPermiso, ControlDisabled],
  templateUrl: "./doctor-horarios.html",
  styleUrl: "./doctor-horarios.css",
})
export class DoctorHorarios implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  guardando = false;
  get fechaMinima() {
    return fechaActual();
  }
  constructor() {
    this.horario = {};
  }
  private doctoresService = inject(DoctorService);
  private catalogoService = inject(CatalogoService);
  doctores: Doctor[] = [];
  franjas: Franja[] = [];
  especialidades: Especialidad[] = [];
  cargandoEspecialidades = false;
  private cargaEspecialidades = 0;
  async cargarEspecialidades() {
    const carga = ++this.cargaEspecialidades;
    const id = this.horario.idDoctor;
    this.horarioGroup.controls.idEspecialidad.reset(null);
    this.especialidades = [];
    this.cargandoEspecialidades = !!id;
    try {
      if (!id) return;
      const especialidades = await firstValueFrom(
        this.doctoresService.especialidades(id),
      );
      if (carga === this.cargaEspecialidades)
        this.especialidades = especialidades.filter(
          (e) => e.estado === "ACTIVO",
        );
    } catch (e) {
      if (carga === this.cargaEspecialidades) this.error = errorText(e);
    } finally {
      if (carga === this.cargaEspecialidades)
        this.cargandoEspecialidades = false;
      this.changeDetector.markForCheck();
    }
  }
  async prepararClasificacion(h: Disponibilidad) {
    this.horario = {
      idDoctor: h.idDoctor,
      fecha: h.fechaTurno,
      idFranja: h.idFranja,
      idEspecialidad: null,
    };
    await this.cargarEspecialidades();
    this.exito =
      "Selecciona la especialidad y guarda para clasificar este horario pendiente.";
  }
  disponibilidades: Disponibilidad[] = [];
  error = "";
  exito = "";
  readonly horarioGroup = new FormGroup({
    idEspecialidad: new FormControl<number | null | undefined>(undefined, {
      validators: [Validators.required],
    }),
    idDoctor: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
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
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        [this.doctores, this.franjas, this.disponibilidades] =
          await Promise.all([
            firstValueFrom(this.doctoresService.listar()),
            firstValueFrom(this.catalogoService.franjas()),
            firstValueFrom(this.doctoresService.disponibilidades()),
          ]);
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async run(
    action: DoctorAccion,
    data: DoctorRequest,
    msg = "Operación realizada",
  ) {
    try {
      this.error = "";
      this.exito = "";
      try {
        await firstValueFrom(this.doctoresService.ejecutar(action, data));
        this.exito = msg;
        await this.cargar();
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async registrarHorario() {
    if (this.guardando || this.cargandoEspecialidades) return;
    this.guardando = true;
    try {
      this.horarioGroup.controls.fecha.updateValueAndValidity();
      if (this.horarioGroup.controls.fecha.hasError("fechaPasada")) {
        this.horarioGroup.controls.fecha.markAsTouched();
        this.exito = "";
        this.error = "La fecha del horario no puede ser anterior a hoy.";
        return;
      }
      if (this.horarioGroup.invalid) {
        this.horarioGroup.markAllAsTouched();
        this.exito = "";
        this.error =
          "Selecciona el doctor, la especialidad, la fecha y la franja.";
        return;
      }
      await this.run(
        "disponibilidad-registrar",
        this.horario,
        "Horario registrado",
      );
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
}

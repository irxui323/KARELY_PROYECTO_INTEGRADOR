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
import { ControlDisabled } from "../../../../shared/directives/control-disabled";
import { Especialidad } from "../../../catalogos/models/catalogos.model";
import { CatalogoService } from "../../../catalogos/services/catalogos-service";
import {
  Doctor,
  DoctorAccion,
  DoctorRequest,
} from "../../models/doctores.model";
import { DoctorService } from "../../services/doctores-service";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FeatureNav, ControlDisabled],
  templateUrl: "./doctor-especialidades.html",
  styleUrl: "./doctor-especialidades.css",
})
export class DoctorEspecialidades implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  guardando = false;
  constructor() {
    this.especialidadForm = {};
  }
  private doctoresService = inject(DoctorService);
  private catalogoService = inject(CatalogoService);
  doctores: Doctor[] = [];
  especialidades: Especialidad[] = [];
  asignadas: Especialidad[] = [];
  porQuitar: Especialidad | null = null;
  cargandoAsignadas = false;
  private cargaAsignadas = 0;
  get disponibles() {
    return this.especialidades.filter(
      (e) =>
        e.estado === "ACTIVO" &&
        !this.asignadas.some((a) => a.idEspecialidad === e.idEspecialidad),
    );
  }
  error = "";
  exito = "";
  readonly especialidadFormGroup = new FormGroup({
    idDoctor: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idEspecialidad: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  get especialidadForm(): DoctorRequest {
    return this.especialidadFormGroup.getRawValue();
  }
  set especialidadForm(value: DoctorRequest) {
    this.especialidadFormGroup.reset(value);
  }
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        [this.doctores, this.especialidades] = await Promise.all([
          firstValueFrom(this.doctoresService.listar()),
          firstValueFrom(this.catalogoService.especialidades()),
        ]);
        await this.cargarAsignadas();
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async cargarAsignadas() {
    const carga = ++this.cargaAsignadas;
    const doctor = this.especialidadForm.idDoctor;
    this.porQuitar = null;
    this.asignadas = [];
    this.especialidadFormGroup.controls.idEspecialidad.reset();
    this.cargandoAsignadas = !!doctor;
    try {
      if (!doctor) return;
      const asignadas = await firstValueFrom(
        this.doctoresService.especialidades(doctor),
      );
      if (
        carga === this.cargaAsignadas &&
        doctor === this.especialidadForm.idDoctor
      )
        this.asignadas = asignadas;
    } catch (e) {
      if (carga === this.cargaAsignadas) this.error = errorText(e);
    } finally {
      if (carga === this.cargaAsignadas) this.cargandoAsignadas = false;
      this.changeDetector.markForCheck();
    }
  }
  confirmarQuitar(especialidad: Especialidad) {
    if (this.guardando || this.cargandoAsignadas) return;
    this.error = "";
    this.exito = "";
    this.porQuitar = especialidad;
  }
  async quitarEspecialidad() {
    const doctor = this.especialidadForm.idDoctor;
    const especialidad = this.porQuitar;
    if (!doctor || !especialidad || this.guardando) return;
    this.guardando = true;
    this.error = "";
    this.exito = "";
    try {
      await firstValueFrom(
        this.doctoresService.quitarEspecialidad(
          doctor,
          especialidad.idEspecialidad,
        ),
      );
      this.exito = "Especialidad retirada del doctor";
      await this.cargarAsignadas();
    } catch (e) {
      this.error = errorText(e);
    } finally {
      this.porQuitar = null;
      this.guardando = false;
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
  async asignarEspecialidad() {
    if (this.guardando) return;
    this.guardando = true;
    try {
      if (this.especialidadFormGroup.invalid) {
        this.especialidadFormGroup.markAllAsTouched();
        this.exito = "";
        this.error = "Selecciona un doctor y una especialidad.";
        return;
      }
      await this.run(
        "doctor-especialidad",
        this.especialidadForm,
        "Especialidad asignada",
      );
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
}

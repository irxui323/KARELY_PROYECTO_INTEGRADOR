import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { fechaActual, fechaNoPasada } from "../../../../core/utils/fecha";
import { CalendarioDisponibilidad } from "../../../../shared/components/calendario-disponibilidad/calendario-disponibilidad";
import { ControlDisabled } from "../../../../shared/directives/control-disabled";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { Consultorio } from "../../../catalogos/models/catalogos.model";
import { CatalogoService } from "../../../catalogos/services/catalogos-service";
import { Cita, CitaRequest, TurnoDisponible } from "../../models/citas.model";
import { CitaService } from "../../services/citas-service";

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FeatureNav,
    CalendarioDisponibilidad,
    ControlDisabled,
  ],
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
  turnos: TurnoDisponible[] = [];
  consultando = false;
  cargandoMes = false;
  errorCalendario = "";
  mes = fechaActual().slice(0, 7);
  cantidades: Record<string, number> = {};
  private secuenciaTurnos = 0;
  private secuenciaMes = 0;
  get fechaMinima() {
    return fechaActual();
  }
  get citaOriginal() {
    return this.citas.find(
      (c) => Number(c.idCita) === Number(this.repro.idCita),
    );
  }
  get citasProgramadas() {
    return this.citas.filter(
      (c) =>
        c.estadoCita === "PROGRAMADA" &&
        !c.reprogramaciones &&
        c.fechaCita.slice(0, 10) >= this.fechaMinima,
    );
  }
  get turnoValido() {
    return this.turnos.some(
      (t) => Number(t.idFranja) === Number(this.repro.idFranjaNueva),
    );
  }

  citas: Cita[] = [];
  readonly reproGroup = new FormGroup({
    idCita: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fechaNueva: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required, fechaNoPasada],
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
      validators: [Validators.required, Validators.pattern("S")],
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
        [this.citas, this.consultorios] = await Promise.all([
          firstValueFrom(this.citasService.listar()),
          firstValueFrom(this.catalogoService.consultorios()),
        ]);
        this.consultorios = this.consultorios.filter(
          (c) => c.estado === "ACTIVO",
        );
        await this.cambiarCita();
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async cambiarCita() {
    this.reproGroup.controls.fechaNueva.setValue("");
    this.reproGroup.controls.idFranjaNueva.setValue(null);
    this.reproGroup.controls.idConsultorioNuevo.setValue(
      this.citaOriginal?.idConsultorio ?? null,
    );
    this.turnos = [];
    ++this.secuenciaTurnos;
    this.consultando = false;
    await this.cargarMes(this.mes);
  }
  async cambiarConsultorio() {
    await Promise.all([this.actualizarTurnos(), this.cargarMes(this.mes)]);
  }
  async cargarMes(mes: string) {
    const seq = ++this.secuenciaMes;
    this.mes = mes;
    this.cantidades = {};
    this.errorCalendario = "";
    const cita = this.citaOriginal;
    const consultorio = this.repro.idConsultorioNuevo;
    if (!cita?.idEspecialidad || !consultorio) {
      this.cargandoMes = false;
      return;
    }
    this.cargandoMes = true;
    try {
      const dias = await firstValueFrom(
        this.citasService.disponibilidadMes(
          cita.idEspecialidad,
          mes,
          consultorio,
        ),
      );
      if (seq !== this.secuenciaMes) return;
      this.cantidades = Object.fromEntries(
        dias
          .filter((d) => Number(d.idDoctor) === Number(cita.idDoctor))
          .map((d) => [d.fecha, d.total]),
      );
    } catch (e) {
      if (seq === this.secuenciaMes) this.errorCalendario = errorText(e);
    } finally {
      if (seq === this.secuenciaMes) this.cargandoMes = false;
      this.changeDetector.markForCheck();
    }
  }
  async elegirFecha(fecha: string) {
    if (fecha < this.fechaMinima || !this.cantidades[fecha]) return;
    this.reproGroup.controls.fechaNueva.setValue(fecha);
    await this.actualizarTurnos();
  }
  async actualizarTurnos() {
    const seq = ++this.secuenciaTurnos;
    this.turnos = [];
    this.reproGroup.controls.idFranjaNueva.setValue(null);
    const cita = this.citaOriginal,
      fecha = this.repro.fechaNueva,
      consultorio = this.repro.idConsultorioNuevo;
    if (
      !cita?.idEspecialidad ||
      !fecha ||
      fecha < this.fechaMinima ||
      !consultorio
    ) {
      this.consultando = false;
      return;
    }
    this.consultando = true;
    try {
      const doctores = await firstValueFrom(
        this.citasService.disponibilidad(
          cita.idEspecialidad,
          fecha,
          consultorio,
        ),
      );
      if (seq !== this.secuenciaTurnos) return;
      this.turnos =
        doctores.find((d) => Number(d.idDoctor) === Number(cita.idDoctor))
          ?.turnos ?? [];
    } catch (e) {
      if (seq === this.secuenciaTurnos) this.error = errorText(e);
    } finally {
      if (seq === this.secuenciaTurnos) this.consultando = false;
      this.changeDetector.markForCheck();
    }
  }
  async reprogramar() {
    if (this.guardando) return;
    this.guardando = true;
    try {
      if (
        this.reproGroup.invalid ||
        this.consultando ||
        !this.turnoValido ||
        !this.citasProgramadas.some(
          (c) => Number(c.idCita) === Number(this.repro.idCita),
        )
      ) {
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
        await Promise.all([this.actualizarTurnos(), this.cargarMes(this.mes)]);
      }
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
}

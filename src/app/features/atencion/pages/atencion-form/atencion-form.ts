import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../../../core/auth/auth-service";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ControlDisabled } from "../../../../shared/directives/control-disabled";
import { Cita } from "../../../citas/models/citas.model";
import { CitaService } from "../../../citas/services/citas-service";
import { Doctor } from "../../../doctores/models/doctores.model";
import { DoctorService } from "../../../doctores/services/doctores-service";
import {
  Atencion,
  AtencionAccion,
  AtencionRequest,
} from "../../models/atencion.model";
import { AtencionService } from "../../services/atencion-service";
type PestanaMedica = "citas" | "horarios" | "consultas";
@Component({
  standalone: true,
  imports: [ControlDisabled, ReactiveFormsModule, FeatureNav],
  templateUrl: "./atencion-form.html",
  styleUrl: "./atencion-form.css",
})
export class AtencionForm implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  guardando = false;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute, { optional: true });
  constructor() {
    this.medico = { idCita: null, medioEntrega: "EMAIL" };
  }
  private doctoresService = inject(DoctorService);
  private citasService = inject(CitaService);
  private atencionService = inject(AtencionService);
  private auth = inject(AuthService);
  error = "";
  exito = "";
  cargando = false;
  procesando = false;
  citas: Cita[] = [];
  doctor: Doctor | undefined;
  atenciones: Atencion[] = [];
  readonly medicoGroup = new FormGroup({
    idCita: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
    }),
    idReceta: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
    }),
    medioEntrega: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
    }),
    diagnostico: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
    }),
    observaciones: new FormControl<string | null | undefined>(undefined, {
      nonNullable: true,
    }),
    medicamento: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
    }),
    dosis: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
    }),
    frecuencia: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
    }),
    duracion: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
    }),
    observacionesMedicamento: new FormControl<string | undefined | null>(
      undefined,
      {
        nonNullable: true,
      },
    ),
    indicaciones: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
    }),
    numeroRecibo: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
    }),
  });
  get medico(): AtencionRequest {
    return this.medicoGroup.getRawValue();
  }
  set medico(value: AtencionRequest) {
    this.medicoGroup.reset(value);
  }
  get esAdministradora(): boolean { return this.auth.session()?.rol === "ADMINISTRADORA"; }
  get nombreDoctor(): string {
    if (this.esAdministradora) return "Todos los médicos";
    return this.doctor
      ? `${this.doctor.nombres} ${this.doctor.apellidos}`
      : "Sin médico asociado";
  }
  get citasEnAtencion(): Cita[] {
    return this.citas.filter((c) => c.estadoCita === "EN_ATENCION");
  }
  get citaSeleccionada(): Cita | undefined {
    return this.citasEnAtencion.find(
      (c) => Number(c.idCita) === Number(this.medico.idCita),
    );
  }
  get citaListaParaAtender(): boolean {
    return (this.esAdministradora || !!this.doctor) && !!this.citaSeleccionada;
  }
  get atencionActual(): Atencion | undefined {
    return this.atenciones.find(
      (a) => Number(a.idCita) === Number(this.medico.idCita),
    );
  }
  get atencionAbierta(): boolean {
    return (
      this.citaListaParaAtender && this.atencionActual?.estado === "ABIERTA"
    );
  }
  get estadoAtencionActual(): string {
    if (!this.medico.idCita) return "Sin cita seleccionada";
    if (!this.citaSeleccionada) return "La cita no está habilitada";
    if (this.atencionActual?.estado === "ABIERTA") return "Atención abierta";
    if (this.atencionActual?.estado === "CERRADA") return "Atención cerrada";
    return "Pendiente de inicio";
  }
  async ngOnInit() {
    try {
      await this.cargar();
      const id = Number(this.route?.snapshot.queryParamMap.get("cita"));
      if (id > 0) this.medico = { idCita: id, medioEntrega: "EMAIL" };
    } finally {
      this.changeDetector.markForCheck();
    }
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
        [this.citas, this.doctores, this.atenciones] = await Promise.all([
          firstValueFrom(this.citasService.listar()),
          firstValueFrom(this.doctoresService.listar()),
          firstValueFrom(this.atencionService.listar()),
        ]);
        this.doctor = this.doctores.find(
          (d) => Number(d.idUsuario) === this.auth.session()?.idUsuario,
        );
      } catch (e) {
        this.error = errorText(e);
      } finally {
        this.cargando = false;
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  limpiarDetalleConsulta(): void {
    const id = this.medico.idCita;
    this.medico = { idCita: id, medioEntrega: "EMAIL" };
    this.error = "";
    this.exito = "";
  }
  async accion(accion: AtencionAccion): Promise<void> {
    if (this.guardando) return;
    this.guardando = true;
    try {
      this.error = "";
      this.exito = "";
      if (!this.citaListaParaAtender) {
        this.error = "Debes seleccionar una cita habilitada para atención.";
        return;
      }
      this.procesando = true;
      try {
        const datos: AtencionRequest = { ...this.medico };

        if (accion === "medicamento-agregar") {
          datos.observaciones = this.medico.observacionesMedicamento ?? null;
        }
        const respuesta = await firstValueFrom(
          this.atencionService.ejecutar(accion, datos),
        );
        if (accion === "receta-crear" && respuesta.id != null) {
          this.medicoGroup.controls.idReceta.setValue(respuesta.id);
        }
        if (accion === "medicamento-agregar") {
          this.medicoGroup.controls.medicamento.setValue("");
          this.medicoGroup.controls.dosis.setValue("");
          this.medicoGroup.controls.frecuencia.setValue("");
          this.medicoGroup.controls.duracion.setValue("");
          this.medicoGroup.controls.observacionesMedicamento.setValue("");
        }
        const mensajes: Record<string, string> = {
          "atencion-iniciar": "Atención iniciada correctamente.",
          "diagnostico-registrar": "Diagnóstico registrado correctamente.",
          "receta-crear": "Receta creada. Ahora agrega los medicamentos.",
          "medicamento-agregar": "Medicamento añadido a la receta.",
          "recibo-emitir": "Recibo emitido y registrado.",
          "recibo-entregar": "Entrega del recibo registrada.",
          "atencion-cerrar": "Atención cerrada correctamente.",
        };
        this.exito = mensajes[accion] ?? "Operación realizada.";
        await this.cargar();
        if (accion === "atencion-cerrar") {
          this.medico = { idCita: null, medioEntrega: "EMAIL" };
          void this.router.navigateByUrl("/doctor");
        }
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

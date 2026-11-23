import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText, formErrorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ControlDisabled } from "../../../../shared/directives/control-disabled";
import { Paciente, PacienteRequest } from "../../models/pacientes.model";
import { PacienteService } from "../../services/pacientes-service";
import { CatalogoService } from "../../../catalogos/services/catalogos-service";

@Component({
  standalone: true,
  imports: [ControlDisabled, ReactiveFormsModule, RouterLink, FeatureNav],
  templateUrl: "./paciente-form.html",
  styleUrl: "./paciente-form.css",
})
export class PacienteForm implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute, { optional: true });
  constructor() {
    this.form = {};
  }
  private pacientesService = inject(PacienteService);
  private catalogosService = inject(CatalogoService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  buscar = "";
  error = "";
  exito = "";
  cargando = false;
  consultandoDni = false;
  readonly formGroup = new FormGroup({
    idPaciente: new FormControl<number | undefined | null>(undefined, {
      nonNullable: true,
    }),
    tipoDocumento: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(12)],
    }),
    numeroDocumento: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(20)],
    }),
    nombres: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)],
    }),
    apellidos: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)],
    }),
    telefono: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.maxLength(20)],
    }),
    correo: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.email, Validators.maxLength(150)],
    }),
    direccion: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.maxLength(250)],
    }),
    estado: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
    }),
    fechaNacimiento: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [(control) => {
        if (!control.value) return null;
        const parts = new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit",
        }).formatToParts(new Date());
        const part = (type: string) => parts.find((p) => p.type === type)?.value;
        const today = `${part("year")}-${part("month")}-${part("day")}`;
        return control.value > today ? { fechaFutura: true } : null;
      }],
    }),
  });
  get form(): PacienteRequest {
    return this.formGroup.getRawValue();
  }
  set form(value: PacienteRequest) {
    this.formGroup.reset(value);
  }
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        const id = this.route?.snapshot.paramMap.get("id");
        if (id) {
          const records = await firstValueFrom(this.pacientesService.listar());
          const paciente = records.find((p) => p.idPaciente === Number(id));
          if (!paciente) {
            this.error = "Paciente no encontrado";
            return;
          }
          this.editar(paciente);
        } else this.nuevo();
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  nuevo() {
    this.form = {
      tipoDocumento: "DNI",
      numeroDocumento: "",
      nombres: "",
      apellidos: "",
      fechaNacimiento: "",
      telefono: "",
      correo: "",
      direccion: "",
      estado: "ACTIVO",
    };

    this.error = "";
    this.exito = "";
  }
  editar(p: Paciente) {
    this.form = {
      idPaciente: p.idPaciente,
      tipoDocumento: p.tipoDocumento,
      numeroDocumento: p.numeroDocumento,
      nombres: p.nombres,
      apellidos: p.apellidos,
      telefono: p.telefono,
      correo: p.correo,
      direccion: p.direccion,
      estado: p.estado,
    };
  }
  async guardar() {
    try {
      if (this.cargando) return;
      if (this.formGroup.invalid) {
        this.formGroup.markAllAsTouched();
        this.exito = "";
        this.error = formErrorText(this.formGroup);
        return;
      }
      if (!this.registroDisponible) {
        this.error =
          "No se puede guardar: el paciente de esta edición no se ha cargado.";
        return;
      }
      this.error = "";
      this.exito = "";
      this.cargando = true;
      try {
        await firstValueFrom(this.pacientesService.guardar(this.form));
        this.exito = "Paciente guardado correctamente.";
        this.buscar = "";
        void this.router.navigateByUrl("/pacientes");
      } catch (e) {
        this.error = errorText(e);
        return;
      } finally {
        this.cargando = false;
        this.changeDetector.markForCheck();
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async consultarDni() {
    if (this.form.idPaciente || this.form.tipoDocumento !== "DNI") return;
    const dni = (this.form.numeroDocumento || "").trim();
    if (!/^\d{8}$/.test(dni)) return;
    this.consultandoDni = true;
    this.error = "";
    try {
      const persona = await firstValueFrom(this.catalogosService.consultarDni(dni));
      this.formGroup.patchValue({
        nombres: persona.nombres,
        apellidos: `${persona.apellidoPaterno} ${persona.apellidoMaterno}`.trim(),
      });
    } catch (e) {
      this.error = errorText(e);
    } finally {
      this.consultandoDni = false;
      this.changeDetector.markForCheck();
    }
  }
  get registroDisponible(): boolean {
    const id = this.route?.snapshot.paramMap.get("id");
    return !id || Number(id) === this.form.idPaciente;
  }
}

import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ControlDisabled } from "../../../../shared/directives/control-disabled";
import { SiPermiso } from "../../../../shared/directives/si-permiso";
import {
  Doctor,
  DoctorAccion,
  DoctorRequest,
} from "../../models/doctores.model";
import { DoctorService } from "../../services/doctores-service";

@Component({
  standalone: true,
  imports: [
    ControlDisabled,
    ReactiveFormsModule,
    RouterLink,
    FeatureNav,
    SiPermiso,
  ],
  templateUrl: "./doctor-form.html",
  styleUrl: "./doctor-form.css",
})
export class DoctorForm implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  guardando = false;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute, { optional: true });
  constructor() {
    this.doctorForm = {};
  }
  private doctoresService = inject(DoctorService);
  error = "";
  exito = "";
  tipoDocumento = "DNI";
  readonly doctorFormGroup = new FormGroup({
    idDoctor: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
    }),
    tipoDocumento: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    numeroDocumento: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    nombres: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    apellidos: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    telefono: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
    }),
    correo: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.email],
    }),
    estado: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
    }),
  });
  get doctorForm(): DoctorRequest {
    return this.doctorFormGroup.getRawValue();
  }
  set doctorForm(value: DoctorRequest) {
    this.doctorFormGroup.reset(value);
  }
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        const id = this.route?.snapshot.paramMap.get("id");
        if (id) {
          const records = await firstValueFrom(this.doctoresService.listar());
          const doctor = records.find((d) => d.idDoctor === Number(id));
          if (!doctor) {
            this.error = "Doctor no encontrado";
            return;
          }
          this.editar(doctor);
        } else this.nuevo();
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  nuevo() {
    this.doctorForm = {
      tipoDocumento: "DNI",
      numeroDocumento: "",
      nombres: "",
      apellidos: "",
      telefono: "",
      correo: "",
      estado: "ACTIVO",
    };
  }
  editar(d: Doctor) {
    this.doctorForm = {
      idDoctor: d.idDoctor,
      tipoDocumento: d.tipoDocumento,
      numeroDocumento: d.numeroDocumento,
      nombres: d.nombres,
      apellidos: d.apellidos,
      telefono: d.telefono,
      correo: d.correo,
      estado: d.estado,
    };
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
  async guardarDoctor() {
    if (this.guardando) return;
    this.guardando = true;
    try {
      if (this.doctorFormGroup.invalid) {
        this.doctorFormGroup.markAllAsTouched();
        this.exito = "";
        this.error = "Completa los campos obligatorios y revisa el correo.";
        return;
      }
      if (!this.registroDisponible) {
        this.error =
          "No se puede guardar: el doctor de esta edición no se ha cargado.";
        return;
      }
      await this.run(
        this.doctorForm.idDoctor ? "doctor-editar" : "doctor-crear",
        this.doctorForm,
        "Doctor registrado",
      );
      if (!this.error) void this.router.navigateByUrl("/doctores");
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
  get registroDisponible(): boolean {
    const id = this.route?.snapshot.paramMap.get("id");
    return !id || Number(id) === this.doctorForm.idDoctor;
  }
}

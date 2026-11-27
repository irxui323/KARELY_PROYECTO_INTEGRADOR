import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { errorText } from "../../../../core/utils/http-error";
import { Doctor } from "../../models/doctores.model";
import { DoctorService } from "../../services/doctores-service";
@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, FeatureNav],
  templateUrl: "./doctor-acceso.html",
})
export class DoctorAcceso implements OnInit, OnDestroy {
  private readonly service = inject(DoctorService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  doctores: Doctor[] = [];
  selectedDoctor = 0;
  readonly accesoForm = new FormGroup({
    username: new FormControl("", {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern("[A-Za-z0-9._-]{3,60}"),
      ],
    }),
  });
  get username() {
    return this.accesoForm.controls.username.value;
  }
  set username(value: string) {
    this.accesoForm.controls.username.setValue(value);
  }
  error = "";
  guardando = false;
  private activo = true;
  credenciales: {
    username: string;
    correo: string;
    passwordTemporal: string;
  } | null = null;
  get elegibles() {
    return this.doctores.filter(
      (d) => d.estadoDocumentacion === "COMPLETO" && !d.idUsuario,
    );
  }
  get doctor() {
    return this.elegibles.find((d) => d.idDoctor === this.selectedDoctor);
  }
  ngOnInit() {
    void this.cargar();
  }
  ngOnDestroy() {
    this.activo = false;
    this.credenciales = null;
  }
  cambiarDoctor() {
    this.credenciales = null;
    this.username = "";
    this.error = "";
  }
  async cargar() {
    try {
      this.doctores = await firstValueFrom(this.service.listar());
    } catch (e) {
      this.error = errorText(e);
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async generarAcceso() {
    if (this.guardando) return;
    this.credenciales = null;
    this.error = "";
    if (!this.doctor || this.accesoForm.invalid) {
      this.accesoForm.markAllAsTouched();
      this.error =
        "Selecciona un doctor y escribe un usuario de 3 a 60 caracteres: letras, números, punto, guion o guion bajo";
      return;
    }
    const id = this.selectedDoctor;
    this.guardando = true;
    try {
      const result = await firstValueFrom(
        this.service.crearAcceso(id, this.username.trim()),
      );
      if (this.activo && id === this.selectedDoctor) this.credenciales = result;
      this.doctores = this.doctores.filter((d) => d.idDoctor !== id);
    } catch (e) {
      this.error = errorText(e);
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
}

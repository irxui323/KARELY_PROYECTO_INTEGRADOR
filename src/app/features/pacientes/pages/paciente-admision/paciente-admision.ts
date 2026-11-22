import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { SiPermiso } from "../../../../shared/directives/si-permiso";
import { Cita } from "../../../citas/models/citas.model";
import { CitaService } from "../../../citas/services/citas-service";

@Component({
  standalone: true,
  imports: [FeatureNav, SiPermiso],
  templateUrl: "./paciente-admision.html",
  styleUrl: "./paciente-admision.css",
})
export class PacienteAdmision implements OnInit {
  guardando = false;

  private citasService = inject(CitaService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  citas: Cita[] = [];
  error = "";
  exito = "";
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        this.citas = await firstValueFrom(this.citasService.listar());
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async admitir(c: Cita) {
    if (this.guardando) return;
    this.guardando = true;
    try {
      try {
        await firstValueFrom(
          this.citasService.ejecutar("asistencia-registrar", {
            idCita: c.idCita,
          }),
        );
        this.exito = "Asistencia registrada.";
        this.changeDetector.markForCheck();
        await this.cargar();
      } catch (e) {
        this.error = errorText(e);
        this.changeDetector.markForCheck();
      }
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
}

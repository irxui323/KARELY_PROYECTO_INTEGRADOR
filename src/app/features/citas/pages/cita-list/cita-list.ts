import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../../../core/auth/auth-service";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { SiPermiso } from "../../../../shared/directives/si-permiso";
import { Cita } from "../../models/citas.model";
import { CitaService } from "../../services/citas-service";

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, FeatureNav, SiPermiso],
  templateUrl: "./cita-list.html",
  styleUrl: "./cita-list.css",
})
export class CitaList implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);

  private readonly router = inject(Router);
  constructor() {}
  private citasService = inject(CitaService);
  auth = inject(AuthService);
  error = "";
  exito = "";
  buscar = "";
  citas: Cita[] = [];
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
  citasFiltradas() {
    const q = this.buscar.toLowerCase();
    return this.citas.filter((c) =>
      (c.nombrePaciente + " " + c.nombreDoctor + " " + c.estadoCita)
        .toLowerCase()
        .includes(q),
    );
  }
  seleccionarReprogramar(record: Cita) {
    void this.router.navigate(["/citas", record.idCita, "reprogramar"]);
  }
}

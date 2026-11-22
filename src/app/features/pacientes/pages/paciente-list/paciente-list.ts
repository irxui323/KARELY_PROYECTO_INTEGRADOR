import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { SiPermiso } from "../../../../shared/directives/si-permiso";
import { Paciente } from "../../models/pacientes.model";
import { PacienteService } from "../../services/pacientes-service";

@Component({
  standalone: true,
  imports: [FormsModule, FeatureNav, SiPermiso],
  templateUrl: "./paciente-list.html",
  styleUrl: "./paciente-list.css",
})
export class PacienteList implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);

  private readonly router = inject(Router);

  private pacientesService = inject(PacienteService);
  buscar = "";
  pacientes: Paciente[] = [];
  error = "";
  exito = "";
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        this.pacientes = await firstValueFrom(this.pacientesService.listar());
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  filtrados() {
    const q = this.buscar.toLowerCase();
    return this.pacientes.filter((x) =>
      (x.numeroDocumento + " " + x.nombres + " " + x.apellidos)
        .toLowerCase()
        .includes(q),
    );
  }
  nuevo() {
    void this.router.navigateByUrl("/pacientes/nuevo");
  }
  editar(record: Paciente) {
    void this.router.navigate(["/pacientes", record.idPaciente, "editar"]);
  }
}

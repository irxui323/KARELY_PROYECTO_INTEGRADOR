import { ListadoPaginado } from "../../../../core/utils/listado-paginado";
import { Paginador } from "../../../../shared/components/paginador/paginador";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ModuleHeader } from "../../../../shared/components/module-header/module-header";
import { SiPermiso } from "../../../../shared/directives/si-permiso";
import { Paciente } from "../../models/pacientes.model";
import { PacienteService } from "../../services/pacientes-service";

@Component({
  standalone: true,
  imports: [Paginador, FormsModule, FeatureNav, SiPermiso, ModuleHeader],
  templateUrl: "./paciente-list.html",
  styleUrl: "./paciente-list.css",
})
export class PacienteList implements OnInit {
  readonly paginacion = new ListadoPaginado<Paciente>();

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
        this.pacientes = await this.paginacion.consultar(() =>
          this.pacientesService.listarPagina(
            this.paginacion.pagina,
            this.paginacion.tamanio,
            this.buscar,
          ),
        );
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  filtrados() {
    return this.pacientes;
  }
  nuevo() {
    void this.router.navigateByUrl("/pacientes/nuevo");
  }
  editar(record: Paciente) {
    void this.router.navigate(["/pacientes", record.idPaciente, "editar"]);
  }

  paginar(pagina: number, tamanio = this.paginacion.tamanio) {
    this.paginacion.pagina = pagina;
    this.paginacion.tamanio = tamanio;
    void this.cargar();
  }
}

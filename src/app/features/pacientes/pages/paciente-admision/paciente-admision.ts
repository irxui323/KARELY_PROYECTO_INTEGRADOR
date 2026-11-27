import { FormsModule } from "@angular/forms";
import { ListadoPaginado } from "../../../../core/utils/listado-paginado";
import { Paginador } from "../../../../shared/components/paginador/paginador";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ModuleHeader } from "../../../../shared/components/module-header/module-header";
import { SiPermiso } from "../../../../shared/directives/si-permiso";
import { Cita } from "../../../citas/models/citas.model";
import { CitaService } from "../../../citas/services/citas-service";

@Component({
  standalone: true,
  imports: [Paginador, FormsModule, FeatureNav, SiPermiso, ModuleHeader],
  templateUrl: "./paciente-admision.html",
  styleUrl: "./paciente-admision.css",
})
export class PacienteAdmision implements OnInit {
  readonly paginacion = new ListadoPaginado<Cita>();
  buscar = "";
  vista = "proximas";

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
        this.citas = await this.paginacion.consultar(() =>
          this.citasService.listarPagina(
            this.paginacion.pagina,
            this.paginacion.tamanio,
            this.buscar,
            this.vista,
          ),
        );
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

  paginar(pagina: number, tamanio = this.paginacion.tamanio) {
    this.paginacion.pagina = pagina;
    this.paginacion.tamanio = tamanio;
    void this.cargar();
  }
}

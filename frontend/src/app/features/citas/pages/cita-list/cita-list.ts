import { ListadoPaginado } from "../../../../core/utils/listado-paginado";
import { Paginador } from "../../../../shared/components/paginador/paginador";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../../../core/auth/auth-service";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ModuleHeader } from "../../../../shared/components/module-header/module-header";
import { SiPermiso } from "../../../../shared/directives/si-permiso";
import { Cita } from "../../models/citas.model";
import { CitaService } from "../../services/citas-service";
import { AtencionService } from "../../../atencion/services/atencion-service";
import { DetalleAtencion } from "../../../atencion/models/atencion.model";

@Component({
  standalone: true,
  imports: [
    Paginador,
    FormsModule,
    RouterLink,
    FeatureNav,
    SiPermiso,
    ModuleHeader,
  ],
  templateUrl: "./cita-list.html",
  styleUrl: "./cita-list.css",
})
export class CitaList implements OnInit {
  readonly paginacion = new ListadoPaginado<Cita>();
  vista = "proximas";

  private readonly changeDetector = inject(ChangeDetectorRef);

  private readonly router = inject(Router);
  constructor() {}
  private citasService = inject(CitaService);
  private atencionService = inject(AtencionService);
  auth = inject(AuthService);
  error = "";
  exito = "";
  buscar = "";
  citas: Cita[] = [];
  detalle: DetalleAtencion | null = null;
  cargandoDetalle = false;
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
  citasFiltradas() {
    return this.citas;
  }
  seleccionarReprogramar(record: Cita) {
    void this.router.navigate(["/citas", record.idCita, "reprogramar"]);
  }
  async verDetalle(record: Cita) {
    this.error = "";
    this.detalle = null;
    this.cargandoDetalle = true;
    try {
      this.detalle = await firstValueFrom(this.atencionService.detalle(record.idCita));
    } catch (e) {
      this.error = errorText(e);
    } finally {
      this.cargandoDetalle = false;
      this.changeDetector.markForCheck();
    }
  }
  cerrarDetalle() {
    this.detalle = null;
  }

  paginar(pagina: number, tamanio = this.paginacion.tamanio) {
    this.paginacion.pagina = pagina;
    this.paginacion.tamanio = tamanio;
    void this.cargar();
  }
}

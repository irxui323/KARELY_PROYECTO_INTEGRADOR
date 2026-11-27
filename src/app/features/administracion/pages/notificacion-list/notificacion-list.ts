import { FormsModule } from "@angular/forms";
import { ListadoPaginado } from "../../../../core/utils/listado-paginado";
import { Paginador } from "../../../../shared/components/paginador/paginador";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ModuleHeader } from "../../../../shared/components/module-header/module-header";
import { Notificacion } from "../../models/administracion.model";
import { AdministracionService } from "../../services/administracion-service";

@Component({
  standalone: true,
  imports: [Paginador, FormsModule, FeatureNav, ModuleHeader],
  templateUrl: "./notificacion-list.html",
  styleUrl: "./notificacion-list.css",
})
export class NotificacionList implements OnInit {
  readonly paginacion = new ListadoPaginado<Notificacion>();
  buscar = "";

  private readonly changeDetector = inject(ChangeDetectorRef);

  private administracionService = inject(AdministracionService);
  error = "";
  exito = "";
  notificaciones: Notificacion[] = [];
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        this.notificaciones = await this.paginacion.consultar(() =>
          this.administracionService.notificacionesPagina(
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

  paginar(pagina: number, tamanio = this.paginacion.tamanio) {
    this.paginacion.pagina = pagina;
    this.paginacion.tamanio = tamanio;
    void this.cargar();
  }
}

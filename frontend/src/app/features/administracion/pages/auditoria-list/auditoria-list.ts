import { FormsModule } from "@angular/forms";
import { ListadoPaginado } from "../../../../core/utils/listado-paginado";
import { Paginador } from "../../../../shared/components/paginador/paginador";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ModuleHeader } from "../../../../shared/components/module-header/module-header";
import { Auditoria } from "../../models/administracion.model";
import { AdministracionService } from "../../services/administracion-service";

@Component({
  standalone: true,
  imports: [Paginador, FormsModule, FeatureNav, ModuleHeader],
  templateUrl: "./auditoria-list.html",
  styleUrl: "./auditoria-list.css",
})
export class AuditoriaList implements OnInit {
  readonly paginacion = new ListadoPaginado<Auditoria>();
  buscar = "";

  private readonly changeDetector = inject(ChangeDetectorRef);

  private administracionService = inject(AdministracionService);
  error = "";
  exito = "";
  auditoria: Auditoria[] = [];
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        this.auditoria = await this.paginacion.consultar(() =>
          this.administracionService.auditoriaPagina(
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

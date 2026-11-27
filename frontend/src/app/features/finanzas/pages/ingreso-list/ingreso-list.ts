import { FormsModule } from "@angular/forms";
import { ListadoPaginado } from "../../../../core/utils/listado-paginado";
import { Paginador } from "../../../../shared/components/paginador/paginador";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ModuleHeader } from "../../../../shared/components/module-header/module-header";
import { Ingreso } from "../../models/finanzas.model";
import { FinanzasService } from "../../services/finanzas-service";

@Component({
  standalone: true,
  imports: [Paginador, FormsModule, FeatureNav, ModuleHeader],
  templateUrl: "./ingreso-list.html",
  styleUrl: "./ingreso-list.css",
})
export class IngresoList implements OnInit {
  readonly paginacion = new ListadoPaginado<Ingreso>();
  buscar = "";

  private readonly changeDetector = inject(ChangeDetectorRef);

  private finanzasService = inject(FinanzasService);
  error = "";
  exito = "";
  ingresos: Ingreso[] = [];
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        this.ingresos = await this.paginacion.consultar(() =>
          this.finanzasService.ingresosPagina(
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

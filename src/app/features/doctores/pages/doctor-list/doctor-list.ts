import { ListadoPaginado } from "../../../../core/utils/listado-paginado";
import { Paginador } from "../../../../shared/components/paginador/paginador";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { SiPermiso } from "../../../../shared/directives/si-permiso";
import { Doctor } from "../../models/doctores.model";
import { DoctorService } from "../../services/doctores-service";

@Component({
  standalone: true,
  imports: [Paginador, FormsModule, FeatureNav, SiPermiso],
  templateUrl: "./doctor-list.html",
  styleUrl: "./doctor-list.css",
})
export class DoctorList implements OnInit {
  readonly paginacion = new ListadoPaginado<Doctor>();

  private readonly changeDetector = inject(ChangeDetectorRef);

  private readonly router = inject(Router);

  private doctoresService = inject(DoctorService);
  buscar = "";
  doctores: Doctor[] = [];
  error = "";
  exito = "";
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        this.doctores = await this.paginacion.consultar(() =>
          this.doctoresService.listarPagina(
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
    return this.doctores;
  }
  nuevo() {
    void this.router.navigateByUrl("/doctores/nuevo");
  }
  editar(record: Doctor) {
    void this.router.navigate(["/doctores", record.idDoctor, "editar"]);
  }
  verDocumentos(record: Doctor) {
    void this.router.navigate(["/doctores/documentos"], {
      queryParams: { doctor: record.idDoctor },
    });
  }

  paginar(pagina: number, tamanio = this.paginacion.tamanio) {
    this.paginacion.pagina = pagina;
    this.paginacion.tamanio = tamanio;
    void this.cargar();
  }
}

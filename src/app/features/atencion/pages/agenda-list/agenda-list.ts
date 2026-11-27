import { ListadoPaginado } from "../../../../core/utils/listado-paginado";
import { Paginador } from "../../../../shared/components/paginador/paginador";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../../../core/auth/auth-service";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ModuleHeader } from "../../../../shared/components/module-header/module-header";
import { Cita } from "../../../citas/models/citas.model";
import { CitaService } from "../../../citas/services/citas-service";
import { Doctor } from "../../../doctores/models/doctores.model";
import { DoctorService } from "../../../doctores/services/doctores-service";
import { AtencionService } from "../../services/atencion-service";
import { DetalleAtencion } from "../../models/atencion.model";
type PestanaMedica = "citas" | "horarios" | "consultas";
@Component({
  standalone: true,
  imports: [Paginador, FormsModule, FeatureNav, ModuleHeader],
  templateUrl: "./agenda-list.html",
  styleUrl: "./agenda-list.css",
})
export class AgendaList implements OnInit {
  readonly paginacion = new ListadoPaginado<Cita>();
  vista = "proximas";

  private readonly changeDetector = inject(ChangeDetectorRef);

  private readonly router = inject(Router);
  constructor() {}
  private doctoresService = inject(DoctorService);
  private citasService = inject(CitaService);
  private atencionService = inject(AtencionService);
  private auth = inject(AuthService);
  busqueda = "";
  error = "";
  exito = "";
  cargando = false;
  procesando = false;
  cargandoDetalle = false;
  detalle: DetalleAtencion | null = null;
  citas: Cita[] = [];
  doctor: Doctor | undefined;
  get esAdministradora(): boolean {
    return this.auth.session()?.rol === "ADMINISTRADORA";
  }
  get nombreDoctor(): string {
    if (this.esAdministradora) return "Todos los médicos";
    return this.doctor
      ? `${this.doctor.nombres} ${this.doctor.apellidos}`
      : "Sin médico asociado";
  }
  get citasFiltradas(): Cita[] {
    return this.citas;
  }
  ngOnInit() {
    void this.cargar();
  }
  fechaLegible(valor: unknown): string {
    if (valor == null) return "—";
    const txt = String(valor).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) {
      const [anio, mes, dia] = txt.split("-");
      return `${dia}/${mes}/${anio}`;
    }
    return String(valor);
  }
  estadoLegible(valor: unknown): string {
    return String(valor ?? "—").replace(/_/g, " ");
  }
  async cargar() {
    try {
      this.cargando = true;
      this.error = "";
      try {
        [this.citas, this.doctores] = await Promise.all([
          this.paginacion.consultar(() =>
            this.citasService.listarPagina(
              this.paginacion.pagina,
              this.paginacion.tamanio,
              this.busqueda,
              this.vista,
            ),
          ),
          firstValueFrom(this.doctoresService.listar()),
        ]);
        this.doctor = this.doctores.find(
          (d) => Number(d.idUsuario) === this.auth.session()?.idUsuario,
        );
      } catch (e) {
        this.error = errorText(e);
      } finally {
        this.cargando = false;
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  seleccionar(cita: Cita) {
    void this.router.navigate(["/doctor/consultas"], {
      queryParams: { cita: cita.idCita },
    });
  }
  async verDetalle(cita: Cita) {
    this.error = "";
    this.detalle = null;
    this.cargandoDetalle = true;
    try {
      this.detalle = await firstValueFrom(this.atencionService.detalle(cita.idCita));
    } catch (error) {
      this.error = errorText(error);
    } finally {
      this.cargandoDetalle = false;
      this.changeDetector.markForCheck();
    }
  }
  cerrarDetalle() {
    this.detalle = null;
  }
  doctores: Doctor[] = [];

  paginar(pagina: number, tamanio = this.paginacion.tamanio) {
    this.paginacion.pagina = pagina;
    this.paginacion.tamanio = tamanio;
    void this.cargar();
  }
}

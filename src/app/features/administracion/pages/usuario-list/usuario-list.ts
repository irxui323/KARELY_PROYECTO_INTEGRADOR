import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import {
  AdministracionAccion,
  AdministracionRequest,
  RolCatalogo,
  Usuario,
} from "../../models/administracion.model";
import { AdministracionService } from "../../services/administracion-service";

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, FeatureNav],
  templateUrl: "./usuario-list.html",
  styleUrl: "./usuario-list.css",
})
export class UsuarioList implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  guardando = false;
  constructor() {}
  private administracionService = inject(AdministracionService);
  error = "";
  exito = "";
  usuarios: Usuario[] = [];
  roles: RolCatalogo[] = [];
  seleccionado: Usuario | null = null;
  cambioRol: number | null = null;
  cambioEstado = "ACTIVO";
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        [this.usuarios, this.roles] = await Promise.all([
          firstValueFrom(this.administracionService.usuarios()),
          firstValueFrom(this.administracionService.roles()),
        ]);
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async ejecutar(a: AdministracionAccion, d: AdministracionRequest) {
    if (this.guardando) return;
    this.guardando = true;
    try {
      this.error = "";
      this.exito = "";
      try {
        await firstValueFrom(this.administracionService.ejecutar(a, d));
        this.exito = "Actualización guardada";
        await this.cargar();
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
  elegirUsuario(u: Usuario) {
    this.seleccionado = u;
    this.cambioEstado = u.estado;
    this.cambioRol = this.roles.find((r) => r.nombre === u.rol)?.idRol || null;
  }
  actualizarRol() {
    if (this.seleccionado)
      this.ejecutar("usuario-rol", {
        idUsuario: this.seleccionado.idUsuario,
        idRol: this.cambioRol,
      });
  }
  actualizarEstado() {
    if (this.seleccionado)
      this.ejecutar("usuario-estado", {
        idUsuario: this.seleccionado.idUsuario,
        estado: this.cambioEstado,
      });
  }
}

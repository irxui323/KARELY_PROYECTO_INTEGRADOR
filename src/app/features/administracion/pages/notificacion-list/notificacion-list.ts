import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { Notificacion } from "../../models/administracion.model";
import { AdministracionService } from "../../services/administracion-service";

@Component({
  standalone: true,
  imports: [FeatureNav],
  templateUrl: "./notificacion-list.html",
  styleUrl: "./notificacion-list.css",
})
export class NotificacionList implements OnInit {
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
        this.notificaciones = await firstValueFrom(
          this.administracionService.notificaciones(),
        );
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
}

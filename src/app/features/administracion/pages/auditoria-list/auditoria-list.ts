import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { Auditoria } from "../../models/administracion.model";
import { AdministracionService } from "../../services/administracion-service";

@Component({
  standalone: true,
  imports: [FeatureNav],
  templateUrl: "./auditoria-list.html",
  styleUrl: "./auditoria-list.css",
})
export class AuditoriaList implements OnInit {
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
        this.auditoria = await firstValueFrom(
          this.administracionService.auditoria(),
        );
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
}

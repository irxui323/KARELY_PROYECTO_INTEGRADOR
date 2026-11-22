import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { Ingreso } from "../../models/finanzas.model";
import { FinanzasService } from "../../services/finanzas-service";

@Component({
  standalone: true,
  imports: [FeatureNav],
  templateUrl: "./ingreso-list.html",
  styleUrl: "./ingreso-list.css",
})
export class IngresoList implements OnInit {
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
        this.ingresos = await firstValueFrom(this.finanzasService.ingresos());
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
}

import { ListadoPaginado } from "../../../../core/utils/listado-paginado";
import { Paginador } from "../../../../shared/components/paginador/paginador";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import {
  FormControl,
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { ModuleHeader } from "../../../../shared/components/module-header/module-header";
import { SiPermiso } from "../../../../shared/directives/si-permiso";
import { Doctor } from "../../../doctores/models/doctores.model";
import { DoctorService } from "../../../doctores/services/doctores-service";
import { Ingreso, Liquidacion, SaldoDoctor } from "../../models/finanzas.model";
import { FinanzasService } from "../../services/finanzas-service";

@Component({
  standalone: true,
  imports: [
    Paginador,
    FormsModule,
    RouterLink,
    FeatureNav,
    SiPermiso,
    ReactiveFormsModule,
    ModuleHeader,
    DatePipe,
  ],
  templateUrl: "./liquidacion-list.html",
  styleUrl: "./liquidacion-list.css",
})
export class LiquidacionList implements OnInit {
  readonly paginacion = new ListadoPaginado<Liquidacion>();
  buscar = "";

  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly doctoresService = inject(DoctorService);
  private readonly finanzasService = inject(FinanzasService);
  error = "";
  errorSaldo = "";
  consultandoSaldo = false;
  saldo: SaldoDoctor | null = null;
  liquidaciones: Liquidacion[] = [];
  ingresos: Ingreso[] = [];
  totalIngresos = 0;
  doctores: Doctor[] = [];

  readonly saldoForm = new FormGroup({
    idDoctor: new FormControl<number | null>(null, Validators.required),
    fechaCorte: new FormControl("", {
      nonNullable: true,
      validators: Validators.required,
    }),
  });

  ngOnInit() {
    void this.cargar();
  }

  async cargar() {
    this.error = "";
    try {
      [this.liquidaciones, this.ingresos, this.doctores] = await Promise.all([
        this.paginacion.consultar(() =>
          this.finanzasService.liquidacionesPagina(
            this.paginacion.pagina,
            this.paginacion.tamanio,
            this.buscar,
          ),
        ),
        firstValueFrom(this.finanzasService.ingresosPagina(0, 1)).then((r) => {
          this.totalIngresos = r.totalElementos;
          return r.contenido;
        }),
        firstValueFrom(this.doctoresService.listar()),
      ]);
    } catch (error) {
      this.error = errorText(error);
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  async consultarSaldo() {
    const { idDoctor, fechaCorte } = this.saldoForm.getRawValue();
    if (this.consultandoSaldo || idDoctor === null || !fechaCorte) return;
    this.consultandoSaldo = true;
    this.saldo = null;
    this.errorSaldo = "";
    try {
      this.saldo = await firstValueFrom(
        this.finanzasService.saldo(idDoctor, fechaCorte),
      );
    } catch (error) {
      this.errorSaldo = errorText(error);
    } finally {
      this.consultandoSaldo = false;
      this.changeDetector.markForCheck();
    }
  }

  paginar(pagina: number, tamanio = this.paginacion.tamanio) {
    this.paginacion.pagina = pagina;
    this.paginacion.tamanio = tamanio;
    void this.cargar();
  }
}

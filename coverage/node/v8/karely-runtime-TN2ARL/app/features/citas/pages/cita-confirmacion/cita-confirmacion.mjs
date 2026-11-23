var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from '../../../../core/utils/http-error.mjs';
import { FeatureNav } from '../../../../shared/components/feature-nav/feature-nav.mjs';
import { ModuleHeader } from '../../../../shared/components/module-header/module-header.mjs';
import { CitaService } from '../../services/citas-service.mjs';
let CitaConfirmacion = class CitaConfirmacion {
    changeDetector = inject(ChangeDetectorRef);
    guardando = false;
    route = inject(ActivatedRoute, { optional: true });
    constructor() {
        this.pago = { metodoPago: "EFECTIVO" };
    }
    citasService = inject(CitaService);
    error = "";
    exito = "";
    reservas = [];
    pagoGroup = new FormGroup({
        idPreReserva: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required, Validators.min(1)],
        }),
        metodoPago: new FormControl(undefined, {
            nonNullable: true,
            validators: [
                Validators.required,
                Validators.pattern(/^(EFECTIVO|TARJETA|YAPE|PLIN|TRANSFERENCIA)$/),
            ],
        }),
    });
    get pago() {
        return this.pagoGroup.getRawValue();
    }
    set pago(value) {
        this.pagoGroup.reset(value);
    }
    ngOnInit() {
        const id = Number(this.route?.snapshot.queryParamMap.get("reserva"));
        if (id > 0)
            this.pagoGroup.controls.idPreReserva.setValue(id);
        void this.cargar();
    }
    async cargar() {
        try {
            try {
                this.reservas = await firstValueFrom(this.citasService.reservas());
            }
            catch (e) {
                this.error = errorText(e);
            }
        }
        finally {
            this.changeDetector.markForCheck();
        }
    }
    async confirmarPago() {
        if (this.guardando)
            return;
        this.guardando = true;
        try {
            this.error = "";
            this.exito = "";
            if (this.pagoGroup.invalid) {
                this.pagoGroup.markAllAsTouched();
                this.error = "Selecciona una pre-reserva vigente y el método de pago.";
                return;
            }
            try {
                const r = await firstValueFrom(this.citasService.ejecutar("cita-confirmar", this.pago));
                this.exito = "Pago registrado y cita confirmada correctamente.";
                this.pagoGroup.controls.idPreReserva.reset(null);
                await this.cargar();
            }
            catch (e) {
                this.error = errorText(e);
            }
        }
        finally {
            this.guardando = false;
            this.changeDetector.markForCheck();
        }
    }
};
CitaConfirmacion = __decorate([
    Component({
        standalone: true,
        imports: [ReactiveFormsModule, FeatureNav, RouterLink, ModuleHeader],
        template: "<div class=\"k-module k-citas\">\n  <header\n    appModuleHeader\n    class=\"k-module-header\"\n    contexto=\"GESTIÓN CLÍNICA / AGENDA\"\n    titulo=\"Citas médicas\"\n    descripcion=\"Consulta la agenda, reserva turnos y gestiona pagos y reprogramaciones.\"\n    textoActualizar=\"↻ Actualizar agenda\"\n    (actualizar)=\"cargar()\"\n  >\n  </header>\n  <app-feature-nav feature=\"citas\" />\n  @if(error){\n  <div class=\"k-error\" role=\"alert\">{{error}}</div>\n  }@if(exito){\n  <div class=\"k-success\" role=\"status\">{{exito}}</div>\n  }\n  <section class=\"k-panel\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>2. Confirmar pago y cita</h2>\n        <p>\n          Utiliza el número de pre-reserva vigente y el comprobante del cobro\n          verificado.\n        </p>\n      </div>\n    </div>\n    <div class=\"k-info\">\n      Este formulario <strong>no realiza cobros bancarios</strong>. Registra el\n      pago únicamente tras verificarlo externamente.\n    </div>\n    <div class=\"k-form\">\n      <label class=\"k-field\"\n        >Pre-reserva vigente<select\n          [formControl]=\"pagoGroup.controls.idPreReserva\"\n        >\n          <option [ngValue]=\"null\">Selecciona una pre-reserva</option>\n          @for(r of reservas;track r.idPreReserva){\n          <option [ngValue]=\"r.idPreReserva\">\n            #{{r.idPreReserva}} · S/ {{r.monto}} · vence {{r.fechaExpiracion}}\n          </option>\n          }\n        </select></label\n      >\n      <label class=\"k-field\"\n        >Método de pago<select [formControl]=\"pagoGroup.controls.metodoPago\">\n          <option>EFECTIVO</option>\n          <option>TARJETA</option>\n          <option>YAPE</option>\n          <option>PLIN</option>\n          <option>TRANSFERENCIA</option>\n        </select></label\n      >\n    </div>\n    <p class=\"k-info\">\n      El código del cobro se genera automáticamente al confirmar el pago, para\n      cualquier método.\n    </p>\n    <div class=\"k-actions\">\n      <button\n        class=\"k-button\"\n        [disabled]=\"guardando || pagoGroup.invalid\"\n        (click)=\"confirmarPago()\"\n      >\n        Registrar pago y confirmar cita\n      </button>\n      <a class=\"k-button k-button-secondary\" routerLink=\"/citas\">Ver citas</a>\n    </div>\n  </section>\n</div>\n",
        styles: [],
    })
], CitaConfirmacion);
export { CitaConfirmacion };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2l0YS1jb25maXJtYWNpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9DOi9VTklWRVJTSURBRC9MUDIvU0VNQU5BMTEva2FyZWx5X21vZGVybm8vZnJvbnRlbmQvc3JjL2FwcC9mZWF0dXJlcy9jaXRhcy9wYWdlcy9jaXRhLWNvbmZpcm1hY2lvbi8iLCJzb3VyY2VzIjpbImNpdGEtY29uZmlybWFjaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQzdFLE9BQU8sRUFDTCxXQUFXLEVBQ1gsU0FBUyxFQUNULG1CQUFtQixFQUNuQixVQUFVLEdBQ1gsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzdELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzlELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUNuRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkRBQTJELENBQUM7QUFFekYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBUXBELElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWdCO0lBQ1YsY0FBYyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzVELFNBQVMsR0FBRyxLQUFLLENBQUM7SUFFRCxLQUFLLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFO1FBQ0UsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBQ08sWUFBWSxHQUFHLE1BQU0s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RSxDQUFDO2dCQUNYLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUM7UUFDSCxDQUFDO2dCQUFTLENBQUM7WUFDVCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JDLENBQUM7SUFDSCxDQUFDO0NBQ0YsQ0FBQTtBQXpFWSxnQkFBZ0I7SUFONUIsU0FBUyxDQUFDO1FBQ1QsVUFBVSxFQUFFLElBQUk7UUFDaEIsT0FBTyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUM7UUFDcEUsUUFBUSxFQUFDLGd5RUFBZ3lFO1FBQ3p5RSxNQUFNLEVBQUMsRUFBRTtLQUNWLENBQUM7R0FDVyxnQkFBZ0IsQ0F5RTVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgaW5qZWN0LCBPbkluaXQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtcbiAgRm9ybUNvbnRyb2wsXG4gIEZvcm1Hcm91cCxcbiAgUmVhY3RpdmVGb3Jtc01vZHVsZSxcbiAgVmFsaWRhdG9ycyxcbn0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5pbXBvcnQgeyBBY3RpdmF0ZWRSb3V0ZSwgUm91dGVyTGluayB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcbmltcG9ydCB7IGZpcnN0VmFsdWVGcm9tIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGVycm9yVGV4dCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb3JlL3V0aWxzL2h0dHAtZXJyb3JcIjtcbmltcG9ydCB7IEZlYXR1cmVOYXYgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2NvbXBvbmVudHMvZmVhdHVyZS1uYXYvZmVhdHVyZS1uYXZcIjtcbmltcG9ydCB7IE1vZHVsZUhlYWRlciB9IGZyb20gXCIuLi8uLi8uLi8uLi9zaGFyZWQvY29tcG9uZW50cy9tb2R1bGUtaGVhZGVyL21vZHVsZS1oZWFkZXJcIjtcbmltcG9ydCB7IENpdGFSZXF1ZXN0LCBSZXNlcnZhIH0gZnJvbSBcIi4uLy4uL21vZGVscy9jaXRhcy5tb2RlbFwiO1xuaW1wb3J0IHsgQ2l0YVNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2VydmljZXMvY2l0YXMtc2VydmljZVwiO1xuXG5AQ29tcG9uZW50KHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW1JlYWN0aXZlRm9ybXNNb2R1bGUsIEZlYXR1cmVOYXYsIFJvdXRlckxpbmssIE1vZHVsZUhlYWRlcl0sXG4gIHRlbXBsYXRlOlwiPGRpdiBjbGFzcz1cXFwiay1tb2R1bGUgay1jaXRhc1xcXCI+XFxuICA8aGVhZGVyXFxuICAgIGFwcE1vZHVsZUhlYWRlclxcbiAgICBjbGFzcz1cXFwiay1tb2R1bGUtaGVhZGVyXFxcIlxcbiAgICBjb250ZXh0bz1cXFwiR0VTVEnDk04gQ0zDjU5JQ0EgLyBBR0VOREFcXFwiXFxuICAgIHRpdHVsbz1cXFwiQ2l0YXMgbcOpZGljYXNcXFwiXFxuICAgIGRlc2NyaXBjaW9uPVxcXCJDb25zdWx0YSBsYSBhZ2VuZGEsIHJlc2VydmEgdHVybm9zIHkgZ2VzdGlvbmEgcGFnb3MgeSByZXByb2dyYW1hY2lvbmVzLlxcXCJcXG4gICAgdGV4dG9BY3R1YWxpemFyPVxcXCLihrsgQWN0dWFsaXphciBhZ2VuZGFcXFwiXFxuICAgIChhY3R1YWxpemFyKT1cXFwiY2FyZ2FyKClcXFwiXFxuICA+XFxuICA8L2hlYWRlcj5cXG4gIDxhcHAtZmVhdHVyZS1uYXYgZmVhdHVyZT1cXFwiY2l0YXNcXFwiIC8+XFxuICBAaWYoZXJyb3Ipe1xcbiAgPGRpdiBjbGFzcz1cXFwiay1lcnJvclxcXCIgcm9sZT1cXFwiYWxlcnRcXFwiPnt7ZXJyb3J9fTwvZGl2PlxcbiAgfUBpZihleGl0byl7XFxuICA8ZGl2IGNsYXNzPVxcXCJrLXN1Y2Nlc3NcXFwiIHJvbGU9XFxcInN0YXR1c1xcXCI+e3tleGl0b319PC9kaXY+XFxuICB9XFxuICA8c2VjdGlvbiBjbGFzcz1cXFwiay1wYW5lbFxcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcImstc2VjdGlvbi1oZWFkaW5nXFxcIj5cXG4gICAgICA8ZGl2PlxcbiAgICAgICAgPGgyPjIuIENvbmZpcm1hciBwYWdvIHkgY2l0YTwvaDI+XFxuICAgICAgICA8cD5cXG4gICAgICAgICAgVXRpbGl6YSBlbCBuw7ptZXJvIGRlIHByZS1yZXNlcnZhIHZpZ2VudGUgeSBlbCBjb21wcm9iYW50ZSBkZWwgY29icm9cXG4gICAgICAgICAgdmVyaWZpY2Fkby5cXG4gICAgICAgIDwvcD5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcImstaW5mb1xcXCI+XFxuICAgICAgRXN0ZSBmb3JtdWxhcmlvIDxzdHJvbmc+bm8gcmVhbGl6YSBjb2Jyb3MgYmFuY2FyaW9zPC9zdHJvbmc+LiBSZWdpc3RyYSBlbFxcbiAgICAgIHBhZ28gw7puaWNhbWVudGUgdHJhcyB2ZXJpZmljYXJsbyBleHRlcm5hbWVudGUuXFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLWZvcm1cXFwiPlxcbiAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5QcmUtcmVzZXJ2YSB2aWdlbnRlPHNlbGVjdFxcbiAgICAgICAgICBbZm9ybUNvbnRyb2xdPVxcXCJwYWdvR3JvdXAuY29udHJvbHMuaWRQcmVSZXNlcnZhXFxcIlxcbiAgICAgICAgPlxcbiAgICAgICAgICA8b3B0aW9uIFtuZ1ZhbHVlXT1cXFwibnVsbFxcXCI+U2VsZWNjaW9uYSB1bmEgcHJlLXJlc2VydmE8L29wdGlvbj5cXG4gICAgICAgICAgQGZvcihyIG9mIHJlc2VydmFzO3RyYWNrIHIuaWRQcmVSZXNlcnZhKXtcXG4gICAgICAgICAgPG9wdGlvbiBbbmdWYWx1ZV09XFxcInIuaWRQcmVSZXNlcnZhXFxcIj5cXG4gICAgICAgICAgICAje3tyLmlkUHJlUmVzZXJ2YX19IMK3IFMvIHt7ci5tb250b319IMK3IHZlbmNlIHt7ci5mZWNoYUV4cGlyYWNpb259fVxcbiAgICAgICAgICA8L29wdGlvbj5cXG4gICAgICAgICAgfVxcbiAgICAgICAgPC9zZWxlY3Q+PC9sYWJlbFxcbiAgICAgID5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+TcOpdG9kbyBkZSBwYWdvPHNlbGVjdCBbZm9ybUNvbnRyb2xdPVxcXCJwYWdvR3JvdXAuY29udHJvbHMubWV0b2RvUGFnb1xcXCI+XFxuICAgICAgICAgIDxvcHRpb24+RUZFQ1RJVk88L29wdGlvbj5cXG4gICAgICAgICAgPG9wdGlvbj5UQVJKRVRBPC9vcHRpb24+XFxuICAgICAgICAgIDxvcHRpb24+WUFQRTwvb3B0aW9uPlxcbiAgICAgICAgICA8b3B0aW9uPlBMSU48L29wdGlvbj5cXG4gICAgICAgICAgPG9wdGlvbj5UUkFOU0ZFUkVOQ0lBPC9vcHRpb24+XFxuICAgICAgICA8L3NlbGVjdD48L2xhYmVsXFxuICAgICAgPlxcbiAgICA8L2Rpdj5cXG4gICAgPHAgY2xhc3M9XFxcImstaW5mb1xcXCI+XFxuICAgICAgRWwgY8OzZGlnbyBkZWwgY29icm8gc2UgZ2VuZXJhIGF1dG9tw6F0aWNhbWVudGUgYWwgY29uZmlybWFyIGVsIHBhZ28sIHBhcmFcXG4gICAgICBjdWFscXVpZXIgbcOpdG9kby5cXG4gICAgPC9wPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLWFjdGlvbnNcXFwiPlxcbiAgICAgIDxidXR0b25cXG4gICAgICAgIGNsYXNzPVxcXCJrLWJ1dHRvblxcXCJcXG4gICAgICAgIFtkaXNhYmxlZF09XFxcImd1YXJkYW5kbyB8fCBwYWdvR3JvdXAuaW52YWxpZFxcXCJcXG4gICAgICAgIChjbGljayk9XFxcImNvbmZpcm1hclBhZ28oKVxcXCJcXG4gICAgICA+XFxuICAgICAgICBSZWdpc3RyYXIgcGFnbyB5IGNvbmZpcm1hciBjaXRhXFxuICAgICAgPC9idXR0b24+XFxuICAgICAgPGEgY2xhc3M9XFxcImstYnV0dG9uIGstYnV0dG9uLXNlY29uZGFyeVxcXCIgcm91dGVyTGluaz1cXFwiL2NpdGFzXFxcIj5WZXIgY2l0YXM8L2E+XFxuICAgIDwvZGl2PlxcbiAgPC9zZWN0aW9uPlxcbjwvZGl2PlxcblwiLFxuICBzdHlsZXM6W10sXG59KVxuZXhwb3J0IGNsYXNzIENpdGFDb25maXJtYWNpb24gaW1wbGVtZW50cyBPbkluaXQge1xuICBwcml2YXRlIHJlYWRvbmx5IGNoYW5nZURldGVjdG9yID0gaW5qZWN0KENoYW5nZURldGVjdG9yUmVmKTtcbiAgZ3VhcmRhbmRvID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSByZWFkb25seSByb3V0ZSA9IGluamVjdChBY3RpdmF0ZWRSb3V0ZSwgeyBvcHRpb25hbDogdHJ1ZSB9KTtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5wYWdvID0geyBtZXRvZG9QYWdvOiBcIkVGRUNUSVZPXCIgfTtcbiAgfVxuICBwcml2YXRlIGNpdGFzU2VydmljZSA9IGluamVjdChDaXRhU2VydmljZSk7XG4gIGVycm9yID0gXCJcIjtcbiAgZXhpdG8gPSBcIlwiO1xuICByZXNlcnZhczogUmVzZXJ2YVtdID0gW107XG4gIHJlYWRvbmx5IHBhZ29Hcm91cCA9IG5ldyBGb3JtR3JvdXAoe1xuICAgIGlkUHJlUmVzZXJ2YTogbmV3IEZvcm1Db250cm9sPG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQ+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbVmFsaWRhdG9ycy5yZXF1aXJlZCwgVmFsaWRhdG9ycy5taW4oMSldLFxuICAgIH0pLFxuICAgIG1ldG9kb1BhZ286IG5ldyBGb3JtQ29udHJvbDxzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsPih1bmRlZmluZWQsIHtcbiAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgICAgdmFsaWRhdG9yczogW1xuICAgICAgICBWYWxpZGF0b3JzLnJlcXVpcmVkLFxuICAgICAgICBWYWxpZGF0b3JzLnBhdHRlcm4oL14oRUZFQ1RJVk98VEFSSkVUQXxZQVBFfFBMSU58VFJBTlNGRVJFTkNJQSkkLyksXG4gICAgICBdLFxuICAgIH0pLFxuICB9KTtcbiAgZ2V0IHBhZ28oKTogQ2l0YVJlcXVlc3Qge1xuICAgIHJldHVybiB0aGlzLnBhZ29Hcm91cC5nZXRSYXdWYWx1ZSgpO1xuICB9XG4gIHNldCBwYWdvKHZhbHVlOiBDaXRhUmVxdWVzdCkge1xuICAgIHRoaXMucGFnb0dyb3VwLnJlc2V0KHZhbHVlKTtcbiAgfVxuICBuZ09uSW5pdCgpIHtcbiAgICBjb25zdCBpZCA9IE51bWJlcih0aGlzLnJvdXRlPy5zbmFwc2hvdC5xdWVyeVBhcmFtTWFwLmdldChcInJlc2VydmFcIikpO1xuICAgIGlmIChpZCA+IDApIHRoaXMucGFnb0dyb3VwLmNvbnRyb2xzLmlkUHJlUmVzZXJ2YS5zZXRWYWx1ZShpZCk7XG4gICAgdm9pZCB0aGlzLmNhcmdhcigpO1xuICB9XG4gIGFzeW5jIGNhcmdhcigpIHtcbiAgICB0cnkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5yZXNlcnZhcyA9IGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMuY2l0YXNTZXJ2aWNlLnJlc2VydmFzKCkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLmVycm9yID0gZXJyb3JUZXh0KGUpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuICBhc3luYyBjb25maXJtYXJQYWdvKCkge1xuICAgIGlmICh0aGlzLmd1YXJkYW5kbykgcmV0dXJuO1xuICAgIHRoaXMuZ3VhcmRhbmRvID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5lcnJvciA9IFwiXCI7XG4gICAgICB0aGlzLmV4aXRvID0gXCJcIjtcbiAgICAgIGlmICh0aGlzLnBhZ29Hcm91cC5pbnZhbGlkKSB7XG4gICAgICAgIHRoaXMucGFnb0dyb3VwLm1hcmtBbGxBc1RvdWNoZWQoKTtcbiAgICAgICAgdGhpcy5lcnJvciA9IFwiU2VsZWNjaW9uYSB1bmEgcHJlLXJlc2VydmEgdmlnZW50ZSB5IGVsIG3DqXRvZG8gZGUgcGFnby5cIjtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgciA9IGF3YWl0IGZpcnN0VmFsdWVGcm9tKFxuICAgICAgICAgIHRoaXMuY2l0YXNTZXJ2aWNlLmVqZWN1dGFyKFwiY2l0YS1jb25maXJtYXJcIiwgdGhpcy5wYWdvKSxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5leGl0byA9IFwiUGFnbyByZWdpc3RyYWRvIHkgY2l0YSBjb25maXJtYWRhIGNvcnJlY3RhbWVudGUuXCI7XG4gICAgICAgIHRoaXMucGFnb0dyb3VwLmNvbnRyb2xzLmlkUHJlUmVzZXJ2YS5yZXNldChudWxsKTtcbiAgICAgICAgYXdhaXQgdGhpcy5jYXJnYXIoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5ndWFyZGFuZG8gPSBmYWxzZTtcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG59XG4iXX0=
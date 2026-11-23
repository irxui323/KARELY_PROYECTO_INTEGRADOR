var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from '../../../../core/utils/http-error.mjs';
import { FeatureNav } from '../../../../shared/components/feature-nav/feature-nav.mjs';
import { ModuleHeader } from '../../../../shared/components/module-header/module-header.mjs';
import { SiPermiso } from '../../../../shared/directives/si-permiso.mjs';
import { DoctorService } from '../../../doctores/services/doctores-service.mjs';
import { FinanzasService } from '../../services/finanzas-service.mjs';
let LiquidacionForm = class LiquidacionForm {
    changeDetector = inject(ChangeDetectorRef);
    doctoresService = inject(DoctorService);
    finanzasService = inject(FinanzasService);
    guardando = false;
    error = "";
    exito = "";
    doctores = [];
    liqGroup = new FormGroup({
        idDoctor: new FormControl(null, [
            Validators.required,
            Validators.min(1),
        ]),
        fechaInicio: new FormControl("", {
            nonNullable: true,
            validators: Validators.required,
        }),
        fechaFin: new FormControl("", {
            nonNullable: true,
            validators: Validators.required,
        }),
        monto: new FormControl(null, [
            Validators.required,
            Validators.min(0.01),
        ]),
        metodoPago: new FormControl("TRANSFERENCIA", {
            nonNullable: true,
            validators: Validators.required,
        }),
    }, {
        validators: (form) => {
            const inicio = form.get("fechaInicio")?.value;
            const fin = form.get("fechaFin")?.value;
            return inicio && fin && fin < inicio ? { periodoInvalido: true } : null;
        },
    });
    ngOnInit() {
        void this.cargar();
    }
    async cargar() {
        this.error = "";
        try {
            this.doctores = await firstValueFrom(this.doctoresService.listar());
        }
        catch (error) {
            this.error = errorText(error);
        }
        finally {
            this.changeDetector.markForCheck();
        }
    }
    async registrarPago() {
        if (this.guardando)
            return;
        this.error = "";
        this.exito = "";
        const { idDoctor, monto, fechaInicio, fechaFin, metodoPago } = this.liqGroup.getRawValue();
        if (this.liqGroup.hasError("periodoInvalido")) {
            this.liqGroup.markAllAsTouched();
            this.error = "La fecha de fin debe ser igual o posterior a la fecha de inicio.";
            return;
        }
        if (this.liqGroup.invalid ||
            idDoctor === null ||
            monto === null ||
            !Number.isFinite(monto)) {
            this.liqGroup.markAllAsTouched();
            this.error = "Completa los datos del médico, el periodo y el pago.";
            return;
        }
        if (fechaInicio > fechaFin) {
            this.error =
                "La fecha de fin debe ser igual o posterior a la fecha de inicio.";
            return;
        }
        this.guardando = true;
        try {
            const resultado = await firstValueFrom(this.finanzasService.pagar({
                idDoctor,
                fechaInicio,
                fechaFin,
                monto,
                metodoPago,
            }));
            this.exito = "Operación realizada correctamente";
            this.liqGroup.reset();
        }
        catch (error) {
            this.error = errorText(error);
        }
        finally {
            this.guardando = false;
            this.changeDetector.markForCheck();
        }
    }
};
LiquidacionForm = __decorate([
    Component({
        standalone: true,
        imports: [ReactiveFormsModule, RouterLink, FeatureNav, SiPermiso, ModuleHeader],
        template: "<div class=\"k-module k-finanzas\">\n  <header\n    appModuleHeader\n    class=\"k-module-header\"\n    contexto=\"GESTIÓN ECONÓMICA / FINANZAS\"\n    titulo=\"Área financiera\"\n    descripcion=\"Controla liquidaciones, pagos a médicos e ingresos registrados de la gestora.\"\n    textoActualizar=\"↻ Actualizar registros\"\n    (actualizar)=\"cargar()\"\n  >\n  </header>\n  <app-feature-nav feature=\"finanzas\" />\n  @if(error || liqGroup.hasError('periodoInvalido')){\n  <div class=\"k-error\" role=\"alert\">{{liqGroup.hasError('periodoInvalido') ? 'La fecha de fin debe ser igual o posterior a la fecha de inicio.' : error}}</div>\n  }@if(exito){\n  <div class=\"k-success\" role=\"status\">{{exito}}</div>\n  }\n  <section class=\"k-panel\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>Registrar pago a médico</h2>\n        <p>Selecciona el médico y el periodo al que corresponde el pago.</p>\n      </div>\n    </div>\n    <form [formGroup]=\"liqGroup\" (ngSubmit)=\"registrarPago()\">\n      <fieldset class=\"k-form\" [disabled]=\"guardando\">\n        <label class=\"k-field\">\n          Doctor\n          <select formControlName=\"idDoctor\">\n            <option [ngValue]=\"null\">Selecciona un médico</option>\n            @for (doctor of doctores; track doctor.idDoctor) {\n            <option [ngValue]=\"doctor.idDoctor\">\n              {{doctor.nombres}} {{doctor.apellidos}}\n            </option>\n            }\n          </select>\n        </label>\n        <label class=\"k-field\">\n          Fecha de inicio\n          <input type=\"date\" formControlName=\"fechaInicio\" [max]=\"liqGroup.controls.fechaFin.value || ''\" />\n        </label>\n        <label class=\"k-field\">\n          Fecha de fin\n          <input type=\"date\" formControlName=\"fechaFin\" [min]=\"liqGroup.controls.fechaInicio.value || ''\" />\n        </label>\n        <label class=\"k-field\">\n          Monto a pagar (S/)\n          <input type=\"number\" min=\"0.01\" step=\"0.01\" formControlName=\"monto\" />\n        </label>\n        <label class=\"k-field\">\n          Método de pago\n          <select formControlName=\"metodoPago\">\n            <option value=\"TRANSFERENCIA\">Transferencia</option>\n            <option value=\"EFECTIVO\">Efectivo</option>\n          </select>\n        </label>\n      </fieldset>\n      <p class=\"k-info\">\n        El número de operación interno y el número de boleta se generan\n        automáticamente al registrar el pago. Podrás consultarlos en\n        Liquidaciones.\n      </p>\n      <div class=\"k-actions\">\n        <button\n          *siPermiso=\"'PAGOS_REGISTRAR'\"\n          type=\"submit\"\n          class=\"k-button\"\n          [disabled]=\"guardando || liqGroup.invalid\"\n        >\n          Registrar pago\n        </button>\n        <button\n          type=\"button\"\n          class=\"k-button k-button-secondary\"\n          routerLink=\"/finanzas\"\n        >\n          Volver a liquidaciones\n        </button>\n      </div>\n    </form>\n  </section>\n</div>\n",
        styles: [],
    })
], LiquidacionForm);
export { LiquidacionForm };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlxdWlkYWNpb24tZm9ybS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL2ZlYXR1cmVzL2ZpbmFuemFzL3BhZ2VzL2xpcXVpZGFjaW9uLWZvcm0vIiwic291cmNlcyI6WyJsaXF1aWRhY2lvbi1mb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQzdFLE9BQU8sRUFDTCxXQUFXLEVBQ1gsU0FBUyxFQUNULG1CQUFtQixFQUNuQixVQUFVLEdBQ1gsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN0QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDOUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQ25GLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyREFBMkQsQ0FBQztBQUN6RixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFFckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQVEzRCxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFlO0lBQ1QsY0FBYyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzNDLGVBQWUsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDeEMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUMzRCxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEtB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QUM7R0FDVyxlQUFlLENBb0czQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnQsIGluamVjdCwgT25Jbml0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7XG4gIEZvcm1Db250cm9sLFxuICBGb3JtR3JvdXAsXG4gIFJlYWN0aXZlRm9ybXNNb2R1bGUsXG4gIFZhbGlkYXRvcnMsXG59IGZyb20gXCJAYW5ndWxhci9mb3Jtc1wiO1xuaW1wb3J0IHsgUm91dGVyTGluayB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcbmltcG9ydCB7IGZpcnN0VmFsdWVGcm9tIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGVycm9yVGV4dCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb3JlL3V0aWxzL2h0dHAtZXJyb3JcIjtcbmltcG9ydCB7IEZlYXR1cmVOYXYgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2NvbXBvbmVudHMvZmVhdHVyZS1uYXYvZmVhdHVyZS1uYXZcIjtcbmltcG9ydCB7IE1vZHVsZUhlYWRlciB9IGZyb20gXCIuLi8uLi8uLi8uLi9zaGFyZWQvY29tcG9uZW50cy9tb2R1bGUtaGVhZGVyL21vZHVsZS1oZWFkZXJcIjtcbmltcG9ydCB7IFNpUGVybWlzbyB9IGZyb20gXCIuLi8uLi8uLi8uLi9zaGFyZWQvZGlyZWN0aXZlcy9zaS1wZXJtaXNvXCI7XG5pbXBvcnQgeyBEb2N0b3IgfSBmcm9tIFwiLi4vLi4vLi4vZG9jdG9yZXMvbW9kZWxzL2RvY3RvcmVzLm1vZGVsXCI7XG5pbXBvcnQgeyBEb2N0b3JTZXJ2aWNlIH0gZnJvbSBcIi4uLy4uLy4uL2RvY3RvcmVzL3NlcnZpY2VzL2RvY3RvcmVzLXNlcnZpY2VcIjtcbmltcG9ydCB7IEZpbmFuemFzU2VydmljZSB9IGZyb20gXCIuLi8uLi9zZXJ2aWNlcy9maW5hbnphcy1zZXJ2aWNlXCI7XG5cbkBDb21wb25lbnQoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbUmVhY3RpdmVGb3Jtc01vZHVsZSwgUm91dGVyTGluaywgRmVhdHVyZU5hdiwgU2lQZXJtaXNvLCBNb2R1bGVIZWFkZXJdLFxuICB0ZW1wbGF0ZTpcIjxkaXYgY2xhc3M9XFxcImstbW9kdWxlIGstZmluYW56YXNcXFwiPlxcbiAgPGhlYWRlclxcbiAgICBhcHBNb2R1bGVIZWFkZXJcXG4gICAgY2xhc3M9XFxcImstbW9kdWxlLWhlYWRlclxcXCJcXG4gICAgY29udGV4dG89XFxcIkdFU1RJw5NOIEVDT07Dk01JQ0EgLyBGSU5BTlpBU1xcXCJcXG4gICAgdGl0dWxvPVxcXCLDgXJlYSBmaW5hbmNpZXJhXFxcIlxcbiAgICBkZXNjcmlwY2lvbj1cXFwiQ29udHJvbGEgbGlxdWlkYWNpb25lcywgcGFnb3MgYSBtw6lkaWNvcyBlIGluZ3Jlc29zIHJlZ2lzdHJhZG9zIGRlIGxhIGdlc3RvcmEuXFxcIlxcbiAgICB0ZXh0b0FjdHVhbGl6YXI9XFxcIuKGuyBBY3R1YWxpemFyIHJlZ2lzdHJvc1xcXCJcXG4gICAgKGFjdHVhbGl6YXIpPVxcXCJjYXJnYXIoKVxcXCJcXG4gID5cXG4gIDwvaGVhZGVyPlxcbiAgPGFwcC1mZWF0dXJlLW5hdiBmZWF0dXJlPVxcXCJmaW5hbnphc1xcXCIgLz5cXG4gIEBpZihlcnJvciB8fCBsaXFHcm91cC5oYXNFcnJvcigncGVyaW9kb0ludmFsaWRvJykpe1xcbiAgPGRpdiBjbGFzcz1cXFwiay1lcnJvclxcXCIgcm9sZT1cXFwiYWxlcnRcXFwiPnt7bGlxR3JvdXAuaGFzRXJyb3IoJ3BlcmlvZG9JbnZhbGlkbycpID8gJ0xhIGZlY2hhIGRlIGZpbiBkZWJlIHNlciBpZ3VhbCBvIHBvc3RlcmlvciBhIGxhIGZlY2hhIGRlIGluaWNpby4nIDogZXJyb3J9fTwvZGl2PlxcbiAgfUBpZihleGl0byl7XFxuICA8ZGl2IGNsYXNzPVxcXCJrLXN1Y2Nlc3NcXFwiIHJvbGU9XFxcInN0YXR1c1xcXCI+e3tleGl0b319PC9kaXY+XFxuICB9XFxuICA8c2VjdGlvbiBjbGFzcz1cXFwiay1wYW5lbFxcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcImstc2VjdGlvbi1oZWFkaW5nXFxcIj5cXG4gICAgICA8ZGl2PlxcbiAgICAgICAgPGgyPlJlZ2lzdHJhciBwYWdvIGEgbcOpZGljbzwvaDI+XFxuICAgICAgICA8cD5TZWxlY2Npb25hIGVsIG3DqWRpY28geSBlbCBwZXJpb2RvIGFsIHF1ZSBjb3JyZXNwb25kZSBlbCBwYWdvLjwvcD5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxmb3JtIFtmb3JtR3JvdXBdPVxcXCJsaXFHcm91cFxcXCIgKG5nU3VibWl0KT1cXFwicmVnaXN0cmFyUGFnbygpXFxcIj5cXG4gICAgICA8ZmllbGRzZXQgY2xhc3M9XFxcImstZm9ybVxcXCIgW2Rpc2FibGVkXT1cXFwiZ3VhcmRhbmRvXFxcIj5cXG4gICAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCI+XFxuICAgICAgICAgIERvY3RvclxcbiAgICAgICAgICA8c2VsZWN0IGZvcm1Db250cm9sTmFtZT1cXFwiaWREb2N0b3JcXFwiPlxcbiAgICAgICAgICAgIDxvcHRpb24gW25nVmFsdWVdPVxcXCJudWxsXFxcIj5TZWxlY2Npb25hIHVuIG3DqWRpY288L29wdGlvbj5cXG4gICAgICAgICAgICBAZm9yIChkb2N0b3Igb2YgZG9jdG9yZXM7IHRyYWNrIGRvY3Rvci5pZERvY3Rvcikge1xcbiAgICAgICAgICAgIDxvcHRpb24gW25nVmFsdWVdPVxcXCJkb2N0b3IuaWREb2N0b3JcXFwiPlxcbiAgICAgICAgICAgICAge3tkb2N0b3Iubm9tYnJlc319IHt7ZG9jdG9yLmFwZWxsaWRvc319XFxuICAgICAgICAgICAgPC9vcHRpb24+XFxuICAgICAgICAgICAgfVxcbiAgICAgICAgICA8L3NlbGVjdD5cXG4gICAgICAgIDwvbGFiZWw+XFxuICAgICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiPlxcbiAgICAgICAgICBGZWNoYSBkZSBpbmljaW9cXG4gICAgICAgICAgPGlucHV0IHR5cGU9XFxcImRhdGVcXFwiIGZvcm1Db250cm9sTmFtZT1cXFwiZmVjaGFJbmljaW9cXFwiIFttYXhdPVxcXCJsaXFHcm91cC5jb250cm9scy5mZWNoYUZpbi52YWx1ZSB8fCAnJ1xcXCIgLz5cXG4gICAgICAgIDwvbGFiZWw+XFxuICAgICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiPlxcbiAgICAgICAgICBGZWNoYSBkZSBmaW5cXG4gICAgICAgICAgPGlucHV0IHR5cGU9XFxcImRhdGVcXFwiIGZvcm1Db250cm9sTmFtZT1cXFwiZmVjaGFGaW5cXFwiIFttaW5dPVxcXCJsaXFHcm91cC5jb250cm9scy5mZWNoYUluaWNpby52YWx1ZSB8fCAnJ1xcXCIgLz5cXG4gICAgICAgIDwvbGFiZWw+XFxuICAgICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiPlxcbiAgICAgICAgICBNb250byBhIHBhZ2FyIChTLylcXG4gICAgICAgICAgPGlucHV0IHR5cGU9XFxcIm51bWJlclxcXCIgbWluPVxcXCIwLjAxXFxcIiBzdGVwPVxcXCIwLjAxXFxcIiBmb3JtQ29udHJvbE5hbWU9XFxcIm1vbnRvXFxcIiAvPlxcbiAgICAgICAgPC9sYWJlbD5cXG4gICAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCI+XFxuICAgICAgICAgIE3DqXRvZG8gZGUgcGFnb1xcbiAgICAgICAgICA8c2VsZWN0IGZvcm1Db250cm9sTmFtZT1cXFwibWV0b2RvUGFnb1xcXCI+XFxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiVFJBTlNGRVJFTkNJQVxcXCI+VHJhbnNmZXJlbmNpYTwvb3B0aW9uPlxcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIkVGRUNUSVZPXFxcIj5FZmVjdGl2bzwvb3B0aW9uPlxcbiAgICAgICAgICA8L3NlbGVjdD5cXG4gICAgICAgIDwvbGFiZWw+XFxuICAgICAgPC9maWVsZHNldD5cXG4gICAgICA8cCBjbGFzcz1cXFwiay1pbmZvXFxcIj5cXG4gICAgICAgIEVsIG7Dum1lcm8gZGUgb3BlcmFjacOzbiBpbnRlcm5vIHkgZWwgbsO6bWVybyBkZSBib2xldGEgc2UgZ2VuZXJhblxcbiAgICAgICAgYXV0b23DoXRpY2FtZW50ZSBhbCByZWdpc3RyYXIgZWwgcGFnby4gUG9kcsOhcyBjb25zdWx0YXJsb3MgZW5cXG4gICAgICAgIExpcXVpZGFjaW9uZXMuXFxuICAgICAgPC9wPlxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImstYWN0aW9uc1xcXCI+XFxuICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICpzaVBlcm1pc289XFxcIidQQUdPU19SRUdJU1RSQVInXFxcIlxcbiAgICAgICAgICB0eXBlPVxcXCJzdWJtaXRcXFwiXFxuICAgICAgICAgIGNsYXNzPVxcXCJrLWJ1dHRvblxcXCJcXG4gICAgICAgICAgW2Rpc2FibGVkXT1cXFwiZ3VhcmRhbmRvIHx8IGxpcUdyb3VwLmludmFsaWRcXFwiXFxuICAgICAgICA+XFxuICAgICAgICAgIFJlZ2lzdHJhciBwYWdvXFxuICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIDxidXR0b25cXG4gICAgICAgICAgdHlwZT1cXFwiYnV0dG9uXFxcIlxcbiAgICAgICAgICBjbGFzcz1cXFwiay1idXR0b24gay1idXR0b24tc2Vjb25kYXJ5XFxcIlxcbiAgICAgICAgICByb3V0ZXJMaW5rPVxcXCIvZmluYW56YXNcXFwiXFxuICAgICAgICA+XFxuICAgICAgICAgIFZvbHZlciBhIGxpcXVpZGFjaW9uZXNcXG4gICAgICAgIDwvYnV0dG9uPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Zvcm0+XFxuICA8L3NlY3Rpb24+XFxuPC9kaXY+XFxuXCIsXG4gIHN0eWxlczpbXSxcbn0pXG5leHBvcnQgY2xhc3MgTGlxdWlkYWNpb25Gb3JtIGltcGxlbWVudHMgT25Jbml0IHtcbiAgcHJpdmF0ZSByZWFkb25seSBjaGFuZ2VEZXRlY3RvciA9IGluamVjdChDaGFuZ2VEZXRlY3RvclJlZik7XG4gIHByaXZhdGUgcmVhZG9ubHkgZG9jdG9yZXNTZXJ2aWNlID0gaW5qZWN0KERvY3RvclNlcnZpY2UpO1xuICBwcml2YXRlIHJlYWRvbmx5IGZpbmFuemFzU2VydmljZSA9IGluamVjdChGaW5hbnphc1NlcnZpY2UpO1xuICBndWFyZGFuZG8gPSBmYWxzZTtcbiAgZXJyb3IgPSBcIlwiO1xuICBleGl0byA9IFwiXCI7XG4gIGRvY3RvcmVzOiBEb2N0b3JbXSA9IFtdO1xuXG4gIHJlYWRvbmx5IGxpcUdyb3VwID0gbmV3IEZvcm1Hcm91cCh7XG4gICAgaWREb2N0b3I6IG5ldyBGb3JtQ29udHJvbDxudW1iZXIgfCBudWxsPihudWxsLCBbXG4gICAgICBWYWxpZGF0b3JzLnJlcXVpcmVkLFxuICAgICAgVmFsaWRhdG9ycy5taW4oMSksXG4gICAgXSksXG4gICAgZmVjaGFJbmljaW86IG5ldyBGb3JtQ29udHJvbChcIlwiLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFZhbGlkYXRvcnMucmVxdWlyZWQsXG4gICAgfSksXG4gICAgZmVjaGFGaW46IG5ldyBGb3JtQ29udHJvbChcIlwiLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFZhbGlkYXRvcnMucmVxdWlyZWQsXG4gICAgfSksXG4gICAgbW9udG86IG5ldyBGb3JtQ29udHJvbDxudW1iZXIgfCBudWxsPihudWxsLCBbXG4gICAgICBWYWxpZGF0b3JzLnJlcXVpcmVkLFxuICAgICAgVmFsaWRhdG9ycy5taW4oMC4wMSksXG4gICAgXSksXG4gICAgbWV0b2RvUGFnbzogbmV3IEZvcm1Db250cm9sKFwiVFJBTlNGRVJFTkNJQVwiLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFZhbGlkYXRvcnMucmVxdWlyZWQsXG4gICAgfSksXG4gIH0sIHtcbiAgICB2YWxpZGF0b3JzOiAoZm9ybSkgPT4ge1xuICAgICAgY29uc3QgaW5pY2lvID0gZm9ybS5nZXQoXCJmZWNoYUluaWNpb1wiKT8udmFsdWU7XG4gICAgICBjb25zdCBmaW4gPSBmb3JtLmdldChcImZlY2hhRmluXCIpPy52YWx1ZTtcbiAgICAgIHJldHVybiBpbmljaW8gJiYgZmluICYmIGZpbiA8IGluaWNpbyA/IHsgcGVyaW9kb0ludmFsaWRvOiB0cnVlIH0gOiBudWxsO1xuICAgIH0sXG4gIH0pO1xuXG4gIG5nT25Jbml0KCkge1xuICAgIHZvaWQgdGhpcy5jYXJnYXIoKTtcbiAgfVxuXG4gIGFzeW5jIGNhcmdhcigpIHtcbiAgICB0aGlzLmVycm9yID0gXCJcIjtcbiAgICB0cnkge1xuICAgICAgdGhpcy5kb2N0b3JlcyA9IGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMuZG9jdG9yZXNTZXJ2aWNlLmxpc3RhcigpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlcnJvcik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVnaXN0cmFyUGFnbygpIHtcbiAgICBpZiAodGhpcy5ndWFyZGFuZG8pIHJldHVybjtcbiAgICB0aGlzLmVycm9yID0gXCJcIjtcbiAgICB0aGlzLmV4aXRvID0gXCJcIjtcbiAgICBjb25zdCB7IGlkRG9jdG9yLCBtb250bywgZmVjaGFJbmljaW8sIGZlY2hhRmluLCBtZXRvZG9QYWdvIH0gPVxuICAgICAgdGhpcy5saXFHcm91cC5nZXRSYXdWYWx1ZSgpO1xuICAgIGlmICh0aGlzLmxpcUdyb3VwLmhhc0Vycm9yKFwicGVyaW9kb0ludmFsaWRvXCIpKSB7XG4gICAgICB0aGlzLmxpcUdyb3VwLm1hcmtBbGxBc1RvdWNoZWQoKTtcbiAgICAgIHRoaXMuZXJyb3IgPSBcIkxhIGZlY2hhIGRlIGZpbiBkZWJlIHNlciBpZ3VhbCBvIHBvc3RlcmlvciBhIGxhIGZlY2hhIGRlIGluaWNpby5cIjtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgdGhpcy5saXFHcm91cC5pbnZhbGlkIHx8XG4gICAgICBpZERvY3RvciA9PT0gbnVsbCB8fFxuICAgICAgbW9udG8gPT09IG51bGwgfHxcbiAgICAgICFOdW1iZXIuaXNGaW5pdGUobW9udG8pXG4gICAgKSB7XG4gICAgICB0aGlzLmxpcUdyb3VwLm1hcmtBbGxBc1RvdWNoZWQoKTtcbiAgICAgIHRoaXMuZXJyb3IgPSBcIkNvbXBsZXRhIGxvcyBkYXRvcyBkZWwgbcOpZGljbywgZWwgcGVyaW9kbyB5IGVsIHBhZ28uXCI7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChmZWNoYUluaWNpbyA+IGZlY2hhRmluKSB7XG4gICAgICB0aGlzLmVycm9yID1cbiAgICAgICAgXCJMYSBmZWNoYSBkZSBmaW4gZGViZSBzZXIgaWd1YWwgbyBwb3N0ZXJpb3IgYSBsYSBmZWNoYSBkZSBpbmljaW8uXCI7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5ndWFyZGFuZG8gPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHRhZG8gPSBhd2FpdCBmaXJzdFZhbHVlRnJvbShcbiAgICAgICAgdGhpcy5maW5hbnphc1NlcnZpY2UucGFnYXIoe1xuICAgICAgICAgIGlkRG9jdG9yLFxuICAgICAgICAgIGZlY2hhSW5pY2lvLFxuICAgICAgICAgIGZlY2hhRmluLFxuICAgICAgICAgIG1vbnRvLFxuICAgICAgICAgIG1ldG9kb1BhZ28sXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICAgIHRoaXMuZXhpdG8gPSBcIk9wZXJhY2nDs24gcmVhbGl6YWRhIGNvcnJlY3RhbWVudGVcIjtcbiAgICAgIHRoaXMubGlxR3JvdXAucmVzZXQoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlcnJvcik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZ3VhcmRhbmRvID0gZmFsc2U7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxufVxuIl19
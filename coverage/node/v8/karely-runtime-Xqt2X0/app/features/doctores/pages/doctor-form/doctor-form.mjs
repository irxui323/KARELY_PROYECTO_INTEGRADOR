var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText, formErrorText } from '../../../../core/utils/http-error.mjs';
import { FeatureNav } from '../../../../shared/components/feature-nav/feature-nav.mjs';
import { ControlDisabled } from '../../../../shared/directives/control-disabled.mjs';
import { SiPermiso } from '../../../../shared/directives/si-permiso.mjs';
import { DoctorService } from '../../services/doctores-service.mjs';
import { CatalogoService } from '../../../catalogos/services/catalogos-service.mjs';
let DoctorForm = class DoctorForm {
    changeDetector = inject(ChangeDetectorRef);
    guardando = false;
    consultandoDni = false;
    router = inject(Router);
    route = inject(ActivatedRoute, { optional: true });
    constructor() {
        this.doctorForm = {};
    }
    doctoresService = inject(DoctorService);
    catalogosService = inject(CatalogoService);
    error = "";
    exito = "";
    tipoDocumento = "DNI";
    doctorFormGroup = new FormGroup({
        idDoctor: new FormControl(undefined, {
            nonNullable: true,
        }),
        tipoDocumento: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(12)],
        }),
        numeroDocumento: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(20)],
        }),
        nombres: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)],
        }),
        apellidos: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)],
        }),
        telefono: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.maxLength(20)],
        }),
        correo: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.email, Validators.maxLength(150)],
        }),
        estado: new FormControl(undefined, {
            nonNullable: true,
        }),
    });
    get doctorForm() {
        return this.doctorFormGroup.getRawValue();
    }
    set doctorForm(value) {
        this.doctorFormGroup.reset(value);
    }
    ngOnInit() {
        void this.cargar();
    }
    async cargar() {
        try {
            try {
                const id = this.route?.snapshot.paramMap.get("id");
                if (id) {
                    const records = await firstValueFrom(this.doctoresService.listar());
                    const doctor = records.find((d) => d.idDoctor === Number(id));
                    if (!doctor) {
                        this.error = "Doctor no encontrado";
                        return;
                    }
                    this.editar(doctor);
                }
                else
                    this.nuevo();
            }
            catch (e) {
                this.error = errorText(e);
            }
        }
        finally {
            this.changeDetector.markForCheck();
        }
    }
    nuevo() {
        this.doctorForm = {
            tipoDocumento: "DNI",
            numeroDocumento: "",
            nombres: "",
            apellidos: "",
            telefono: "",
            correo: "",
            estado: "ACTIVO",
        };
    }
    editar(d) {
        this.doctorForm = {
            idDoctor: d.idDoctor,
            tipoDocumento: d.tipoDocumento,
            numeroDocumento: d.numeroDocumento,
            nombres: d.nombres,
            apellidos: d.apellidos,
            telefono: d.telefono,
            correo: d.correo,
            estado: d.estado,
        };
    }
    async run(action, data, msg = "Operación realizada") {
        try {
            this.error = "";
            this.exito = "";
            try {
                await firstValueFrom(this.doctoresService.ejecutar(action, data));
                this.exito = msg;
                await this.cargar();
            }
            catch (e) {
                this.error = errorText(e);
            }
        }
        finally {
            this.changeDetector.markForCheck();
        }
    }
    async guardarDoctor() {
        if (this.guardando)
            return;
        this.guardando = true;
        try {
            if (this.doctorFormGroup.invalid) {
                this.doctorFormGroup.markAllAsTouched();
                this.exito = "";
                this.error = formErrorText(this.doctorFormGroup);
                return;
            }
            if (!this.registroDisponible) {
                this.error =
                    "No se puede guardar: el doctor de esta edición no se ha cargado.";
                return;
            }
            await this.run(this.doctorForm.idDoctor ? "doctor-editar" : "doctor-crear", this.doctorForm, "Doctor registrado");
            if (!this.error)
                void this.router.navigateByUrl("/doctores");
        }
        finally {
            this.guardando = false;
            this.changeDetector.markForCheck();
        }
    }
    async consultarDni() {
        if (this.doctorForm.idDoctor || this.doctorForm.tipoDocumento !== "DNI")
            return;
        const dni = (this.doctorForm.numeroDocumento || "").trim();
        if (!/^\d{8}$/.test(dni))
            return;
        this.consultandoDni = true;
        this.error = "";
        try {
            const persona = await firstValueFrom(this.catalogosService.consultarDni(dni));
            this.doctorFormGroup.patchValue({
                nombres: persona.nombres,
                apellidos: `${persona.apellidoPaterno} ${persona.apellidoMaterno}`.trim(),
            });
        }
        catch (e) {
            this.error = errorText(e);
        }
        finally {
            this.consultandoDni = false;
            this.changeDetector.markForCheck();
        }
    }
    get registroDisponible() {
        const id = this.route?.snapshot.paramMap.get("id");
        return !id || Number(id) === this.doctorForm.idDoctor;
    }
};
DoctorForm = __decorate([
    Component({
        standalone: true,
        imports: [
            ControlDisabled,
            ReactiveFormsModule,
            RouterLink,
            FeatureNav,
            SiPermiso,
        ],
        template: "<div class=\"k-module k-doctores\">\n  <header class=\"k-module-header\">\n    <div>\n      <span class=\"k-eyebrow\">GESTIÓN CLÍNICA / PERSONAL MÉDICO</span>\n      <h1 class=\"k-title\">Doctores</h1>\n      <p class=\"k-subtitle\">\n        Administra médicos, especialidades, documentos y disponibilidad de\n        atención.\n      </p>\n    </div>\n    <div class=\"k-header-actions\">\n      <button class=\"k-button k-button-secondary\" (click)=\"cargar()\">\n        ↻ Actualizar datos\n      </button>\n    </div>\n  </header>\n  <app-feature-nav feature=\"doctores\" />\n  @if(error){\n  <div class=\"k-error\" role=\"alert\">{{error}}</div>\n  }@if(exito){\n  <div class=\"k-success\" role=\"status\">{{exito}}</div>\n  }\n  <section class=\"k-panel\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>\n          {{doctorForm.idDoctor?'Editar médico':'Registrar nuevo médico'}}\n        </h2>\n        <p>Datos de identificación y contacto profesional.</p>\n      </div>\n    </div>\n    <div class=\"k-form\">\n      <label class=\"k-field\"\n        >Tipo de documento<select\n          [formControl]=\"doctorFormGroup.controls.tipoDocumento\"\n          [appControlDisabled]=\"!!doctorForm.idDoctor\"\n        >\n          <option>DNI</option>\n          <option>CE</option>\n        </select></label\n      ><label class=\"k-field\"\n        >Número de documento<input\n          [formControl]=\"doctorFormGroup.controls.numeroDocumento\"\n          [appControlDisabled]=\"!!doctorForm.idDoctor\"\n          (blur)=\"consultarDni()\"\n      /></label>\n      @if(consultandoDni){<span class=\"k-field-hint\">Consultando DNI...</span>}\n      <label class=\"k-field\"\n        >Nombres<input\n          [formControl]=\"doctorFormGroup.controls.nombres\" /></label\n      ><label class=\"k-field\"\n        >Apellidos<input [formControl]=\"doctorFormGroup.controls.apellidos\"\n      /></label>\n      <label class=\"k-field\"\n        >Teléfono<input\n          [formControl]=\"doctorFormGroup.controls.telefono\" /></label\n      ><label class=\"k-field\"\n        >Correo electrónico<input\n          type=\"email\"\n          [formControl]=\"doctorFormGroup.controls.correo\"\n      /></label>\n      @if(doctorForm.idDoctor){<label class=\"k-field\"\n        >Estado<select [formControl]=\"doctorFormGroup.controls.estado\">\n          <option>ACTIVO</option>\n          <option>INACTIVO</option>\n        </select></label\n      >}\n    </div>\n    <div class=\"k-actions\">\n      <button\n        [disabled]=\"guardando || !registroDisponible\"\n        *siPermiso=\"'DOCTORES_ESCRIBIR'\"\n        class=\"k-button\"\n        (click)=\"guardarDoctor()\"\n      >\n        Guardar doctor</button\n      ><button class=\"k-button k-button-secondary\" routerLink=\"/doctores\">\n        Volver al listado\n      </button>\n    </div>\n  </section>\n</div>\n",
        styles: [],
    })
], DoctorForm);
export { DoctorForm };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdG9yLWZvcm0uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9DOi9VTklWRVJTSURBRC9MUDIvU0VNQU5BMTEva2FyZWx5X21vZGVybm8vZnJvbnRlbmQvc3JjL2FwcC9mZWF0dXJlcy9kb2N0b3Jlcy9wYWdlcy9kb2N0b3ItZm9ybS8iLCJzb3VyY2VzIjpbImRvY3Rvci1mb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQzdFLE9BQU8sRUFDTCxXQUFXLEVBQ1gsU0FBUyxFQUNULG1CQUFtQixFQUNuQixVQUFVLEdBQ1gsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNyRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDN0UsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQ25GLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUNqRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFNckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ2hFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQWN6RSxJQUFNLFVBQVUsR0FBaEIsTUFBTSxVQUFVO0lBQ0osY0FBYyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzVELFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDbEIsY0FBYyxHQUFHLEtBQUssQ0FBQztJQUVOLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEIsS0FB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cG9ydCB7IENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnQsIGluamVjdCwgT25Jbml0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7XG4gIEZvcm1Db250cm9sLFxuICBGb3JtR3JvdXAsXG4gIFJlYWN0aXZlRm9ybXNNb2R1bGUsXG4gIFZhbGlkYXRvcnMsXG59IGZyb20gXCJAYW5ndWxhci9mb3Jtc1wiO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUsIFJvdXRlciwgUm91dGVyTGluayB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcbmltcG9ydCB7IGZpcnN0VmFsdWVGcm9tIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGVycm9yVGV4dCwgZm9ybUVycm9yVGV4dCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb3JlL3V0aWxzL2h0dHAtZXJyb3JcIjtcbmltcG9ydCB7IEZlYXR1cmVOYXYgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2NvbXBvbmVudHMvZmVhdHVyZS1uYXYvZmVhdHVyZS1uYXZcIjtcbmltcG9ydCB7IENvbnRyb2xEaXNhYmxlZCB9IGZyb20gXCIuLi8uLi8uLi8uLi9zaGFyZWQvZGlyZWN0aXZlcy9jb250cm9sLWRpc2FibGVkXCI7XG5pbXBvcnQgeyBTaVBlcm1pc28gfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2RpcmVjdGl2ZXMvc2ktcGVybWlzb1wiO1xuaW1wb3J0IHtcbiAgRG9jdG9yLFxuICBEb2N0b3JBY2Npb24sXG4gIERvY3RvclJlcXVlc3QsXG59IGZyb20gXCIuLi8uLi9tb2RlbHMvZG9jdG9yZXMubW9kZWxcIjtcbmltcG9ydCB7IERvY3RvclNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2VydmljZXMvZG9jdG9yZXMtc2VydmljZVwiO1xuaW1wb3J0IHsgQ2F0YWxvZ29TZXJ2aWNlIH0gZnJvbSBcIi4uLy4uLy4uL2NhdGFsb2dvcy9zZXJ2aWNlcy9jYXRhbG9nb3Mtc2VydmljZVwiO1xuXG5AQ29tcG9uZW50KHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW1xuICAgIENvbnRyb2xEaXNhYmxlZCxcbiAgICBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxuICAgIFJvdXRlckxpbmssXG4gICAgRmVhdHVyZU5hdixcbiAgICBTaVBlcm1pc28sXG4gIF0sXG4gIHRlbXBsYXRlOlwiPGRpdiBjbGFzcz1cXFwiay1tb2R1bGUgay1kb2N0b3Jlc1xcXCI+XFxuICA8aGVhZGVyIGNsYXNzPVxcXCJrLW1vZHVsZS1oZWFkZXJcXFwiPlxcbiAgICA8ZGl2PlxcbiAgICAgIDxzcGFuIGNsYXNzPVxcXCJrLWV5ZWJyb3dcXFwiPkdFU1RJw5NOIENMw41OSUNBIC8gUEVSU09OQUwgTcOJRElDTzwvc3Bhbj5cXG4gICAgICA8aDEgY2xhc3M9XFxcImstdGl0bGVcXFwiPkRvY3RvcmVzPC9oMT5cXG4gICAgICA8cCBjbGFzcz1cXFwiay1zdWJ0aXRsZVxcXCI+XFxuICAgICAgICBBZG1pbmlzdHJhIG3DqWRpY29zLCBlc3BlY2lhbGlkYWRlcywgZG9jdW1lbnRvcyB5IGRpc3BvbmliaWxpZGFkIGRlXFxuICAgICAgICBhdGVuY2nDs24uXFxuICAgICAgPC9wPlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1oZWFkZXItYWN0aW9uc1xcXCI+XFxuICAgICAgPGJ1dHRvbiBjbGFzcz1cXFwiay1idXR0b24gay1idXR0b24tc2Vjb25kYXJ5XFxcIiAoY2xpY2spPVxcXCJjYXJnYXIoKVxcXCI+XFxuICAgICAgICDihrsgQWN0dWFsaXphciBkYXRvc1xcbiAgICAgIDwvYnV0dG9uPlxcbiAgICA8L2Rpdj5cXG4gIDwvaGVhZGVyPlxcbiAgPGFwcC1mZWF0dXJlLW5hdiBmZWF0dXJlPVxcXCJkb2N0b3Jlc1xcXCIgLz5cXG4gIEBpZihlcnJvcil7XFxuICA8ZGl2IGNsYXNzPVxcXCJrLWVycm9yXFxcIiByb2xlPVxcXCJhbGVydFxcXCI+e3tlcnJvcn19PC9kaXY+XFxuICB9QGlmKGV4aXRvKXtcXG4gIDxkaXYgY2xhc3M9XFxcImstc3VjY2Vzc1xcXCIgcm9sZT1cXFwic3RhdHVzXFxcIj57e2V4aXRvfX08L2Rpdj5cXG4gIH1cXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJrLXBhbmVsXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1zZWN0aW9uLWhlYWRpbmdcXFwiPlxcbiAgICAgIDxkaXY+XFxuICAgICAgICA8aDI+XFxuICAgICAgICAgIHt7ZG9jdG9yRm9ybS5pZERvY3Rvcj8nRWRpdGFyIG3DqWRpY28nOidSZWdpc3RyYXIgbnVldm8gbcOpZGljbyd9fVxcbiAgICAgICAgPC9oMj5cXG4gICAgICAgIDxwPkRhdG9zIGRlIGlkZW50aWZpY2FjacOzbiB5IGNvbnRhY3RvIHByb2Zlc2lvbmFsLjwvcD5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcImstZm9ybVxcXCI+XFxuICAgICAgPGxhYmVsIGNsYXNzPVxcXCJrLWZpZWxkXFxcIlxcbiAgICAgICAgPlRpcG8gZGUgZG9jdW1lbnRvPHNlbGVjdFxcbiAgICAgICAgICBbZm9ybUNvbnRyb2xdPVxcXCJkb2N0b3JGb3JtR3JvdXAuY29udHJvbHMudGlwb0RvY3VtZW50b1xcXCJcXG4gICAgICAgICAgW2FwcENvbnRyb2xEaXNhYmxlZF09XFxcIiEhZG9jdG9yRm9ybS5pZERvY3RvclxcXCJcXG4gICAgICAgID5cXG4gICAgICAgICAgPG9wdGlvbj5ETkk8L29wdGlvbj5cXG4gICAgICAgICAgPG9wdGlvbj5DRTwvb3B0aW9uPlxcbiAgICAgICAgPC9zZWxlY3Q+PC9sYWJlbFxcbiAgICAgID48bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+TsO6bWVybyBkZSBkb2N1bWVudG88aW5wdXRcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwiZG9jdG9yRm9ybUdyb3VwLmNvbnRyb2xzLm51bWVyb0RvY3VtZW50b1xcXCJcXG4gICAgICAgICAgW2FwcENvbnRyb2xEaXNhYmxlZF09XFxcIiEhZG9jdG9yRm9ybS5pZERvY3RvclxcXCJcXG4gICAgICAgICAgKGJsdXIpPVxcXCJjb25zdWx0YXJEbmkoKVxcXCJcXG4gICAgICAvPjwvbGFiZWw+XFxuICAgICAgQGlmKGNvbnN1bHRhbmRvRG5pKXs8c3BhbiBjbGFzcz1cXFwiay1maWVsZC1oaW50XFxcIj5Db25zdWx0YW5kbyBETkkuLi48L3NwYW4+fVxcbiAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5Ob21icmVzPGlucHV0XFxuICAgICAgICAgIFtmb3JtQ29udHJvbF09XFxcImRvY3RvckZvcm1Hcm91cC5jb250cm9scy5ub21icmVzXFxcIiAvPjwvbGFiZWxcXG4gICAgICA+PGxhYmVsIGNsYXNzPVxcXCJrLWZpZWxkXFxcIlxcbiAgICAgICAgPkFwZWxsaWRvczxpbnB1dCBbZm9ybUNvbnRyb2xdPVxcXCJkb2N0b3JGb3JtR3JvdXAuY29udHJvbHMuYXBlbGxpZG9zXFxcIlxcbiAgICAgIC8+PC9sYWJlbD5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+VGVsw6lmb25vPGlucHV0XFxuICAgICAgICAgIFtmb3JtQ29udHJvbF09XFxcImRvY3RvckZvcm1Hcm91cC5jb250cm9scy50ZWxlZm9ub1xcXCIgLz48L2xhYmVsXFxuICAgICAgPjxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5Db3JyZW8gZWxlY3Ryw7NuaWNvPGlucHV0XFxuICAgICAgICAgIHR5cGU9XFxcImVtYWlsXFxcIlxcbiAgICAgICAgICBbZm9ybUNvbnRyb2xdPVxcXCJkb2N0b3JGb3JtR3JvdXAuY29udHJvbHMuY29ycmVvXFxcIlxcbiAgICAgIC8+PC9sYWJlbD5cXG4gICAgICBAaWYoZG9jdG9yRm9ybS5pZERvY3Rvcil7PGxhYmVsIGNsYXNzPVxcXCJrLWZpZWxkXFxcIlxcbiAgICAgICAgPkVzdGFkbzxzZWxlY3QgW2Zvcm1Db250cm9sXT1cXFwiZG9jdG9yRm9ybUdyb3VwLmNvbnRyb2xzLmVzdGFkb1xcXCI+XFxuICAgICAgICAgIDxvcHRpb24+QUNUSVZPPC9vcHRpb24+XFxuICAgICAgICAgIDxvcHRpb24+SU5BQ1RJVk88L29wdGlvbj5cXG4gICAgICAgIDwvc2VsZWN0PjwvbGFiZWxcXG4gICAgICA+fVxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1hY3Rpb25zXFxcIj5cXG4gICAgICA8YnV0dG9uXFxuICAgICAgICBbZGlzYWJsZWRdPVxcXCJndWFyZGFuZG8gfHwgIXJlZ2lzdHJvRGlzcG9uaWJsZVxcXCJcXG4gICAgICAgICpzaVBlcm1pc289XFxcIidET0NUT1JFU19FU0NSSUJJUidcXFwiXFxuICAgICAgICBjbGFzcz1cXFwiay1idXR0b25cXFwiXFxuICAgICAgICAoY2xpY2spPVxcXCJndWFyZGFyRG9jdG9yKClcXFwiXFxuICAgICAgPlxcbiAgICAgICAgR3VhcmRhciBkb2N0b3I8L2J1dHRvblxcbiAgICAgID48YnV0dG9uIGNsYXNzPVxcXCJrLWJ1dHRvbiBrLWJ1dHRvbi1zZWNvbmRhcnlcXFwiIHJvdXRlckxpbms9XFxcIi9kb2N0b3Jlc1xcXCI+XFxuICAgICAgICBWb2x2ZXIgYWwgbGlzdGFkb1xcbiAgICAgIDwvYnV0dG9uPlxcbiAgICA8L2Rpdj5cXG4gIDwvc2VjdGlvbj5cXG48L2Rpdj5cXG5cIixcbiAgc3R5bGVzOltdLFxufSlcbmV4cG9ydCBjbGFzcyBEb2N0b3JGb3JtIGltcGxlbWVudHMgT25Jbml0IHtcbiAgcHJpdmF0ZSByZWFkb25seSBjaGFuZ2VEZXRlY3RvciA9IGluamVjdChDaGFuZ2VEZXRlY3RvclJlZik7XG4gIGd1YXJkYW5kbyA9IGZhbHNlO1xuICBjb25zdWx0YW5kb0RuaSA9IGZhbHNlO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgcm91dGVyID0gaW5qZWN0KFJvdXRlcik7XG4gIHByaXZhdGUgcmVhZG9ubHkgcm91dGUgPSBpbmplY3QoQWN0aXZhdGVkUm91dGUsIHsgb3B0aW9uYWw6IHRydWUgfSk7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZG9jdG9yRm9ybSA9IHt9O1xuICB9XG4gIHByaXZhdGUgZG9jdG9yZXNTZXJ2aWNlID0gaW5qZWN0KERvY3RvclNlcnZpY2UpO1xuICBwcml2YXRlIGNhdGFsb2dvc1NlcnZpY2UgPSBpbmplY3QoQ2F0YWxvZ29TZXJ2aWNlKTtcbiAgZXJyb3IgPSBcIlwiO1xuICBleGl0byA9IFwiXCI7XG4gIHRpcG9Eb2N1bWVudG8gPSBcIkROSVwiO1xuICByZWFkb25seSBkb2N0b3JGb3JtR3JvdXAgPSBuZXcgRm9ybUdyb3VwKHtcbiAgICBpZERvY3RvcjogbmV3IEZvcm1Db250cm9sPG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQ+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgfSksXG4gICAgdGlwb0RvY3VtZW50bzogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbVmFsaWRhdG9ycy5yZXF1aXJlZCwgVmFsaWRhdG9ycy5wYXR0ZXJuKC9cXFMvKSwgVmFsaWRhdG9ycy5tYXhMZW5ndGgoMTIpXSxcbiAgICB9KSxcbiAgICBudW1lcm9Eb2N1bWVudG86IG5ldyBGb3JtQ29udHJvbDxzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsPih1bmRlZmluZWQsIHtcbiAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgICAgdmFsaWRhdG9yczogW1ZhbGlkYXRvcnMucmVxdWlyZWQsIFZhbGlkYXRvcnMucGF0dGVybigvXFxTLyksIFZhbGlkYXRvcnMubWF4TGVuZ3RoKDIwKV0sXG4gICAgfSksXG4gICAgbm9tYnJlczogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbVmFsaWRhdG9ycy5yZXF1aXJlZCwgVmFsaWRhdG9ycy5wYXR0ZXJuKC9cXFMvKSwgVmFsaWRhdG9ycy5tYXhMZW5ndGgoMTAwKV0sXG4gICAgfSksXG4gICAgYXBlbGxpZG9zOiBuZXcgRm9ybUNvbnRyb2w8c3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtWYWxpZGF0b3JzLnJlcXVpcmVkLCBWYWxpZGF0b3JzLnBhdHRlcm4oL1xcUy8pLCBWYWxpZGF0b3JzLm1heExlbmd0aCgxMDApXSxcbiAgICB9KSxcbiAgICB0ZWxlZm9ubzogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbVmFsaWRhdG9ycy5tYXhMZW5ndGgoMjApXSxcbiAgICB9KSxcbiAgICBjb3JyZW86IG5ldyBGb3JtQ29udHJvbDxzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsPih1bmRlZmluZWQsIHtcbiAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgICAgdmFsaWRhdG9yczogW1ZhbGlkYXRvcnMuZW1haWwsIFZhbGlkYXRvcnMubWF4TGVuZ3RoKDE1MCldLFxuICAgIH0pLFxuICAgIGVzdGFkbzogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgfSksXG4gIH0pO1xuICBnZXQgZG9jdG9yRm9ybSgpOiBEb2N0b3JSZXF1ZXN0IHtcbiAgICByZXR1cm4gdGhpcy5kb2N0b3JGb3JtR3JvdXAuZ2V0UmF3VmFsdWUoKTtcbiAgfVxuICBzZXQgZG9jdG9yRm9ybSh2YWx1ZTogRG9jdG9yUmVxdWVzdCkge1xuICAgIHRoaXMuZG9jdG9yRm9ybUdyb3VwLnJlc2V0KHZhbHVlKTtcbiAgfVxuICBuZ09uSW5pdCgpIHtcbiAgICB2b2lkIHRoaXMuY2FyZ2FyKCk7XG4gIH1cbiAgYXN5bmMgY2FyZ2FyKCkge1xuICAgIHRyeSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBpZCA9IHRoaXMucm91dGU/LnNuYXBzaG90LnBhcmFtTWFwLmdldChcImlkXCIpO1xuICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICBjb25zdCByZWNvcmRzID0gYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5kb2N0b3Jlc1NlcnZpY2UubGlzdGFyKCkpO1xuICAgICAgICAgIGNvbnN0IGRvY3RvciA9IHJlY29yZHMuZmluZCgoZCkgPT4gZC5pZERvY3RvciA9PT0gTnVtYmVyKGlkKSk7XG4gICAgICAgICAgaWYgKCFkb2N0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3IgPSBcIkRvY3RvciBubyBlbmNvbnRyYWRvXCI7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZWRpdGFyKGRvY3Rvcik7XG4gICAgICAgIH0gZWxzZSB0aGlzLm51ZXZvKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBlcnJvclRleHQoZSk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG4gIG51ZXZvKCkge1xuICAgIHRoaXMuZG9jdG9yRm9ybSA9IHtcbiAgICAgIHRpcG9Eb2N1bWVudG86IFwiRE5JXCIsXG4gICAgICBudW1lcm9Eb2N1bWVudG86IFwiXCIsXG4gICAgICBub21icmVzOiBcIlwiLFxuICAgICAgYXBlbGxpZG9zOiBcIlwiLFxuICAgICAgdGVsZWZvbm86IFwiXCIsXG4gICAgICBjb3JyZW86IFwiXCIsXG4gICAgICBlc3RhZG86IFwiQUNUSVZPXCIsXG4gICAgfTtcbiAgfVxuICBlZGl0YXIoZDogRG9jdG9yKSB7XG4gICAgdGhpcy5kb2N0b3JGb3JtID0ge1xuICAgICAgaWREb2N0b3I6IGQuaWREb2N0b3IsXG4gICAgICB0aXBvRG9jdW1lbnRvOiBkLnRpcG9Eb2N1bWVudG8sXG4gICAgICBudW1lcm9Eb2N1bWVudG86IGQubnVtZXJvRG9jdW1lbnRvLFxuICAgICAgbm9tYnJlczogZC5ub21icmVzLFxuICAgICAgYXBlbGxpZG9zOiBkLmFwZWxsaWRvcyxcbiAgICAgIHRlbGVmb25vOiBkLnRlbGVmb25vLFxuICAgICAgY29ycmVvOiBkLmNvcnJlbyxcbiAgICAgIGVzdGFkbzogZC5lc3RhZG8sXG4gICAgfTtcbiAgfVxuICBhc3luYyBydW4oXG4gICAgYWN0aW9uOiBEb2N0b3JBY2Npb24sXG4gICAgZGF0YTogRG9jdG9yUmVxdWVzdCxcbiAgICBtc2cgPSBcIk9wZXJhY2nDs24gcmVhbGl6YWRhXCIsXG4gICkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmVycm9yID0gXCJcIjtcbiAgICAgIHRoaXMuZXhpdG8gPSBcIlwiO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5kb2N0b3Jlc1NlcnZpY2UuZWplY3V0YXIoYWN0aW9uLCBkYXRhKSk7XG4gICAgICAgIHRoaXMuZXhpdG8gPSBtc2c7XG4gICAgICAgIGF3YWl0IHRoaXMuY2FyZ2FyKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBlcnJvclRleHQoZSk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG4gIGFzeW5jIGd1YXJkYXJEb2N0b3IoKSB7XG4gICAgaWYgKHRoaXMuZ3VhcmRhbmRvKSByZXR1cm47XG4gICAgdGhpcy5ndWFyZGFuZG8gPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICBpZiAodGhpcy5kb2N0b3JGb3JtR3JvdXAuaW52YWxpZCkge1xuICAgICAgICB0aGlzLmRvY3RvckZvcm1Hcm91cC5tYXJrQWxsQXNUb3VjaGVkKCk7XG4gICAgICAgIHRoaXMuZXhpdG8gPSBcIlwiO1xuICAgICAgICB0aGlzLmVycm9yID0gZm9ybUVycm9yVGV4dCh0aGlzLmRvY3RvckZvcm1Hcm91cCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5yZWdpc3Ryb0Rpc3BvbmlibGUpIHtcbiAgICAgICAgdGhpcy5lcnJvciA9XG4gICAgICAgICAgXCJObyBzZSBwdWVkZSBndWFyZGFyOiBlbCBkb2N0b3IgZGUgZXN0YSBlZGljacOzbiBubyBzZSBoYSBjYXJnYWRvLlwiO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLnJ1bihcbiAgICAgICAgdGhpcy5kb2N0b3JGb3JtLmlkRG9jdG9yID8gXCJkb2N0b3ItZWRpdGFyXCIgOiBcImRvY3Rvci1jcmVhclwiLFxuICAgICAgICB0aGlzLmRvY3RvckZvcm0sXG4gICAgICAgIFwiRG9jdG9yIHJlZ2lzdHJhZG9cIixcbiAgICAgICk7XG4gICAgICBpZiAoIXRoaXMuZXJyb3IpIHZvaWQgdGhpcy5yb3V0ZXIubmF2aWdhdGVCeVVybChcIi9kb2N0b3Jlc1wiKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5ndWFyZGFuZG8gPSBmYWxzZTtcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG4gIGFzeW5jIGNvbnN1bHRhckRuaSgpIHtcbiAgICBpZiAodGhpcy5kb2N0b3JGb3JtLmlkRG9jdG9yIHx8IHRoaXMuZG9jdG9yRm9ybS50aXBvRG9jdW1lbnRvICE9PSBcIkROSVwiKSByZXR1cm47XG4gICAgY29uc3QgZG5pID0gKHRoaXMuZG9jdG9yRm9ybS5udW1lcm9Eb2N1bWVudG8gfHwgXCJcIikudHJpbSgpO1xuICAgIGlmICghL15cXGR7OH0kLy50ZXN0KGRuaSkpIHJldHVybjtcbiAgICB0aGlzLmNvbnN1bHRhbmRvRG5pID0gdHJ1ZTtcbiAgICB0aGlzLmVycm9yID0gXCJcIjtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGVyc29uYSA9IGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMuY2F0YWxvZ29zU2VydmljZS5jb25zdWx0YXJEbmkoZG5pKSk7XG4gICAgICB0aGlzLmRvY3RvckZvcm1Hcm91cC5wYXRjaFZhbHVlKHtcbiAgICAgICAgbm9tYnJlczogcGVyc29uYS5ub21icmVzLFxuICAgICAgICBhcGVsbGlkb3M6IGAke3BlcnNvbmEuYXBlbGxpZG9QYXRlcm5vfSAke3BlcnNvbmEuYXBlbGxpZG9NYXRlcm5vfWAudHJpbSgpLFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5jb25zdWx0YW5kb0RuaSA9IGZhbHNlO1xuICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbiAgZ2V0IHJlZ2lzdHJvRGlzcG9uaWJsZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCBpZCA9IHRoaXMucm91dGU/LnNuYXBzaG90LnBhcmFtTWFwLmdldChcImlkXCIpO1xuICAgIHJldHVybiAhaWQgfHwgTnVtYmVyKGlkKSA9PT0gdGhpcy5kb2N0b3JGb3JtLmlkRG9jdG9yO1xuICB9XG59XG4iXX0=
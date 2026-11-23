var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { errorText } from '../../../../core/utils/http-error.mjs';
import { FeatureNav } from '../../../../shared/components/feature-nav/feature-nav.mjs';
import { ModuleHeader } from '../../../../shared/components/module-header/module-header.mjs';
import { AdministracionService } from '../../services/administracion-service.mjs';
let CatalogoForm = class CatalogoForm {
    changeDetector = inject(ChangeDetectorRef);
    guardando = false;
    constructor() {
        this.esp = {};
        this.cons = {};
        this.franja = {};
    }
    administracionService = inject(AdministracionService);
    error = "";
    exito = "";
    espGroup = new FormGroup({
        nombre: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        precioConsulta: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });
    get esp() {
        return this.espGroup.getRawValue();
    }
    set esp(value) {
        this.espGroup.reset(value);
    }
    consGroup = new FormGroup({
        nombre: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        ubicacion: new FormControl(undefined, {
            nonNullable: true,
        }),
    });
    get cons() {
        return this.consGroup.getRawValue();
    }
    set cons(value) {
        this.consGroup.reset(value);
    }
    franjaGroup = new FormGroup({
        horaInicio: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        horaFin: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });
    get franja() {
        return this.franjaGroup.getRawValue();
    }
    set franja(value) {
        this.franjaGroup.reset(value);
    }
    async ejecutar(a, d) {
        if (this.guardando)
            return;
        this.guardando = true;
        try {
            this.error = "";
            this.exito = "";
            try {
                await firstValueFrom(this.administracionService.ejecutar(a, d));
                this.exito = "Actualización guardada";
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
CatalogoForm = __decorate([
    Component({
        standalone: true,
        imports: [ReactiveFormsModule, FeatureNav, ModuleHeader],
        template: "<div class=\"k-module k-admin\">\n  <header\n    appModuleHeader\n    class=\"k-module-header\"\n    contexto=\"CONFIGURACIÓN / ADMINISTRACIÓN\"\n    titulo=\"Administración\"\n    descripcion=\"Gestiona usuarios, parámetros, catálogos, notificaciones y auditoría.\"\n  ></header>\n  <app-feature-nav feature=\"administracion\" />\n  @if(error){\n  <div class=\"k-error\" role=\"alert\">{{error}}</div>\n  }@if(exito){\n  <div class=\"k-success\" role=\"status\">{{exito}}</div>\n  }\n  <div class=\"k-info\">\n    Configura los catálogos antes de registrar horarios o crear pre-reservas de\n    citas.\n  </div>\n  <section class=\"k-panel\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>Especialidades médicas</h2>\n        <p>Agrega una nueva especialidad y define su precio de consulta.</p>\n      </div>\n    </div>\n    <div class=\"k-form\">\n      <label class=\"k-field\"\n        >Nombre de especialidad<input\n          [formControl]=\"espGroup.controls.nombre\"\n          placeholder=\"Ej. Medicina general\" /></label\n      ><label class=\"k-field\"\n        >Precio de consulta (S/)<input\n          type=\"number\"\n          min=\"0\"\n          [formControl]=\"espGroup.controls.precioConsulta\"\n      /></label>\n    </div>\n    <div class=\"k-actions\">\n      <button\n        class=\"k-button\"\n        [disabled]=\"guardando || (!esp.nombre || esp.precioConsulta==null)\"\n        (click)=\"ejecutar('especialidad-crear',esp)\"\n      >\n        Crear especialidad\n      </button>\n    </div>\n  </section>\n  <section class=\"k-panel\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>Consultorios</h2>\n        <p>Registra los espacios donde se realizan las consultas médicas.</p>\n      </div>\n    </div>\n    <div class=\"k-form\">\n      <label class=\"k-field\"\n        >Nombre del consultorio<input\n          [formControl]=\"consGroup.controls.nombre\" /></label\n      ><label class=\"k-field\"\n        >Ubicación<input [formControl]=\"consGroup.controls.ubicacion\"\n      /></label>\n    </div>\n    <div class=\"k-actions\">\n      <button\n        class=\"k-button\"\n        [disabled]=\"guardando || (!cons.nombre)\"\n        (click)=\"ejecutar('consultorio-crear',cons)\"\n      >\n        Crear consultorio\n      </button>\n    </div>\n  </section>\n  <section class=\"k-panel\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>Franjas horarias</h2>\n        <p>Define la hora de inicio y fin de un turno médico.</p>\n      </div>\n    </div>\n    <div class=\"k-form\">\n      <label class=\"k-field\"\n        >Hora de inicio<input\n          type=\"time\"\n          [formControl]=\"franjaGroup.controls.horaInicio\" /></label\n      ><label class=\"k-field\"\n        >Hora de fin<input\n          type=\"time\"\n          [formControl]=\"franjaGroup.controls.horaFin\"\n      /></label>\n    </div>\n    <div class=\"k-actions\">\n      <button\n        class=\"k-button\"\n        [disabled]=\"guardando || (!franja.horaInicio || !franja.horaFin)\"\n        (click)=\"ejecutar('franja-crear',franja)\"\n      >\n        Crear franja horaria\n      </button>\n    </div>\n  </section>\n</div>\n",
        styles: [],
    })
], CatalogoForm);
export { CatalogoForm };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0YWxvZ28tZm9ybS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL2ZlYXR1cmVzL2FkbWluaXN0cmFjaW9uL3BhZ2VzL2NhdGFsb2dvLWZvcm0vIiwic291cmNlcyI6WyJjYXRhbG9nby1mb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3JFLE9BQU8sRUFDTCxXQUFXLEVBQ1gsU0FBUyxFQUNULG1CQUFtQixFQUNuQixVQUFVLEdBQ1gsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUM5RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDbkYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJEQUEyRCxDQUFDO0FBS3pGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBUXZFLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQVk7SUFDTixjQUFjLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDNUQsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNsQjtRQUNFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBQ08scUJBQXFCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDOUQsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNYLEtBQUssR0FBRyxFQUFFLENBQUM7SUFD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SUFDSCxDQUFDO0NBQ0YsQ0FBQTtBQTNFWSxZQUFZO0lBTnhCLFNBQVMsQ0FBQztRQUNULFVBQVUsRUFBRSxJQUFJO1FBQ2hCLE9BQU8sRUFBRSxDQUFDLG1CQUFtQixFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUM7UUFDeEQsUUFBUSxFQUFDLG1vR0FBbW9HO1FBQzVvRyxNQUFNLEVBQUMsRUFBRTtLQUNWLENBQUM7R0FDVyxZQUFZLENBMkV4QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnQsIGluamVjdCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge1xuICBGb3JtQ29udHJvbCxcbiAgRm9ybUdyb3VwLFxuICBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxuICBWYWxpZGF0b3JzLFxufSBmcm9tIFwiQGFuZ3VsYXIvZm9ybXNcIjtcbmltcG9ydCB7IGZpcnN0VmFsdWVGcm9tIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGVycm9yVGV4dCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb3JlL3V0aWxzL2h0dHAtZXJyb3JcIjtcbmltcG9ydCB7IEZlYXR1cmVOYXYgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2NvbXBvbmVudHMvZmVhdHVyZS1uYXYvZmVhdHVyZS1uYXZcIjtcbmltcG9ydCB7IE1vZHVsZUhlYWRlciB9IGZyb20gXCIuLi8uLi8uLi8uLi9zaGFyZWQvY29tcG9uZW50cy9tb2R1bGUtaGVhZGVyL21vZHVsZS1oZWFkZXJcIjtcbmltcG9ydCB7XG4gIEFkbWluaXN0cmFjaW9uQWNjaW9uLFxuICBBZG1pbmlzdHJhY2lvblJlcXVlc3QsXG59IGZyb20gXCIuLi8uLi9tb2RlbHMvYWRtaW5pc3RyYWNpb24ubW9kZWxcIjtcbmltcG9ydCB7IEFkbWluaXN0cmFjaW9uU2VydmljZSB9IGZyb20gXCIuLi8uLi9zZXJ2aWNlcy9hZG1pbmlzdHJhY2lvbi1zZXJ2aWNlXCI7XG5cbkBDb21wb25lbnQoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbUmVhY3RpdmVGb3Jtc01vZHVsZSwgRmVhdHVyZU5hdiwgTW9kdWxlSGVhZGVyXSxcbiAgdGVtcGxhdGU6XCI8ZGl2IGNsYXNzPVxcXCJrLW1vZHVsZSBrLWFkbWluXFxcIj5cXG4gIDxoZWFkZXJcXG4gICAgYXBwTW9kdWxlSGVhZGVyXFxuICAgIGNsYXNzPVxcXCJrLW1vZHVsZS1oZWFkZXJcXFwiXFxuICAgIGNvbnRleHRvPVxcXCJDT05GSUdVUkFDScOTTiAvIEFETUlOSVNUUkFDScOTTlxcXCJcXG4gICAgdGl0dWxvPVxcXCJBZG1pbmlzdHJhY2nDs25cXFwiXFxuICAgIGRlc2NyaXBjaW9uPVxcXCJHZXN0aW9uYSB1c3VhcmlvcywgcGFyw6FtZXRyb3MsIGNhdMOhbG9nb3MsIG5vdGlmaWNhY2lvbmVzIHkgYXVkaXRvcsOtYS5cXFwiXFxuICA+PC9oZWFkZXI+XFxuICA8YXBwLWZlYXR1cmUtbmF2IGZlYXR1cmU9XFxcImFkbWluaXN0cmFjaW9uXFxcIiAvPlxcbiAgQGlmKGVycm9yKXtcXG4gIDxkaXYgY2xhc3M9XFxcImstZXJyb3JcXFwiIHJvbGU9XFxcImFsZXJ0XFxcIj57e2Vycm9yfX08L2Rpdj5cXG4gIH1AaWYoZXhpdG8pe1xcbiAgPGRpdiBjbGFzcz1cXFwiay1zdWNjZXNzXFxcIiByb2xlPVxcXCJzdGF0dXNcXFwiPnt7ZXhpdG99fTwvZGl2PlxcbiAgfVxcbiAgPGRpdiBjbGFzcz1cXFwiay1pbmZvXFxcIj5cXG4gICAgQ29uZmlndXJhIGxvcyBjYXTDoWxvZ29zIGFudGVzIGRlIHJlZ2lzdHJhciBob3JhcmlvcyBvIGNyZWFyIHByZS1yZXNlcnZhcyBkZVxcbiAgICBjaXRhcy5cXG4gIDwvZGl2PlxcbiAgPHNlY3Rpb24gY2xhc3M9XFxcImstcGFuZWxcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLXNlY3Rpb24taGVhZGluZ1xcXCI+XFxuICAgICAgPGRpdj5cXG4gICAgICAgIDxoMj5Fc3BlY2lhbGlkYWRlcyBtw6lkaWNhczwvaDI+XFxuICAgICAgICA8cD5BZ3JlZ2EgdW5hIG51ZXZhIGVzcGVjaWFsaWRhZCB5IGRlZmluZSBzdSBwcmVjaW8gZGUgY29uc3VsdGEuPC9wPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1mb3JtXFxcIj5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+Tm9tYnJlIGRlIGVzcGVjaWFsaWRhZDxpbnB1dFxcbiAgICAgICAgICBbZm9ybUNvbnRyb2xdPVxcXCJlc3BHcm91cC5jb250cm9scy5ub21icmVcXFwiXFxuICAgICAgICAgIHBsYWNlaG9sZGVyPVxcXCJFai4gTWVkaWNpbmEgZ2VuZXJhbFxcXCIgLz48L2xhYmVsXFxuICAgICAgPjxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5QcmVjaW8gZGUgY29uc3VsdGEgKFMvKTxpbnB1dFxcbiAgICAgICAgICB0eXBlPVxcXCJudW1iZXJcXFwiXFxuICAgICAgICAgIG1pbj1cXFwiMFxcXCJcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwiZXNwR3JvdXAuY29udHJvbHMucHJlY2lvQ29uc3VsdGFcXFwiXFxuICAgICAgLz48L2xhYmVsPlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1hY3Rpb25zXFxcIj5cXG4gICAgICA8YnV0dG9uXFxuICAgICAgICBjbGFzcz1cXFwiay1idXR0b25cXFwiXFxuICAgICAgICBbZGlzYWJsZWRdPVxcXCJndWFyZGFuZG8gfHwgKCFlc3Aubm9tYnJlIHx8IGVzcC5wcmVjaW9Db25zdWx0YT09bnVsbClcXFwiXFxuICAgICAgICAoY2xpY2spPVxcXCJlamVjdXRhcignZXNwZWNpYWxpZGFkLWNyZWFyJyxlc3ApXFxcIlxcbiAgICAgID5cXG4gICAgICAgIENyZWFyIGVzcGVjaWFsaWRhZFxcbiAgICAgIDwvYnV0dG9uPlxcbiAgICA8L2Rpdj5cXG4gIDwvc2VjdGlvbj5cXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJrLXBhbmVsXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1zZWN0aW9uLWhlYWRpbmdcXFwiPlxcbiAgICAgIDxkaXY+XFxuICAgICAgICA8aDI+Q29uc3VsdG9yaW9zPC9oMj5cXG4gICAgICAgIDxwPlJlZ2lzdHJhIGxvcyBlc3BhY2lvcyBkb25kZSBzZSByZWFsaXphbiBsYXMgY29uc3VsdGFzIG3DqWRpY2FzLjwvcD5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcImstZm9ybVxcXCI+XFxuICAgICAgPGxhYmVsIGNsYXNzPVxcXCJrLWZpZWxkXFxcIlxcbiAgICAgICAgPk5vbWJyZSBkZWwgY29uc3VsdG9yaW88aW5wdXRcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwiY29uc0dyb3VwLmNvbnRyb2xzLm5vbWJyZVxcXCIgLz48L2xhYmVsXFxuICAgICAgPjxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5VYmljYWNpw7NuPGlucHV0IFtmb3JtQ29udHJvbF09XFxcImNvbnNHcm91cC5jb250cm9scy51YmljYWNpb25cXFwiXFxuICAgICAgLz48L2xhYmVsPlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1hY3Rpb25zXFxcIj5cXG4gICAgICA8YnV0dG9uXFxuICAgICAgICBjbGFzcz1cXFwiay1idXR0b25cXFwiXFxuICAgICAgICBbZGlzYWJsZWRdPVxcXCJndWFyZGFuZG8gfHwgKCFjb25zLm5vbWJyZSlcXFwiXFxuICAgICAgICAoY2xpY2spPVxcXCJlamVjdXRhcignY29uc3VsdG9yaW8tY3JlYXInLGNvbnMpXFxcIlxcbiAgICAgID5cXG4gICAgICAgIENyZWFyIGNvbnN1bHRvcmlvXFxuICAgICAgPC9idXR0b24+XFxuICAgIDwvZGl2PlxcbiAgPC9zZWN0aW9uPlxcbiAgPHNlY3Rpb24gY2xhc3M9XFxcImstcGFuZWxcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLXNlY3Rpb24taGVhZGluZ1xcXCI+XFxuICAgICAgPGRpdj5cXG4gICAgICAgIDxoMj5GcmFuamFzIGhvcmFyaWFzPC9oMj5cXG4gICAgICAgIDxwPkRlZmluZSBsYSBob3JhIGRlIGluaWNpbyB5IGZpbiBkZSB1biB0dXJubyBtw6lkaWNvLjwvcD5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcImstZm9ybVxcXCI+XFxuICAgICAgPGxhYmVsIGNsYXNzPVxcXCJrLWZpZWxkXFxcIlxcbiAgICAgICAgPkhvcmEgZGUgaW5pY2lvPGlucHV0XFxuICAgICAgICAgIHR5cGU9XFxcInRpbWVcXFwiXFxuICAgICAgICAgIFtmb3JtQ29udHJvbF09XFxcImZyYW5qYUdyb3VwLmNvbnRyb2xzLmhvcmFJbmljaW9cXFwiIC8+PC9sYWJlbFxcbiAgICAgID48bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+SG9yYSBkZSBmaW48aW5wdXRcXG4gICAgICAgICAgdHlwZT1cXFwidGltZVxcXCJcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwiZnJhbmphR3JvdXAuY29udHJvbHMuaG9yYUZpblxcXCJcXG4gICAgICAvPjwvbGFiZWw+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLWFjdGlvbnNcXFwiPlxcbiAgICAgIDxidXR0b25cXG4gICAgICAgIGNsYXNzPVxcXCJrLWJ1dHRvblxcXCJcXG4gICAgICAgIFtkaXNhYmxlZF09XFxcImd1YXJkYW5kbyB8fCAoIWZyYW5qYS5ob3JhSW5pY2lvIHx8ICFmcmFuamEuaG9yYUZpbilcXFwiXFxuICAgICAgICAoY2xpY2spPVxcXCJlamVjdXRhcignZnJhbmphLWNyZWFyJyxmcmFuamEpXFxcIlxcbiAgICAgID5cXG4gICAgICAgIENyZWFyIGZyYW5qYSBob3JhcmlhXFxuICAgICAgPC9idXR0b24+XFxuICAgIDwvZGl2PlxcbiAgPC9zZWN0aW9uPlxcbjwvZGl2PlxcblwiLFxuICBzdHlsZXM6W10sXG59KVxuZXhwb3J0IGNsYXNzIENhdGFsb2dvRm9ybSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgY2hhbmdlRGV0ZWN0b3IgPSBpbmplY3QoQ2hhbmdlRGV0ZWN0b3JSZWYpO1xuICBndWFyZGFuZG8gPSBmYWxzZTtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lc3AgPSB7fTtcbiAgICB0aGlzLmNvbnMgPSB7fTtcbiAgICB0aGlzLmZyYW5qYSA9IHt9O1xuICB9XG4gIHByaXZhdGUgYWRtaW5pc3RyYWNpb25TZXJ2aWNlID0gaW5qZWN0KEFkbWluaXN0cmFjaW9uU2VydmljZSk7XG4gIGVycm9yID0gXCJcIjtcbiAgZXhpdG8gPSBcIlwiO1xuICByZWFkb25seSBlc3BHcm91cCA9IG5ldyBGb3JtR3JvdXAoe1xuICAgIG5vbWJyZTogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbVmFsaWRhdG9ycy5yZXF1aXJlZF0sXG4gICAgfSksXG4gICAgcHJlY2lvQ29uc3VsdGE6IG5ldyBGb3JtQ29udHJvbDxudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsPih1bmRlZmluZWQsIHtcbiAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgICAgdmFsaWRhdG9yczogW1ZhbGlkYXRvcnMucmVxdWlyZWRdLFxuICAgIH0pLFxuICB9KTtcbiAgZ2V0IGVzcCgpOiBBZG1pbmlzdHJhY2lvblJlcXVlc3Qge1xuICAgIHJldHVybiB0aGlzLmVzcEdyb3VwLmdldFJhd1ZhbHVlKCk7XG4gIH1cbiAgc2V0IGVzcCh2YWx1ZTogQWRtaW5pc3RyYWNpb25SZXF1ZXN0KSB7XG4gICAgdGhpcy5lc3BHcm91cC5yZXNldCh2YWx1ZSk7XG4gIH1cbiAgcmVhZG9ubHkgY29uc0dyb3VwID0gbmV3IEZvcm1Hcm91cCh7XG4gICAgbm9tYnJlOiBuZXcgRm9ybUNvbnRyb2w8c3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtWYWxpZGF0b3JzLnJlcXVpcmVkXSxcbiAgICB9KSxcbiAgICB1YmljYWNpb246IG5ldyBGb3JtQ29udHJvbDxzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsPih1bmRlZmluZWQsIHtcbiAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgIH0pLFxuICB9KTtcbiAgZ2V0IGNvbnMoKTogQWRtaW5pc3RyYWNpb25SZXF1ZXN0IHtcbiAgICByZXR1cm4gdGhpcy5jb25zR3JvdXAuZ2V0UmF3VmFsdWUoKTtcbiAgfVxuICBzZXQgY29ucyh2YWx1ZTogQWRtaW5pc3RyYWNpb25SZXF1ZXN0KSB7XG4gICAgdGhpcy5jb25zR3JvdXAucmVzZXQodmFsdWUpO1xuICB9XG4gIHJlYWRvbmx5IGZyYW5qYUdyb3VwID0gbmV3IEZvcm1Hcm91cCh7XG4gICAgaG9yYUluaWNpbzogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbVmFsaWRhdG9ycy5yZXF1aXJlZF0sXG4gICAgfSksXG4gICAgaG9yYUZpbjogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbVmFsaWRhdG9ycy5yZXF1aXJlZF0sXG4gICAgfSksXG4gIH0pO1xuICBnZXQgZnJhbmphKCk6IEFkbWluaXN0cmFjaW9uUmVxdWVzdCB7XG4gICAgcmV0dXJuIHRoaXMuZnJhbmphR3JvdXAuZ2V0UmF3VmFsdWUoKTtcbiAgfVxuICBzZXQgZnJhbmphKHZhbHVlOiBBZG1pbmlzdHJhY2lvblJlcXVlc3QpIHtcbiAgICB0aGlzLmZyYW5qYUdyb3VwLnJlc2V0KHZhbHVlKTtcbiAgfVxuICBhc3luYyBlamVjdXRhcihhOiBBZG1pbmlzdHJhY2lvbkFjY2lvbiwgZDogQWRtaW5pc3RyYWNpb25SZXF1ZXN0KSB7XG4gICAgaWYgKHRoaXMuZ3VhcmRhbmRvKSByZXR1cm47XG4gICAgdGhpcy5ndWFyZGFuZG8gPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmVycm9yID0gXCJcIjtcbiAgICAgIHRoaXMuZXhpdG8gPSBcIlwiO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5hZG1pbmlzdHJhY2lvblNlcnZpY2UuZWplY3V0YXIoYSwgZCkpO1xuICAgICAgICB0aGlzLmV4aXRvID0gXCJBY3R1YWxpemFjacOzbiBndWFyZGFkYVwiO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLmVycm9yID0gZXJyb3JUZXh0KGUpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmd1YXJkYW5kbyA9IGZhbHNlO1xuICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
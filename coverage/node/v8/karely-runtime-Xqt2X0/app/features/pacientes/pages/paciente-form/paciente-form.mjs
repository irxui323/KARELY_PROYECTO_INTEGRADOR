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
import { ModuleHeader } from '../../../../shared/components/module-header/module-header.mjs';
import { ControlDisabled } from '../../../../shared/directives/control-disabled.mjs';
import { PacienteService } from '../../services/pacientes-service.mjs';
import { CatalogoService } from '../../../catalogos/services/catalogos-service.mjs';
let PacienteForm = class PacienteForm {
    router = inject(Router);
    route = inject(ActivatedRoute, { optional: true });
    constructor() {
        this.form = {};
    }
    pacientesService = inject(PacienteService);
    catalogosService = inject(CatalogoService);
    changeDetector = inject(ChangeDetectorRef);
    buscar = "";
    error = "";
    exito = "";
    cargando = false;
    consultandoDni = false;
    formGroup = new FormGroup({
        idPaciente: new FormControl(undefined, {
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
        direccion: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.maxLength(250)],
        }),
        estado: new FormControl(undefined, {
            nonNullable: true,
        }),
        fechaNacimiento: new FormControl(undefined, {
            nonNullable: true,
            validators: [(control) => {
                    if (!control.value)
                        return null;
                    const parts = new Intl.DateTimeFormat("en-CA", {
                        timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit",
                    }).formatToParts(new Date());
                    const part = (type) => parts.find((p) => p.type === type)?.value;
                    const today = `${part("year")}-${part("month")}-${part("day")}`;
                    return control.value > today ? { fechaFutura: true } : null;
                }],
        }),
    });
    get form() {
        return this.formGroup.getRawValue();
    }
    set form(value) {
        this.formGroup.reset(value);
    }
    ngOnInit() {
        void this.cargar();
    }
    async cargar() {
        try {
            try {
                const id = this.route?.snapshot.paramMap.get("id");
                if (id) {
                    const records = await firstValueFrom(this.pacientesService.listar());
                    const paciente = records.find((p) => p.idPaciente === Number(id));
                    if (!paciente) {
                        this.error = "Paciente no encontrado";
                        return;
                    }
                    this.editar(paciente);
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
        this.form = {
            tipoDocumento: "DNI",
            numeroDocumento: "",
            nombres: "",
            apellidos: "",
            fechaNacimiento: "",
            telefono: "",
            correo: "",
            direccion: "",
            estado: "ACTIVO",
        };
        this.error = "";
        this.exito = "";
    }
    editar(p) {
        this.form = {
            idPaciente: p.idPaciente,
            tipoDocumento: p.tipoDocumento,
            numeroDocumento: p.numeroDocumento,
            nombres: p.nombres,
            apellidos: p.apellidos,
            telefono: p.telefono,
            correo: p.correo,
            direccion: p.direccion,
            estado: p.estado,
        };
    }
    async guardar() {
        try {
            if (this.cargando)
                return;
            if (this.formGroup.invalid) {
                this.formGroup.markAllAsTouched();
                this.exito = "";
                this.error = formErrorText(this.formGroup);
                return;
            }
            if (!this.registroDisponible) {
                this.error =
                    "No se puede guardar: el paciente de esta edición no se ha cargado.";
                return;
            }
            this.error = "";
            this.exito = "";
            this.cargando = true;
            try {
                await firstValueFrom(this.pacientesService.guardar(this.form));
                this.exito = "Paciente guardado correctamente.";
                this.buscar = "";
                void this.router.navigateByUrl("/pacientes");
            }
            catch (e) {
                this.error = errorText(e);
                return;
            }
            finally {
                this.cargando = false;
                this.changeDetector.markForCheck();
            }
        }
        finally {
            this.changeDetector.markForCheck();
        }
    }
    async consultarDni() {
        if (this.form.idPaciente || this.form.tipoDocumento !== "DNI")
            return;
        const dni = (this.form.numeroDocumento || "").trim();
        if (!/^\d{8}$/.test(dni))
            return;
        this.consultandoDni = true;
        this.error = "";
        try {
            const persona = await firstValueFrom(this.catalogosService.consultarDni(dni));
            this.formGroup.patchValue({
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
        return !id || Number(id) === this.form.idPaciente;
    }
};
PacienteForm = __decorate([
    Component({
        standalone: true,
        imports: [ControlDisabled, ReactiveFormsModule, RouterLink, FeatureNav, ModuleHeader],
        template: "<div class=\"k-module k-pacientes\">\n  <header\n    appModuleHeader\n    class=\"k-module-header\"\n    contexto=\"GESTIÓN CLÍNICA / PACIENTES\"\n    titulo=\"Pacientes\"\n    descripcion=\"Registra pacientes, consulta sus datos y confirma su llegada a las citas.\"\n    textoActualizar=\"↻ Actualizar datos\"\n    (actualizar)=\"cargar()\"\n  >\n  </header>\n  <app-feature-nav feature=\"pacientes\" />\n  @if(error){\n  <div class=\"k-error\" role=\"alert\">{{error}}</div>\n  } @if(exito){\n  <div class=\"k-success\" role=\"status\">{{exito}}</div>\n  }\n  <section class=\"k-panel\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>\n          {{form.idPaciente?'Editar paciente':'Registrar nuevo paciente'}}\n        </h2>\n        <p>Completa los datos de identificación y contacto.</p>\n      </div>\n    </div>\n    <h3 class=\"k-form-title\">Datos personales</h3>\n    <div class=\"k-form\">\n      <label class=\"k-field\"\n        >Tipo de documento<select\n          [formControl]=\"formGroup.controls.tipoDocumento\"\n          [appControlDisabled]=\"!!form.idPaciente\"\n        >\n          <option>DNI</option>\n          <option>CE</option>\n          <option>PASAPORTE</option>\n        </select></label\n      >\n      <label class=\"k-field\"\n        >Número de documento<input\n          [formControl]=\"formGroup.controls.numeroDocumento\"\n          [appControlDisabled]=\"!!form.idPaciente\"\n          placeholder=\"Número de identificación\"\n          (blur)=\"consultarDni()\"\n      /></label>\n      @if(consultandoDni){<span class=\"k-field-hint\">Consultando DNI...</span>}\n      <label class=\"k-field\"\n        >Nombres<input\n          [formControl]=\"formGroup.controls.nombres\"\n          placeholder=\"Nombres del paciente\"\n      /></label>\n      <label class=\"k-field\"\n        >Apellidos<input\n          [formControl]=\"formGroup.controls.apellidos\"\n          placeholder=\"Apellidos del paciente\"\n      /></label>\n      <label class=\"k-field\"\n        >Fecha de nacimiento<input\n          type=\"date\"\n          [formControl]=\"formGroup.controls.fechaNacimiento\"\n          [appControlDisabled]=\"!!form.idPaciente\"\n      /></label>\n      @if(form.idPaciente){<label class=\"k-field\"\n        >Estado<select [formControl]=\"formGroup.controls.estado\">\n          <option>ACTIVO</option>\n          <option>INACTIVO</option>\n        </select></label\n      >}\n    </div>\n    <h3 class=\"k-form-title\">Información de contacto</h3>\n    <div class=\"k-form\">\n      <label class=\"k-field\"\n        >Teléfono<input\n          [formControl]=\"formGroup.controls.telefono\"\n          placeholder=\"Teléfono\"\n      /></label>\n      <label class=\"k-field\"\n        >Correo electrónico<input\n          type=\"email\"\n          [formControl]=\"formGroup.controls.correo\"\n          placeholder=\"correo@ejemplo.com\"\n      /></label>\n      <label class=\"k-field k-field-wide\"\n        >Dirección<input\n          [formControl]=\"formGroup.controls.direccion\"\n          placeholder=\"Dirección del paciente\"\n      /></label>\n    </div>\n    <div class=\"k-actions\">\n      <button\n        type=\"button\"\n        class=\"k-button\"\n        (click)=\"guardar()\"\n        [disabled]=\"cargando || !registroDisponible\"\n      >\n        {{cargando?'Guardando...':'Guardar paciente'}}</button\n      ><button\n        type=\"button\"\n        class=\"k-button k-button-secondary\"\n        routerLink=\"/pacientes\"\n      >\n        Cancelar\n      </button>\n    </div>\n  </section>\n</div>\n",
        styles: [],
    })
], PacienteForm);
export { PacienteForm };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFjaWVudGUtZm9ybS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL2ZlYXR1cmVzL3BhY2llbnRlcy9wYWdlcy9wYWNpZW50ZS1mb3JtLyIsInNvdXJjZXMiOlsicGFjaWVudGUtZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUM3RSxPQUFPLEVBQ0wsV0FBVyxFQUNYLFNBQVMsRUFDVCxtQkFBbUIsRUFDbkIsVUFBVSxHQUNYLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDckUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN0QyxPQUFPLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUNuRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkRBQTJELENBQUM7QUFDekYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBRWpGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUNuRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFRekUsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBWTtJQUNOLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEIsS0FBSyxHQUFHLE1BQU0sQ0FBQyxjQUFjLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNwRTtRQUNFLElBQUksQ0FBQyxJQUFJ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O2dCQUN4QixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87Z0JBQ3hCLFNBQVMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxlQUFlLElBQUksT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksRUFBRTthQUMxRSxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNYLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLENBQUM7Z0JBQVMsQ0FBQztZQUNULElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1lBQzVCLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDckMsQ0FBQztJQUNILENBQUM7SUFDRCxJQUFJLGtCQUFrQjtRQUNwQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25ELE9BQU8sQ0FBQyxFQUFFLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3BELENBQUM7Q0FDRixDQUFBO0FBaExZLFlBQVk7SUFOeEIsU0FBUyxDQUFDO1FBQ1QsVUFBVSxFQUFFLElBQUk7UUFDaEIsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLG1CQUFtQixFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDO1FBQ3JGLFFBQVEsRUFBQyxnaEhBQWdoSDtRQUN6aEgsTUFBTSxFQUFDLEVBQUU7S0FDVixDQUFDO0dBQ1csWUFBWSxDQWdMeEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBpbmplY3QsIE9uSW5pdCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge1xuICBGb3JtQ29udHJvbCxcbiAgRm9ybUdyb3VwLFxuICBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxuICBWYWxpZGF0b3JzLFxufSBmcm9tIFwiQGFuZ3VsYXIvZm9ybXNcIjtcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlLCBSb3V0ZXIsIFJvdXRlckxpbmsgfSBmcm9tIFwiQGFuZ3VsYXIvcm91dGVyXCI7XG5pbXBvcnQgeyBmaXJzdFZhbHVlRnJvbSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBlcnJvclRleHQsIGZvcm1FcnJvclRleHQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29yZS91dGlscy9odHRwLWVycm9yXCI7XG5pbXBvcnQgeyBGZWF0dXJlTmF2IH0gZnJvbSBcIi4uLy4uLy4uLy4uL3NoYXJlZC9jb21wb25lbnRzL2ZlYXR1cmUtbmF2L2ZlYXR1cmUtbmF2XCI7XG5pbXBvcnQgeyBNb2R1bGVIZWFkZXIgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2NvbXBvbmVudHMvbW9kdWxlLWhlYWRlci9tb2R1bGUtaGVhZGVyXCI7XG5pbXBvcnQgeyBDb250cm9sRGlzYWJsZWQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2RpcmVjdGl2ZXMvY29udHJvbC1kaXNhYmxlZFwiO1xuaW1wb3J0IHsgUGFjaWVudGUsIFBhY2llbnRlUmVxdWVzdCB9IGZyb20gXCIuLi8uLi9tb2RlbHMvcGFjaWVudGVzLm1vZGVsXCI7XG5pbXBvcnQgeyBQYWNpZW50ZVNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2VydmljZXMvcGFjaWVudGVzLXNlcnZpY2VcIjtcbmltcG9ydCB7IENhdGFsb2dvU2VydmljZSB9IGZyb20gXCIuLi8uLi8uLi9jYXRhbG9nb3Mvc2VydmljZXMvY2F0YWxvZ29zLXNlcnZpY2VcIjtcblxuQENvbXBvbmVudCh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtDb250cm9sRGlzYWJsZWQsIFJlYWN0aXZlRm9ybXNNb2R1bGUsIFJvdXRlckxpbmssIEZlYXR1cmVOYXYsIE1vZHVsZUhlYWRlcl0sXG4gIHRlbXBsYXRlOlwiPGRpdiBjbGFzcz1cXFwiay1tb2R1bGUgay1wYWNpZW50ZXNcXFwiPlxcbiAgPGhlYWRlclxcbiAgICBhcHBNb2R1bGVIZWFkZXJcXG4gICAgY2xhc3M9XFxcImstbW9kdWxlLWhlYWRlclxcXCJcXG4gICAgY29udGV4dG89XFxcIkdFU1RJw5NOIENMw41OSUNBIC8gUEFDSUVOVEVTXFxcIlxcbiAgICB0aXR1bG89XFxcIlBhY2llbnRlc1xcXCJcXG4gICAgZGVzY3JpcGNpb249XFxcIlJlZ2lzdHJhIHBhY2llbnRlcywgY29uc3VsdGEgc3VzIGRhdG9zIHkgY29uZmlybWEgc3UgbGxlZ2FkYSBhIGxhcyBjaXRhcy5cXFwiXFxuICAgIHRleHRvQWN0dWFsaXphcj1cXFwi4oa7IEFjdHVhbGl6YXIgZGF0b3NcXFwiXFxuICAgIChhY3R1YWxpemFyKT1cXFwiY2FyZ2FyKClcXFwiXFxuICA+XFxuICA8L2hlYWRlcj5cXG4gIDxhcHAtZmVhdHVyZS1uYXYgZmVhdHVyZT1cXFwicGFjaWVudGVzXFxcIiAvPlxcbiAgQGlmKGVycm9yKXtcXG4gIDxkaXYgY2xhc3M9XFxcImstZXJyb3JcXFwiIHJvbGU9XFxcImFsZXJ0XFxcIj57e2Vycm9yfX08L2Rpdj5cXG4gIH0gQGlmKGV4aXRvKXtcXG4gIDxkaXYgY2xhc3M9XFxcImstc3VjY2Vzc1xcXCIgcm9sZT1cXFwic3RhdHVzXFxcIj57e2V4aXRvfX08L2Rpdj5cXG4gIH1cXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJrLXBhbmVsXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1zZWN0aW9uLWhlYWRpbmdcXFwiPlxcbiAgICAgIDxkaXY+XFxuICAgICAgICA8aDI+XFxuICAgICAgICAgIHt7Zm9ybS5pZFBhY2llbnRlPydFZGl0YXIgcGFjaWVudGUnOidSZWdpc3RyYXIgbnVldm8gcGFjaWVudGUnfX1cXG4gICAgICAgIDwvaDI+XFxuICAgICAgICA8cD5Db21wbGV0YSBsb3MgZGF0b3MgZGUgaWRlbnRpZmljYWNpw7NuIHkgY29udGFjdG8uPC9wPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGgzIGNsYXNzPVxcXCJrLWZvcm0tdGl0bGVcXFwiPkRhdG9zIHBlcnNvbmFsZXM8L2gzPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLWZvcm1cXFwiPlxcbiAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5UaXBvIGRlIGRvY3VtZW50bzxzZWxlY3RcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwiZm9ybUdyb3VwLmNvbnRyb2xzLnRpcG9Eb2N1bWVudG9cXFwiXFxuICAgICAgICAgIFthcHBDb250cm9sRGlzYWJsZWRdPVxcXCIhIWZvcm0uaWRQYWNpZW50ZVxcXCJcXG4gICAgICAgID5cXG4gICAgICAgICAgPG9wdGlvbj5ETkk8L29wdGlvbj5cXG4gICAgICAgICAgPG9wdGlvbj5DRTwvb3B0aW9uPlxcbiAgICAgICAgICA8b3B0aW9uPlBBU0FQT1JURTwvb3B0aW9uPlxcbiAgICAgICAgPC9zZWxlY3Q+PC9sYWJlbFxcbiAgICAgID5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+TsO6bWVybyBkZSBkb2N1bWVudG88aW5wdXRcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwiZm9ybUdyb3VwLmNvbnRyb2xzLm51bWVyb0RvY3VtZW50b1xcXCJcXG4gICAgICAgICAgW2FwcENvbnRyb2xEaXNhYmxlZF09XFxcIiEhZm9ybS5pZFBhY2llbnRlXFxcIlxcbiAgICAgICAgICBwbGFjZWhvbGRlcj1cXFwiTsO6bWVybyBkZSBpZGVudGlmaWNhY2nDs25cXFwiXFxuICAgICAgICAgIChibHVyKT1cXFwiY29uc3VsdGFyRG5pKClcXFwiXFxuICAgICAgLz48L2xhYmVsPlxcbiAgICAgIEBpZihjb25zdWx0YW5kb0RuaSl7PHNwYW4gY2xhc3M9XFxcImstZmllbGQtaGludFxcXCI+Q29uc3VsdGFuZG8gRE5JLi4uPC9zcGFuPn1cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+Tm9tYnJlczxpbnB1dFxcbiAgICAgICAgICBbZm9ybUNvbnRyb2xdPVxcXCJmb3JtR3JvdXAuY29udHJvbHMubm9tYnJlc1xcXCJcXG4gICAgICAgICAgcGxhY2Vob2xkZXI9XFxcIk5vbWJyZXMgZGVsIHBhY2llbnRlXFxcIlxcbiAgICAgIC8+PC9sYWJlbD5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+QXBlbGxpZG9zPGlucHV0XFxuICAgICAgICAgIFtmb3JtQ29udHJvbF09XFxcImZvcm1Hcm91cC5jb250cm9scy5hcGVsbGlkb3NcXFwiXFxuICAgICAgICAgIHBsYWNlaG9sZGVyPVxcXCJBcGVsbGlkb3MgZGVsIHBhY2llbnRlXFxcIlxcbiAgICAgIC8+PC9sYWJlbD5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+RmVjaGEgZGUgbmFjaW1pZW50bzxpbnB1dFxcbiAgICAgICAgICB0eXBlPVxcXCJkYXRlXFxcIlxcbiAgICAgICAgICBbZm9ybUNvbnRyb2xdPVxcXCJmb3JtR3JvdXAuY29udHJvbHMuZmVjaGFOYWNpbWllbnRvXFxcIlxcbiAgICAgICAgICBbYXBwQ29udHJvbERpc2FibGVkXT1cXFwiISFmb3JtLmlkUGFjaWVudGVcXFwiXFxuICAgICAgLz48L2xhYmVsPlxcbiAgICAgIEBpZihmb3JtLmlkUGFjaWVudGUpezxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5Fc3RhZG88c2VsZWN0IFtmb3JtQ29udHJvbF09XFxcImZvcm1Hcm91cC5jb250cm9scy5lc3RhZG9cXFwiPlxcbiAgICAgICAgICA8b3B0aW9uPkFDVElWTzwvb3B0aW9uPlxcbiAgICAgICAgICA8b3B0aW9uPklOQUNUSVZPPC9vcHRpb24+XFxuICAgICAgICA8L3NlbGVjdD48L2xhYmVsXFxuICAgICAgPn1cXG4gICAgPC9kaXY+XFxuICAgIDxoMyBjbGFzcz1cXFwiay1mb3JtLXRpdGxlXFxcIj5JbmZvcm1hY2nDs24gZGUgY29udGFjdG88L2gzPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLWZvcm1cXFwiPlxcbiAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5UZWzDqWZvbm88aW5wdXRcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwiZm9ybUdyb3VwLmNvbnRyb2xzLnRlbGVmb25vXFxcIlxcbiAgICAgICAgICBwbGFjZWhvbGRlcj1cXFwiVGVsw6lmb25vXFxcIlxcbiAgICAgIC8+PC9sYWJlbD5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+Q29ycmVvIGVsZWN0csOzbmljbzxpbnB1dFxcbiAgICAgICAgICB0eXBlPVxcXCJlbWFpbFxcXCJcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwiZm9ybUdyb3VwLmNvbnRyb2xzLmNvcnJlb1xcXCJcXG4gICAgICAgICAgcGxhY2Vob2xkZXI9XFxcImNvcnJlb0BlamVtcGxvLmNvbVxcXCJcXG4gICAgICAvPjwvbGFiZWw+XFxuICAgICAgPGxhYmVsIGNsYXNzPVxcXCJrLWZpZWxkIGstZmllbGQtd2lkZVxcXCJcXG4gICAgICAgID5EaXJlY2Npw7NuPGlucHV0XFxuICAgICAgICAgIFtmb3JtQ29udHJvbF09XFxcImZvcm1Hcm91cC5jb250cm9scy5kaXJlY2Npb25cXFwiXFxuICAgICAgICAgIHBsYWNlaG9sZGVyPVxcXCJEaXJlY2Npw7NuIGRlbCBwYWNpZW50ZVxcXCJcXG4gICAgICAvPjwvbGFiZWw+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLWFjdGlvbnNcXFwiPlxcbiAgICAgIDxidXR0b25cXG4gICAgICAgIHR5cGU9XFxcImJ1dHRvblxcXCJcXG4gICAgICAgIGNsYXNzPVxcXCJrLWJ1dHRvblxcXCJcXG4gICAgICAgIChjbGljayk9XFxcImd1YXJkYXIoKVxcXCJcXG4gICAgICAgIFtkaXNhYmxlZF09XFxcImNhcmdhbmRvIHx8ICFyZWdpc3Ryb0Rpc3BvbmlibGVcXFwiXFxuICAgICAgPlxcbiAgICAgICAge3tjYXJnYW5kbz8nR3VhcmRhbmRvLi4uJzonR3VhcmRhciBwYWNpZW50ZSd9fTwvYnV0dG9uXFxuICAgICAgPjxidXR0b25cXG4gICAgICAgIHR5cGU9XFxcImJ1dHRvblxcXCJcXG4gICAgICAgIGNsYXNzPVxcXCJrLWJ1dHRvbiBrLWJ1dHRvbi1zZWNvbmRhcnlcXFwiXFxuICAgICAgICByb3V0ZXJMaW5rPVxcXCIvcGFjaWVudGVzXFxcIlxcbiAgICAgID5cXG4gICAgICAgIENhbmNlbGFyXFxuICAgICAgPC9idXR0b24+XFxuICAgIDwvZGl2PlxcbiAgPC9zZWN0aW9uPlxcbjwvZGl2PlxcblwiLFxuICBzdHlsZXM6W10sXG59KVxuZXhwb3J0IGNsYXNzIFBhY2llbnRlRm9ybSBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgcm91dGVyID0gaW5qZWN0KFJvdXRlcik7XG4gIHByaXZhdGUgcmVhZG9ubHkgcm91dGUgPSBpbmplY3QoQWN0aXZhdGVkUm91dGUsIHsgb3B0aW9uYWw6IHRydWUgfSk7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZm9ybSA9IHt9O1xuICB9XG4gIHByaXZhdGUgcGFjaWVudGVzU2VydmljZSA9IGluamVjdChQYWNpZW50ZVNlcnZpY2UpO1xuICBwcml2YXRlIGNhdGFsb2dvc1NlcnZpY2UgPSBpbmplY3QoQ2F0YWxvZ29TZXJ2aWNlKTtcbiAgcHJpdmF0ZSByZWFkb25seSBjaGFuZ2VEZXRlY3RvciA9IGluamVjdChDaGFuZ2VEZXRlY3RvclJlZik7XG4gIGJ1c2NhciA9IFwiXCI7XG4gIGVycm9yID0gXCJcIjtcbiAgZXhpdG8gPSBcIlwiO1xuICBjYXJnYW5kbyA9IGZhbHNlO1xuICBjb25zdWx0YW5kb0RuaSA9IGZhbHNlO1xuICByZWFkb25seSBmb3JtR3JvdXAgPSBuZXcgRm9ybUdyb3VwKHtcbiAgICBpZFBhY2llbnRlOiBuZXcgRm9ybUNvbnRyb2w8bnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICB9KSxcbiAgICB0aXBvRG9jdW1lbnRvOiBuZXcgRm9ybUNvbnRyb2w8c3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtWYWxpZGF0b3JzLnJlcXVpcmVkLCBWYWxpZGF0b3JzLnBhdHRlcm4oL1xcUy8pLCBWYWxpZGF0b3JzLm1heExlbmd0aCgxMildLFxuICAgIH0pLFxuICAgIG51bWVyb0RvY3VtZW50bzogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbVmFsaWRhdG9ycy5yZXF1aXJlZCwgVmFsaWRhdG9ycy5wYXR0ZXJuKC9cXFMvKSwgVmFsaWRhdG9ycy5tYXhMZW5ndGgoMjApXSxcbiAgICB9KSxcbiAgICBub21icmVzOiBuZXcgRm9ybUNvbnRyb2w8c3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtWYWxpZGF0b3JzLnJlcXVpcmVkLCBWYWxpZGF0b3JzLnBhdHRlcm4oL1xcUy8pLCBWYWxpZGF0b3JzLm1heExlbmd0aCgxMDApXSxcbiAgICB9KSxcbiAgICBhcGVsbGlkb3M6IG5ldyBGb3JtQ29udHJvbDxzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsPih1bmRlZmluZWQsIHtcbiAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgICAgdmFsaWRhdG9yczogW1ZhbGlkYXRvcnMucmVxdWlyZWQsIFZhbGlkYXRvcnMucGF0dGVybigvXFxTLyksIFZhbGlkYXRvcnMubWF4TGVuZ3RoKDEwMCldLFxuICAgIH0pLFxuICAgIHRlbGVmb25vOiBuZXcgRm9ybUNvbnRyb2w8c3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtWYWxpZGF0b3JzLm1heExlbmd0aCgyMCldLFxuICAgIH0pLFxuICAgIGNvcnJlbzogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbVmFsaWRhdG9ycy5lbWFpbCwgVmFsaWRhdG9ycy5tYXhMZW5ndGgoMTUwKV0sXG4gICAgfSksXG4gICAgZGlyZWNjaW9uOiBuZXcgRm9ybUNvbnRyb2w8c3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtWYWxpZGF0b3JzLm1heExlbmd0aCgyNTApXSxcbiAgICB9KSxcbiAgICBlc3RhZG86IG5ldyBGb3JtQ29udHJvbDxzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsPih1bmRlZmluZWQsIHtcbiAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgIH0pLFxuICAgIGZlY2hhTmFjaW1pZW50bzogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbKGNvbnRyb2wpID0+IHtcbiAgICAgICAgaWYgKCFjb250cm9sLnZhbHVlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgcGFydHMgPSBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChcImVuLUNBXCIsIHtcbiAgICAgICAgICB0aW1lWm9uZTogXCJBbWVyaWNhL0JvZ290YVwiLCB5ZWFyOiBcIm51bWVyaWNcIiwgbW9udGg6IFwiMi1kaWdpdFwiLCBkYXk6IFwiMi1kaWdpdFwiLFxuICAgICAgICB9KS5mb3JtYXRUb1BhcnRzKG5ldyBEYXRlKCkpO1xuICAgICAgICBjb25zdCBwYXJ0ID0gKHR5cGU6IHN0cmluZykgPT4gcGFydHMuZmluZCgocCkgPT4gcC50eXBlID09PSB0eXBlKT8udmFsdWU7XG4gICAgICAgIGNvbnN0IHRvZGF5ID0gYCR7cGFydChcInllYXJcIil9LSR7cGFydChcIm1vbnRoXCIpfS0ke3BhcnQoXCJkYXlcIil9YDtcbiAgICAgICAgcmV0dXJuIGNvbnRyb2wudmFsdWUgPiB0b2RheSA/IHsgZmVjaGFGdXR1cmE6IHRydWUgfSA6IG51bGw7XG4gICAgICB9XSxcbiAgICB9KSxcbiAgfSk7XG4gIGdldCBmb3JtKCk6IFBhY2llbnRlUmVxdWVzdCB7XG4gICAgcmV0dXJuIHRoaXMuZm9ybUdyb3VwLmdldFJhd1ZhbHVlKCk7XG4gIH1cbiAgc2V0IGZvcm0odmFsdWU6IFBhY2llbnRlUmVxdWVzdCkge1xuICAgIHRoaXMuZm9ybUdyb3VwLnJlc2V0KHZhbHVlKTtcbiAgfVxuICBuZ09uSW5pdCgpIHtcbiAgICB2b2lkIHRoaXMuY2FyZ2FyKCk7XG4gIH1cbiAgYXN5bmMgY2FyZ2FyKCkge1xuICAgIHRyeSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBpZCA9IHRoaXMucm91dGU/LnNuYXBzaG90LnBhcmFtTWFwLmdldChcImlkXCIpO1xuICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICBjb25zdCByZWNvcmRzID0gYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wYWNpZW50ZXNTZXJ2aWNlLmxpc3RhcigpKTtcbiAgICAgICAgICBjb25zdCBwYWNpZW50ZSA9IHJlY29yZHMuZmluZCgocCkgPT4gcC5pZFBhY2llbnRlID09PSBOdW1iZXIoaWQpKTtcbiAgICAgICAgICBpZiAoIXBhY2llbnRlKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9yID0gXCJQYWNpZW50ZSBubyBlbmNvbnRyYWRvXCI7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZWRpdGFyKHBhY2llbnRlKTtcbiAgICAgICAgfSBlbHNlIHRoaXMubnVldm8oKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbiAgbnVldm8oKSB7XG4gICAgdGhpcy5mb3JtID0ge1xuICAgICAgdGlwb0RvY3VtZW50bzogXCJETklcIixcbiAgICAgIG51bWVyb0RvY3VtZW50bzogXCJcIixcbiAgICAgIG5vbWJyZXM6IFwiXCIsXG4gICAgICBhcGVsbGlkb3M6IFwiXCIsXG4gICAgICBmZWNoYU5hY2ltaWVudG86IFwiXCIsXG4gICAgICB0ZWxlZm9ubzogXCJcIixcbiAgICAgIGNvcnJlbzogXCJcIixcbiAgICAgIGRpcmVjY2lvbjogXCJcIixcbiAgICAgIGVzdGFkbzogXCJBQ1RJVk9cIixcbiAgICB9O1xuXG4gICAgdGhpcy5lcnJvciA9IFwiXCI7XG4gICAgdGhpcy5leGl0byA9IFwiXCI7XG4gIH1cbiAgZWRpdGFyKHA6IFBhY2llbnRlKSB7XG4gICAgdGhpcy5mb3JtID0ge1xuICAgICAgaWRQYWNpZW50ZTogcC5pZFBhY2llbnRlLFxuICAgICAgdGlwb0RvY3VtZW50bzogcC50aXBvRG9jdW1lbnRvLFxuICAgICAgbnVtZXJvRG9jdW1lbnRvOiBwLm51bWVyb0RvY3VtZW50byxcbiAgICAgIG5vbWJyZXM6IHAubm9tYnJlcyxcbiAgICAgIGFwZWxsaWRvczogcC5hcGVsbGlkb3MsXG4gICAgICB0ZWxlZm9ubzogcC50ZWxlZm9ubyxcbiAgICAgIGNvcnJlbzogcC5jb3JyZW8sXG4gICAgICBkaXJlY2Npb246IHAuZGlyZWNjaW9uLFxuICAgICAgZXN0YWRvOiBwLmVzdGFkbyxcbiAgICB9O1xuICB9XG4gIGFzeW5jIGd1YXJkYXIoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLmNhcmdhbmRvKSByZXR1cm47XG4gICAgICBpZiAodGhpcy5mb3JtR3JvdXAuaW52YWxpZCkge1xuICAgICAgICB0aGlzLmZvcm1Hcm91cC5tYXJrQWxsQXNUb3VjaGVkKCk7XG4gICAgICAgIHRoaXMuZXhpdG8gPSBcIlwiO1xuICAgICAgICB0aGlzLmVycm9yID0gZm9ybUVycm9yVGV4dCh0aGlzLmZvcm1Hcm91cCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5yZWdpc3Ryb0Rpc3BvbmlibGUpIHtcbiAgICAgICAgdGhpcy5lcnJvciA9XG4gICAgICAgICAgXCJObyBzZSBwdWVkZSBndWFyZGFyOiBlbCBwYWNpZW50ZSBkZSBlc3RhIGVkaWNpw7NuIG5vIHNlIGhhIGNhcmdhZG8uXCI7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuZXJyb3IgPSBcIlwiO1xuICAgICAgdGhpcy5leGl0byA9IFwiXCI7XG4gICAgICB0aGlzLmNhcmdhbmRvID0gdHJ1ZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucGFjaWVudGVzU2VydmljZS5ndWFyZGFyKHRoaXMuZm9ybSkpO1xuICAgICAgICB0aGlzLmV4aXRvID0gXCJQYWNpZW50ZSBndWFyZGFkbyBjb3JyZWN0YW1lbnRlLlwiO1xuICAgICAgICB0aGlzLmJ1c2NhciA9IFwiXCI7XG4gICAgICAgIHZvaWQgdGhpcy5yb3V0ZXIubmF2aWdhdGVCeVVybChcIi9wYWNpZW50ZXNcIik7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBlcnJvclRleHQoZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMuY2FyZ2FuZG8gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbiAgYXN5bmMgY29uc3VsdGFyRG5pKCkge1xuICAgIGlmICh0aGlzLmZvcm0uaWRQYWNpZW50ZSB8fCB0aGlzLmZvcm0udGlwb0RvY3VtZW50byAhPT0gXCJETklcIikgcmV0dXJuO1xuICAgIGNvbnN0IGRuaSA9ICh0aGlzLmZvcm0ubnVtZXJvRG9jdW1lbnRvIHx8IFwiXCIpLnRyaW0oKTtcbiAgICBpZiAoIS9eXFxkezh9JC8udGVzdChkbmkpKSByZXR1cm47XG4gICAgdGhpcy5jb25zdWx0YW5kb0RuaSA9IHRydWU7XG4gICAgdGhpcy5lcnJvciA9IFwiXCI7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBlcnNvbmEgPSBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLmNhdGFsb2dvc1NlcnZpY2UuY29uc3VsdGFyRG5pKGRuaSkpO1xuICAgICAgdGhpcy5mb3JtR3JvdXAucGF0Y2hWYWx1ZSh7XG4gICAgICAgIG5vbWJyZXM6IHBlcnNvbmEubm9tYnJlcyxcbiAgICAgICAgYXBlbGxpZG9zOiBgJHtwZXJzb25hLmFwZWxsaWRvUGF0ZXJub30gJHtwZXJzb25hLmFwZWxsaWRvTWF0ZXJub31gLnRyaW0oKSxcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuZXJyb3IgPSBlcnJvclRleHQoZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuY29uc3VsdGFuZG9EbmkgPSBmYWxzZTtcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG4gIGdldCByZWdpc3Ryb0Rpc3BvbmlibGUoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgaWQgPSB0aGlzLnJvdXRlPy5zbmFwc2hvdC5wYXJhbU1hcC5nZXQoXCJpZFwiKTtcbiAgICByZXR1cm4gIWlkIHx8IE51bWJlcihpZCkgPT09IHRoaXMuZm9ybS5pZFBhY2llbnRlO1xuICB9XG59XG4iXX0=
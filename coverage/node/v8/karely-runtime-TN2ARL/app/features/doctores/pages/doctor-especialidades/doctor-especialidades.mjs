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
import { Paginador } from '../../../../shared/components/paginador/paginador.mjs';
import { ControlDisabled } from '../../../../shared/directives/control-disabled.mjs';
import { CatalogoService } from '../../../catalogos/services/catalogos-service.mjs';
import { DoctorService } from '../../services/doctores-service.mjs';
let DoctorEspecialidades = class DoctorEspecialidades {
    changeDetector = inject(ChangeDetectorRef);
    guardando = false;
    constructor() {
        this.especialidadForm = {};
    }
    doctoresService = inject(DoctorService);
    catalogoService = inject(CatalogoService);
    doctores = [];
    especialidades = [];
    asignadas = [];
    porQuitar = null;
    cargandoAsignadas = false;
    cargaAsignadas = 0;
    get disponibles() {
        return this.especialidades.filter((e) => e.estado === "ACTIVO" &&
            !this.asignadas.some((a) => a.idEspecialidad === e.idEspecialidad));
    }
    error = "";
    exito = "";
    especialidadFormGroup = new FormGroup({
        idDoctor: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        idEspecialidad: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });
    get especialidadForm() {
        return this.especialidadFormGroup.getRawValue();
    }
    set especialidadForm(value) {
        this.especialidadFormGroup.reset(value);
    }
    ngOnInit() {
        void this.cargar();
    }
    async cargar() {
        try {
            try {
                [this.doctores, this.especialidades] = await Promise.all([
                    firstValueFrom(this.doctoresService.listar()),
                    firstValueFrom(this.catalogoService.especialidades()),
                ]);
                await this.cargarAsignadas();
            }
            catch (e) {
                this.error = errorText(e);
            }
        }
        finally {
            this.changeDetector.markForCheck();
        }
    }
    async cargarAsignadas() {
        const carga = ++this.cargaAsignadas;
        const doctor = this.especialidadForm.idDoctor;
        this.porQuitar = null;
        this.asignadas = [];
        this.especialidadFormGroup.controls.idEspecialidad.reset();
        this.cargandoAsignadas = !!doctor;
        try {
            if (!doctor)
                return;
            const asignadas = await firstValueFrom(this.doctoresService.especialidades(doctor));
            if (carga === this.cargaAsignadas &&
                doctor === this.especialidadForm.idDoctor)
                this.asignadas = asignadas;
        }
        catch (e) {
            if (carga === this.cargaAsignadas)
                this.error = errorText(e);
        }
        finally {
            if (carga === this.cargaAsignadas)
                this.cargandoAsignadas = false;
            this.changeDetector.markForCheck();
        }
    }
    confirmarQuitar(especialidad) {
        if (this.guardando || this.cargandoAsignadas)
            return;
        this.error = "";
        this.exito = "";
        this.porQuitar = especialidad;
    }
    async quitarEspecialidad() {
        const doctor = this.especialidadForm.idDoctor;
        const especialidad = this.porQuitar;
        if (!doctor || !especialidad || this.guardando)
            return;
        this.guardando = true;
        this.error = "";
        this.exito = "";
        try {
            await firstValueFrom(this.doctoresService.quitarEspecialidad(doctor, especialidad.idEspecialidad));
            this.exito = "Especialidad retirada del doctor";
            await this.cargarAsignadas();
        }
        catch (e) {
            this.error = errorText(e);
        }
        finally {
            this.porQuitar = null;
            this.guardando = false;
            this.changeDetector.markForCheck();
        }
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
    async asignarEspecialidad() {
        if (this.guardando)
            return;
        this.guardando = true;
        try {
            if (this.especialidadFormGroup.invalid) {
                this.especialidadFormGroup.markAllAsTouched();
                this.exito = "";
                this.error = "Selecciona un doctor y una especialidad.";
                return;
            }
            await this.run("doctor-especialidad", this.especialidadForm, "Especialidad asignada");
        }
        finally {
            this.guardando = false;
            this.changeDetector.markForCheck();
        }
    }
};
DoctorEspecialidades = __decorate([
    Component({
        standalone: true,
        imports: [ReactiveFormsModule, FeatureNav, ControlDisabled, Paginador],
        template: "<div class=\"k-module k-doctores\">\n  <header class=\"k-module-header\">\n    <div>\n      <span class=\"k-eyebrow\">GESTIÓN CLÍNICA / PERSONAL MÉDICO</span>\n      <h1 class=\"k-title\">Doctores</h1>\n      <p class=\"k-subtitle\">\n        Administra médicos, especialidades, documentos y disponibilidad de\n        atención.\n      </p>\n    </div>\n    <div class=\"k-header-actions\">\n      <button class=\"k-button k-button-secondary\" (click)=\"cargar()\">\n        ↻ Actualizar datos\n      </button>\n    </div>\n  </header>\n  <app-feature-nav feature=\"doctores\" />\n  @if(error){\n  <div class=\"k-error\" role=\"alert\">{{error}}</div>\n  }@if(exito){\n  <div class=\"k-success\" role=\"status\">{{exito}}</div>\n  }\n  <section class=\"k-panel\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>Asignación de especialidades</h2>\n        <p>\n          Relaciona a cada médico con las especialidades que tiene habilitadas.\n        </p>\n      </div>\n    </div>\n    <div class=\"k-form\">\n      <label class=\"k-field\"\n        >Doctor<select\n          [formControl]=\"especialidadFormGroup.controls.idDoctor\"\n          [appControlDisabled]=\"guardando\"\n          (change)=\"error='';exito='';cargarAsignadas()\"\n        >\n          <option [ngValue]=\"null\">Selecciona un doctor</option>\n          @for(d of doctores;track d.idDoctor){\n          <option [ngValue]=\"d.idDoctor\">{{d.nombres}} {{d.apellidos}}</option>\n          }\n        </select></label\n      >\n      <label class=\"k-field\"\n        >Especialidad<select\n          [formControl]=\"especialidadFormGroup.controls.idEspecialidad\"\n          [appControlDisabled]=\"guardando || cargandoAsignadas || !especialidadForm.idDoctor\"\n        >\n          <option [ngValue]=\"null\">Selecciona una especialidad</option>\n          @for(e of disponibles;track e.idEspecialidad){\n          <option [ngValue]=\"e.idEspecialidad\">{{e.nombre}}</option>\n          }\n        </select></label\n      >\n    </div>\n    <div class=\"k-actions\">\n      <button\n        class=\"k-button\"\n        [disabled]=\"guardando || cargandoAsignadas || (!especialidadForm.idDoctor || !especialidadForm.idEspecialidad)\"\n        (click)=\"asignarEspecialidad()\"\n      >\n        Asignar especialidad\n      </button>\n    </div>\n  </section>\n  <section class=\"k-panel\" aria-labelledby=\"asignadas-titulo\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2 id=\"asignadas-titulo\">Especialidades del doctor</h2>\n        <p>\n          Quita una asignación si fue registrada por error. El historial de\n          citas se conserva.\n        </p>\n      </div>\n    </div>\n    @if(!especialidadForm.idDoctor){\n    <p class=\"k-empty\">Selecciona un doctor para ver sus especialidades.</p>\n    }@else if(cargandoAsignadas){\n    <p role=\"status\">Cargando especialidades…</p>\n    }@else{\n    <ul class=\"asignadas-lista\">\n      @for(e of tabla.contenido();track e.idEspecialidad){\n      <li>\n        <div>\n          <strong>{{e.nombre}}</strong\n          ><span\n            >{{e.estado === 'ACTIVO' ? 'Especialidad asignada' : 'Especialidad\n            inactiva'}}</span\n          >\n        </div>\n        <button\n          type=\"button\"\n          class=\"k-button k-button-secondary\"\n          [disabled]=\"guardando\"\n          (click)=\"confirmarQuitar(e)\"\n        >\n          Quitar asignación\n        </button>\n      </li>\n      }@empty{\n      <li class=\"k-empty\">Este doctor no tiene especialidades asignadas.</li>\n      }\n    </ul>\n    <app-paginador #tabla [registros]=\"asignadas\" />\n    } @if(porQuitar;as e){\n    <div\n      class=\"confirmar-retiro\"\n      role=\"alertdialog\"\n      aria-labelledby=\"retiro-titulo\"\n      aria-describedby=\"retiro-detalle\"\n    >\n      <h3 id=\"retiro-titulo\">¿Quitar {{e.nombre}}?</h3>\n      <p id=\"retiro-detalle\">\n        El doctor dejará de ofrecer esta especialidad. No podrás quitarla si\n        tiene citas pendientes o reservas vigentes.\n      </p>\n      @if(asignadas.length === 1){\n      <p>\n        Es su única especialidad: necesitará otra asignación para recibir nuevas\n        reservas.\n      </p>\n      }\n      <div class=\"k-actions\">\n        <button\n          type=\"button\"\n          class=\"k-button\"\n          [disabled]=\"guardando\"\n          (click)=\"quitarEspecialidad()\"\n        >\n          {{guardando ? 'Quitando…' : 'Sí, quitar asignación'}}\n        </button>\n        <button\n          type=\"button\"\n          class=\"k-button k-button-secondary\"\n          [disabled]=\"guardando\"\n          (click)=\"porQuitar=null\"\n        >\n          Cancelar\n        </button>\n      </div>\n    </div>\n    }\n  </section>\n</div>\n",
        styles: [],
    })
], DoctorEspecialidades);
export { DoctorEspecialidades };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdG9yLWVzcGVjaWFsaWRhZGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vQzovVU5JVkVSU0lEQUQvTFAyL1NFTUFOQTExL2thcmVseV9tb2Rlcm5vL2Zyb250ZW5kL3NyYy9hcHAvZmVhdHVyZXMvZG9jdG9yZXMvcGFnZXMvZG9jdG9yLWVzcGVjaWFsaWRhZGVzLyIsInNvdXJjZXMiOlsiZG9jdG9yLWVzcGVjaWFsaWRhZGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQzdFLE9BQU8sRUFDTCxXQUFXLEVBQ1gsU0FBUyxFQUNULG1CQUFtQixFQUNuQixVQUFVLEdBQ1gsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUM5RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDbkYsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1EQUFtRCxDQUFDO0FBQzlFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUVqRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFNaEYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBUXpELElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQW9CO0lBQ2QsY0FBYyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzVELFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDbEI7UUFDRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFDTyxlQUFlLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3hDLGVBQWUsR0FBRyxNQUFN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O1FBQ0gsQ0FBQztnQkFBUyxDQUFDO1lBQ1QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNyQyxDQUFDO0lBQ0gsQ0FBQztJQUNELEtBQUssQ0FBQyxtQkFBbUI7UUFDdkIsSUFBSSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDO1lBQ0gsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRywwQ0FBMEMsQ0FBQztnQkFDeEQsT0FBTztZQUNULENBQUM7WUFDRCxNQUFNLElBQUksQ0FBQyxHQUFHLENBQ1oscUJBQXFCLEVBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsRUFDckIsdUJBQXVCLENBQ3hCLENBQUM7UUFDSixDQUFDO2dCQUFTLENBQUM7WUFDVCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JDLENBQUM7SUFDSCxDQUFDO0NBQ0YsQ0FBQTtBQXRKWSxvQkFBb0I7SUFOaEMsU0FBUyxDQUFDO1FBQ1QsVUFBVSxFQUFFLElBQUk7UUFDaEIsT0FBTyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxTQUFTLENBQUM7UUFDdEUsUUFBUSxFQUFDLG1zSkFBbXNKO1FBQzVzSixNQUFNLEVBQUMsRUFBRTtLQUNWLENBQUM7R0FDVyxvQkFBb0IsQ0FzSmhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgaW5qZWN0LCBPbkluaXQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtcbiAgRm9ybUNvbnRyb2wsXG4gIEZvcm1Hcm91cCxcbiAgUmVhY3RpdmVGb3Jtc01vZHVsZSxcbiAgVmFsaWRhdG9ycyxcbn0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5pbXBvcnQgeyBmaXJzdFZhbHVlRnJvbSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBlcnJvclRleHQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29yZS91dGlscy9odHRwLWVycm9yXCI7XG5pbXBvcnQgeyBGZWF0dXJlTmF2IH0gZnJvbSBcIi4uLy4uLy4uLy4uL3NoYXJlZC9jb21wb25lbnRzL2ZlYXR1cmUtbmF2L2ZlYXR1cmUtbmF2XCI7XG5pbXBvcnQgeyBQYWdpbmFkb3IgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2NvbXBvbmVudHMvcGFnaW5hZG9yL3BhZ2luYWRvclwiO1xuaW1wb3J0IHsgQ29udHJvbERpc2FibGVkIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3NoYXJlZC9kaXJlY3RpdmVzL2NvbnRyb2wtZGlzYWJsZWRcIjtcbmltcG9ydCB7IEVzcGVjaWFsaWRhZCB9IGZyb20gXCIuLi8uLi8uLi9jYXRhbG9nb3MvbW9kZWxzL2NhdGFsb2dvcy5tb2RlbFwiO1xuaW1wb3J0IHsgQ2F0YWxvZ29TZXJ2aWNlIH0gZnJvbSBcIi4uLy4uLy4uL2NhdGFsb2dvcy9zZXJ2aWNlcy9jYXRhbG9nb3Mtc2VydmljZVwiO1xuaW1wb3J0IHtcbiAgRG9jdG9yLFxuICBEb2N0b3JBY2Npb24sXG4gIERvY3RvclJlcXVlc3QsXG59IGZyb20gXCIuLi8uLi9tb2RlbHMvZG9jdG9yZXMubW9kZWxcIjtcbmltcG9ydCB7IERvY3RvclNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2VydmljZXMvZG9jdG9yZXMtc2VydmljZVwiO1xuXG5AQ29tcG9uZW50KHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW1JlYWN0aXZlRm9ybXNNb2R1bGUsIEZlYXR1cmVOYXYsIENvbnRyb2xEaXNhYmxlZCwgUGFnaW5hZG9yXSxcbiAgdGVtcGxhdGU6XCI8ZGl2IGNsYXNzPVxcXCJrLW1vZHVsZSBrLWRvY3RvcmVzXFxcIj5cXG4gIDxoZWFkZXIgY2xhc3M9XFxcImstbW9kdWxlLWhlYWRlclxcXCI+XFxuICAgIDxkaXY+XFxuICAgICAgPHNwYW4gY2xhc3M9XFxcImstZXllYnJvd1xcXCI+R0VTVEnDk04gQ0zDjU5JQ0EgLyBQRVJTT05BTCBNw4lESUNPPC9zcGFuPlxcbiAgICAgIDxoMSBjbGFzcz1cXFwiay10aXRsZVxcXCI+RG9jdG9yZXM8L2gxPlxcbiAgICAgIDxwIGNsYXNzPVxcXCJrLXN1YnRpdGxlXFxcIj5cXG4gICAgICAgIEFkbWluaXN0cmEgbcOpZGljb3MsIGVzcGVjaWFsaWRhZGVzLCBkb2N1bWVudG9zIHkgZGlzcG9uaWJpbGlkYWQgZGVcXG4gICAgICAgIGF0ZW5jacOzbi5cXG4gICAgICA8L3A+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLWhlYWRlci1hY3Rpb25zXFxcIj5cXG4gICAgICA8YnV0dG9uIGNsYXNzPVxcXCJrLWJ1dHRvbiBrLWJ1dHRvbi1zZWNvbmRhcnlcXFwiIChjbGljayk9XFxcImNhcmdhcigpXFxcIj5cXG4gICAgICAgIOKGuyBBY3R1YWxpemFyIGRhdG9zXFxuICAgICAgPC9idXR0b24+XFxuICAgIDwvZGl2PlxcbiAgPC9oZWFkZXI+XFxuICA8YXBwLWZlYXR1cmUtbmF2IGZlYXR1cmU9XFxcImRvY3RvcmVzXFxcIiAvPlxcbiAgQGlmKGVycm9yKXtcXG4gIDxkaXYgY2xhc3M9XFxcImstZXJyb3JcXFwiIHJvbGU9XFxcImFsZXJ0XFxcIj57e2Vycm9yfX08L2Rpdj5cXG4gIH1AaWYoZXhpdG8pe1xcbiAgPGRpdiBjbGFzcz1cXFwiay1zdWNjZXNzXFxcIiByb2xlPVxcXCJzdGF0dXNcXFwiPnt7ZXhpdG99fTwvZGl2PlxcbiAgfVxcbiAgPHNlY3Rpb24gY2xhc3M9XFxcImstcGFuZWxcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLXNlY3Rpb24taGVhZGluZ1xcXCI+XFxuICAgICAgPGRpdj5cXG4gICAgICAgIDxoMj5Bc2lnbmFjacOzbiBkZSBlc3BlY2lhbGlkYWRlczwvaDI+XFxuICAgICAgICA8cD5cXG4gICAgICAgICAgUmVsYWNpb25hIGEgY2FkYSBtw6lkaWNvIGNvbiBsYXMgZXNwZWNpYWxpZGFkZXMgcXVlIHRpZW5lIGhhYmlsaXRhZGFzLlxcbiAgICAgICAgPC9wPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1mb3JtXFxcIj5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+RG9jdG9yPHNlbGVjdFxcbiAgICAgICAgICBbZm9ybUNvbnRyb2xdPVxcXCJlc3BlY2lhbGlkYWRGb3JtR3JvdXAuY29udHJvbHMuaWREb2N0b3JcXFwiXFxuICAgICAgICAgIFthcHBDb250cm9sRGlzYWJsZWRdPVxcXCJndWFyZGFuZG9cXFwiXFxuICAgICAgICAgIChjaGFuZ2UpPVxcXCJlcnJvcj0nJztleGl0bz0nJztjYXJnYXJBc2lnbmFkYXMoKVxcXCJcXG4gICAgICAgID5cXG4gICAgICAgICAgPG9wdGlvbiBbbmdWYWx1ZV09XFxcIm51bGxcXFwiPlNlbGVjY2lvbmEgdW4gZG9jdG9yPC9vcHRpb24+XFxuICAgICAgICAgIEBmb3IoZCBvZiBkb2N0b3Jlczt0cmFjayBkLmlkRG9jdG9yKXtcXG4gICAgICAgICAgPG9wdGlvbiBbbmdWYWx1ZV09XFxcImQuaWREb2N0b3JcXFwiPnt7ZC5ub21icmVzfX0ge3tkLmFwZWxsaWRvc319PC9vcHRpb24+XFxuICAgICAgICAgIH1cXG4gICAgICAgIDwvc2VsZWN0PjwvbGFiZWxcXG4gICAgICA+XFxuICAgICAgPGxhYmVsIGNsYXNzPVxcXCJrLWZpZWxkXFxcIlxcbiAgICAgICAgPkVzcGVjaWFsaWRhZDxzZWxlY3RcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwiZXNwZWNpYWxpZGFkRm9ybUdyb3VwLmNvbnRyb2xzLmlkRXNwZWNpYWxpZGFkXFxcIlxcbiAgICAgICAgICBbYXBwQ29udHJvbERpc2FibGVkXT1cXFwiZ3VhcmRhbmRvIHx8IGNhcmdhbmRvQXNpZ25hZGFzIHx8ICFlc3BlY2lhbGlkYWRGb3JtLmlkRG9jdG9yXFxcIlxcbiAgICAgICAgPlxcbiAgICAgICAgICA8b3B0aW9uIFtuZ1ZhbHVlXT1cXFwibnVsbFxcXCI+U2VsZWNjaW9uYSB1bmEgZXNwZWNpYWxpZGFkPC9vcHRpb24+XFxuICAgICAgICAgIEBmb3IoZSBvZiBkaXNwb25pYmxlczt0cmFjayBlLmlkRXNwZWNpYWxpZGFkKXtcXG4gICAgICAgICAgPG9wdGlvbiBbbmdWYWx1ZV09XFxcImUuaWRFc3BlY2lhbGlkYWRcXFwiPnt7ZS5ub21icmV9fTwvb3B0aW9uPlxcbiAgICAgICAgICB9XFxuICAgICAgICA8L3NlbGVjdD48L2xhYmVsXFxuICAgICAgPlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1hY3Rpb25zXFxcIj5cXG4gICAgICA8YnV0dG9uXFxuICAgICAgICBjbGFzcz1cXFwiay1idXR0b25cXFwiXFxuICAgICAgICBbZGlzYWJsZWRdPVxcXCJndWFyZGFuZG8gfHwgY2FyZ2FuZG9Bc2lnbmFkYXMgfHwgKCFlc3BlY2lhbGlkYWRGb3JtLmlkRG9jdG9yIHx8ICFlc3BlY2lhbGlkYWRGb3JtLmlkRXNwZWNpYWxpZGFkKVxcXCJcXG4gICAgICAgIChjbGljayk9XFxcImFzaWduYXJFc3BlY2lhbGlkYWQoKVxcXCJcXG4gICAgICA+XFxuICAgICAgICBBc2lnbmFyIGVzcGVjaWFsaWRhZFxcbiAgICAgIDwvYnV0dG9uPlxcbiAgICA8L2Rpdj5cXG4gIDwvc2VjdGlvbj5cXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJrLXBhbmVsXFxcIiBhcmlhLWxhYmVsbGVkYnk9XFxcImFzaWduYWRhcy10aXR1bG9cXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLXNlY3Rpb24taGVhZGluZ1xcXCI+XFxuICAgICAgPGRpdj5cXG4gICAgICAgIDxoMiBpZD1cXFwiYXNpZ25hZGFzLXRpdHVsb1xcXCI+RXNwZWNpYWxpZGFkZXMgZGVsIGRvY3RvcjwvaDI+XFxuICAgICAgICA8cD5cXG4gICAgICAgICAgUXVpdGEgdW5hIGFzaWduYWNpw7NuIHNpIGZ1ZSByZWdpc3RyYWRhIHBvciBlcnJvci4gRWwgaGlzdG9yaWFsIGRlXFxuICAgICAgICAgIGNpdGFzIHNlIGNvbnNlcnZhLlxcbiAgICAgICAgPC9wPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgQGlmKCFlc3BlY2lhbGlkYWRGb3JtLmlkRG9jdG9yKXtcXG4gICAgPHAgY2xhc3M9XFxcImstZW1wdHlcXFwiPlNlbGVjY2lvbmEgdW4gZG9jdG9yIHBhcmEgdmVyIHN1cyBlc3BlY2lhbGlkYWRlcy48L3A+XFxuICAgIH1AZWxzZSBpZihjYXJnYW5kb0FzaWduYWRhcyl7XFxuICAgIDxwIHJvbGU9XFxcInN0YXR1c1xcXCI+Q2FyZ2FuZG8gZXNwZWNpYWxpZGFkZXPigKY8L3A+XFxuICAgIH1AZWxzZXtcXG4gICAgPHVsIGNsYXNzPVxcXCJhc2lnbmFkYXMtbGlzdGFcXFwiPlxcbiAgICAgIEBmb3IoZSBvZiB0YWJsYS5jb250ZW5pZG8oKTt0cmFjayBlLmlkRXNwZWNpYWxpZGFkKXtcXG4gICAgICA8bGk+XFxuICAgICAgICA8ZGl2PlxcbiAgICAgICAgICA8c3Ryb25nPnt7ZS5ub21icmV9fTwvc3Ryb25nXFxuICAgICAgICAgID48c3BhblxcbiAgICAgICAgICAgID57e2UuZXN0YWRvID09PSAnQUNUSVZPJyA/ICdFc3BlY2lhbGlkYWQgYXNpZ25hZGEnIDogJ0VzcGVjaWFsaWRhZFxcbiAgICAgICAgICAgIGluYWN0aXZhJ319PC9zcGFuXFxuICAgICAgICAgID5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICB0eXBlPVxcXCJidXR0b25cXFwiXFxuICAgICAgICAgIGNsYXNzPVxcXCJrLWJ1dHRvbiBrLWJ1dHRvbi1zZWNvbmRhcnlcXFwiXFxuICAgICAgICAgIFtkaXNhYmxlZF09XFxcImd1YXJkYW5kb1xcXCJcXG4gICAgICAgICAgKGNsaWNrKT1cXFwiY29uZmlybWFyUXVpdGFyKGUpXFxcIlxcbiAgICAgICAgPlxcbiAgICAgICAgICBRdWl0YXIgYXNpZ25hY2nDs25cXG4gICAgICAgIDwvYnV0dG9uPlxcbiAgICAgIDwvbGk+XFxuICAgICAgfUBlbXB0eXtcXG4gICAgICA8bGkgY2xhc3M9XFxcImstZW1wdHlcXFwiPkVzdGUgZG9jdG9yIG5vIHRpZW5lIGVzcGVjaWFsaWRhZGVzIGFzaWduYWRhcy48L2xpPlxcbiAgICAgIH1cXG4gICAgPC91bD5cXG4gICAgPGFwcC1wYWdpbmFkb3IgI3RhYmxhIFtyZWdpc3Ryb3NdPVxcXCJhc2lnbmFkYXNcXFwiIC8+XFxuICAgIH0gQGlmKHBvclF1aXRhcjthcyBlKXtcXG4gICAgPGRpdlxcbiAgICAgIGNsYXNzPVxcXCJjb25maXJtYXItcmV0aXJvXFxcIlxcbiAgICAgIHJvbGU9XFxcImFsZXJ0ZGlhbG9nXFxcIlxcbiAgICAgIGFyaWEtbGFiZWxsZWRieT1cXFwicmV0aXJvLXRpdHVsb1xcXCJcXG4gICAgICBhcmlhLWRlc2NyaWJlZGJ5PVxcXCJyZXRpcm8tZGV0YWxsZVxcXCJcXG4gICAgPlxcbiAgICAgIDxoMyBpZD1cXFwicmV0aXJvLXRpdHVsb1xcXCI+wr9RdWl0YXIge3tlLm5vbWJyZX19PzwvaDM+XFxuICAgICAgPHAgaWQ9XFxcInJldGlyby1kZXRhbGxlXFxcIj5cXG4gICAgICAgIEVsIGRvY3RvciBkZWphcsOhIGRlIG9mcmVjZXIgZXN0YSBlc3BlY2lhbGlkYWQuIE5vIHBvZHLDoXMgcXVpdGFybGEgc2lcXG4gICAgICAgIHRpZW5lIGNpdGFzIHBlbmRpZW50ZXMgbyByZXNlcnZhcyB2aWdlbnRlcy5cXG4gICAgICA8L3A+XFxuICAgICAgQGlmKGFzaWduYWRhcy5sZW5ndGggPT09IDEpe1xcbiAgICAgIDxwPlxcbiAgICAgICAgRXMgc3Ugw7puaWNhIGVzcGVjaWFsaWRhZDogbmVjZXNpdGFyw6Egb3RyYSBhc2lnbmFjacOzbiBwYXJhIHJlY2liaXIgbnVldmFzXFxuICAgICAgICByZXNlcnZhcy5cXG4gICAgICA8L3A+XFxuICAgICAgfVxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImstYWN0aW9uc1xcXCI+XFxuICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgIHR5cGU9XFxcImJ1dHRvblxcXCJcXG4gICAgICAgICAgY2xhc3M9XFxcImstYnV0dG9uXFxcIlxcbiAgICAgICAgICBbZGlzYWJsZWRdPVxcXCJndWFyZGFuZG9cXFwiXFxuICAgICAgICAgIChjbGljayk9XFxcInF1aXRhckVzcGVjaWFsaWRhZCgpXFxcIlxcbiAgICAgICAgPlxcbiAgICAgICAgICB7e2d1YXJkYW5kbyA/ICdRdWl0YW5kb+KApicgOiAnU8OtLCBxdWl0YXIgYXNpZ25hY2nDs24nfX1cXG4gICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICB0eXBlPVxcXCJidXR0b25cXFwiXFxuICAgICAgICAgIGNsYXNzPVxcXCJrLWJ1dHRvbiBrLWJ1dHRvbi1zZWNvbmRhcnlcXFwiXFxuICAgICAgICAgIFtkaXNhYmxlZF09XFxcImd1YXJkYW5kb1xcXCJcXG4gICAgICAgICAgKGNsaWNrKT1cXFwicG9yUXVpdGFyPW51bGxcXFwiXFxuICAgICAgICA+XFxuICAgICAgICAgIENhbmNlbGFyXFxuICAgICAgICA8L2J1dHRvbj5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIH1cXG4gIDwvc2VjdGlvbj5cXG48L2Rpdj5cXG5cIixcbiAgc3R5bGVzOltdLFxufSlcbmV4cG9ydCBjbGFzcyBEb2N0b3JFc3BlY2lhbGlkYWRlcyBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgY2hhbmdlRGV0ZWN0b3IgPSBpbmplY3QoQ2hhbmdlRGV0ZWN0b3JSZWYpO1xuICBndWFyZGFuZG8gPSBmYWxzZTtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lc3BlY2lhbGlkYWRGb3JtID0ge307XG4gIH1cbiAgcHJpdmF0ZSBkb2N0b3Jlc1NlcnZpY2UgPSBpbmplY3QoRG9jdG9yU2VydmljZSk7XG4gIHByaXZhdGUgY2F0YWxvZ29TZXJ2aWNlID0gaW5qZWN0KENhdGFsb2dvU2VydmljZSk7XG4gIGRvY3RvcmVzOiBEb2N0b3JbXSA9IFtdO1xuICBlc3BlY2lhbGlkYWRlczogRXNwZWNpYWxpZGFkW10gPSBbXTtcbiAgYXNpZ25hZGFzOiBFc3BlY2lhbGlkYWRbXSA9IFtdO1xuICBwb3JRdWl0YXI6IEVzcGVjaWFsaWRhZCB8IG51bGwgPSBudWxsO1xuICBjYXJnYW5kb0FzaWduYWRhcyA9IGZhbHNlO1xuICBwcml2YXRlIGNhcmdhQXNpZ25hZGFzID0gMDtcbiAgZ2V0IGRpc3BvbmlibGVzKCkge1xuICAgIHJldHVybiB0aGlzLmVzcGVjaWFsaWRhZGVzLmZpbHRlcihcbiAgICAgIChlKSA9PlxuICAgICAgICBlLmVzdGFkbyA9PT0gXCJBQ1RJVk9cIiAmJlxuICAgICAgICAhdGhpcy5hc2lnbmFkYXMuc29tZSgoYSkgPT4gYS5pZEVzcGVjaWFsaWRhZCA9PT0gZS5pZEVzcGVjaWFsaWRhZCksXG4gICAgKTtcbiAgfVxuICBlcnJvciA9IFwiXCI7XG4gIGV4aXRvID0gXCJcIjtcbiAgcmVhZG9ubHkgZXNwZWNpYWxpZGFkRm9ybUdyb3VwID0gbmV3IEZvcm1Hcm91cCh7XG4gICAgaWREb2N0b3I6IG5ldyBGb3JtQ29udHJvbDxudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkPih1bmRlZmluZWQsIHtcbiAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgICAgdmFsaWRhdG9yczogW1ZhbGlkYXRvcnMucmVxdWlyZWRdLFxuICAgIH0pLFxuICAgIGlkRXNwZWNpYWxpZGFkOiBuZXcgRm9ybUNvbnRyb2w8bnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtWYWxpZGF0b3JzLnJlcXVpcmVkXSxcbiAgICB9KSxcbiAgfSk7XG4gIGdldCBlc3BlY2lhbGlkYWRGb3JtKCk6IERvY3RvclJlcXVlc3Qge1xuICAgIHJldHVybiB0aGlzLmVzcGVjaWFsaWRhZEZvcm1Hcm91cC5nZXRSYXdWYWx1ZSgpO1xuICB9XG4gIHNldCBlc3BlY2lhbGlkYWRGb3JtKHZhbHVlOiBEb2N0b3JSZXF1ZXN0KSB7XG4gICAgdGhpcy5lc3BlY2lhbGlkYWRGb3JtR3JvdXAucmVzZXQodmFsdWUpO1xuICB9XG4gIG5nT25Jbml0KCkge1xuICAgIHZvaWQgdGhpcy5jYXJnYXIoKTtcbiAgfVxuICBhc3luYyBjYXJnYXIoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIFt0aGlzLmRvY3RvcmVzLCB0aGlzLmVzcGVjaWFsaWRhZGVzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICBmaXJzdFZhbHVlRnJvbSh0aGlzLmRvY3RvcmVzU2VydmljZS5saXN0YXIoKSksXG4gICAgICAgICAgZmlyc3RWYWx1ZUZyb20odGhpcy5jYXRhbG9nb1NlcnZpY2UuZXNwZWNpYWxpZGFkZXMoKSksXG4gICAgICAgIF0pO1xuICAgICAgICBhd2FpdCB0aGlzLmNhcmdhckFzaWduYWRhcygpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLmVycm9yID0gZXJyb3JUZXh0KGUpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuICBhc3luYyBjYXJnYXJBc2lnbmFkYXMoKSB7XG4gICAgY29uc3QgY2FyZ2EgPSArK3RoaXMuY2FyZ2FBc2lnbmFkYXM7XG4gICAgY29uc3QgZG9jdG9yID0gdGhpcy5lc3BlY2lhbGlkYWRGb3JtLmlkRG9jdG9yO1xuICAgIHRoaXMucG9yUXVpdGFyID0gbnVsbDtcbiAgICB0aGlzLmFzaWduYWRhcyA9IFtdO1xuICAgIHRoaXMuZXNwZWNpYWxpZGFkRm9ybUdyb3VwLmNvbnRyb2xzLmlkRXNwZWNpYWxpZGFkLnJlc2V0KCk7XG4gICAgdGhpcy5jYXJnYW5kb0FzaWduYWRhcyA9ICEhZG9jdG9yO1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWRvY3RvcikgcmV0dXJuO1xuICAgICAgY29uc3QgYXNpZ25hZGFzID0gYXdhaXQgZmlyc3RWYWx1ZUZyb20oXG4gICAgICAgIHRoaXMuZG9jdG9yZXNTZXJ2aWNlLmVzcGVjaWFsaWRhZGVzKGRvY3RvciksXG4gICAgICApO1xuICAgICAgaWYgKFxuICAgICAgICBjYXJnYSA9PT0gdGhpcy5jYXJnYUFzaWduYWRhcyAmJlxuICAgICAgICBkb2N0b3IgPT09IHRoaXMuZXNwZWNpYWxpZGFkRm9ybS5pZERvY3RvclxuICAgICAgKVxuICAgICAgICB0aGlzLmFzaWduYWRhcyA9IGFzaWduYWRhcztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoY2FyZ2EgPT09IHRoaXMuY2FyZ2FBc2lnbmFkYXMpIHRoaXMuZXJyb3IgPSBlcnJvclRleHQoZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChjYXJnYSA9PT0gdGhpcy5jYXJnYUFzaWduYWRhcykgdGhpcy5jYXJnYW5kb0FzaWduYWRhcyA9IGZhbHNlO1xuICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbiAgY29uZmlybWFyUXVpdGFyKGVzcGVjaWFsaWRhZDogRXNwZWNpYWxpZGFkKSB7XG4gICAgaWYgKHRoaXMuZ3VhcmRhbmRvIHx8IHRoaXMuY2FyZ2FuZG9Bc2lnbmFkYXMpIHJldHVybjtcbiAgICB0aGlzLmVycm9yID0gXCJcIjtcbiAgICB0aGlzLmV4aXRvID0gXCJcIjtcbiAgICB0aGlzLnBvclF1aXRhciA9IGVzcGVjaWFsaWRhZDtcbiAgfVxuICBhc3luYyBxdWl0YXJFc3BlY2lhbGlkYWQoKSB7XG4gICAgY29uc3QgZG9jdG9yID0gdGhpcy5lc3BlY2lhbGlkYWRGb3JtLmlkRG9jdG9yO1xuICAgIGNvbnN0IGVzcGVjaWFsaWRhZCA9IHRoaXMucG9yUXVpdGFyO1xuICAgIGlmICghZG9jdG9yIHx8ICFlc3BlY2lhbGlkYWQgfHwgdGhpcy5ndWFyZGFuZG8pIHJldHVybjtcbiAgICB0aGlzLmd1YXJkYW5kbyA9IHRydWU7XG4gICAgdGhpcy5lcnJvciA9IFwiXCI7XG4gICAgdGhpcy5leGl0byA9IFwiXCI7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGZpcnN0VmFsdWVGcm9tKFxuICAgICAgICB0aGlzLmRvY3RvcmVzU2VydmljZS5xdWl0YXJFc3BlY2lhbGlkYWQoXG4gICAgICAgICAgZG9jdG9yLFxuICAgICAgICAgIGVzcGVjaWFsaWRhZC5pZEVzcGVjaWFsaWRhZCxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgICB0aGlzLmV4aXRvID0gXCJFc3BlY2lhbGlkYWQgcmV0aXJhZGEgZGVsIGRvY3RvclwiO1xuICAgICAgYXdhaXQgdGhpcy5jYXJnYXJBc2lnbmFkYXMoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLmVycm9yID0gZXJyb3JUZXh0KGUpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLnBvclF1aXRhciA9IG51bGw7XG4gICAgICB0aGlzLmd1YXJkYW5kbyA9IGZhbHNlO1xuICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbiAgYXN5bmMgcnVuKFxuICAgIGFjdGlvbjogRG9jdG9yQWNjaW9uLFxuICAgIGRhdGE6IERvY3RvclJlcXVlc3QsXG4gICAgbXNnID0gXCJPcGVyYWNpw7NuIHJlYWxpemFkYVwiLFxuICApIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5lcnJvciA9IFwiXCI7XG4gICAgICB0aGlzLmV4aXRvID0gXCJcIjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMuZG9jdG9yZXNTZXJ2aWNlLmVqZWN1dGFyKGFjdGlvbiwgZGF0YSkpO1xuICAgICAgICB0aGlzLmV4aXRvID0gbXNnO1xuICAgICAgICBhd2FpdCB0aGlzLmNhcmdhcigpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLmVycm9yID0gZXJyb3JUZXh0KGUpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuICBhc3luYyBhc2lnbmFyRXNwZWNpYWxpZGFkKCkge1xuICAgIGlmICh0aGlzLmd1YXJkYW5kbykgcmV0dXJuO1xuICAgIHRoaXMuZ3VhcmRhbmRvID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgaWYgKHRoaXMuZXNwZWNpYWxpZGFkRm9ybUdyb3VwLmludmFsaWQpIHtcbiAgICAgICAgdGhpcy5lc3BlY2lhbGlkYWRGb3JtR3JvdXAubWFya0FsbEFzVG91Y2hlZCgpO1xuICAgICAgICB0aGlzLmV4aXRvID0gXCJcIjtcbiAgICAgICAgdGhpcy5lcnJvciA9IFwiU2VsZWNjaW9uYSB1biBkb2N0b3IgeSB1bmEgZXNwZWNpYWxpZGFkLlwiO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLnJ1bihcbiAgICAgICAgXCJkb2N0b3ItZXNwZWNpYWxpZGFkXCIsXG4gICAgICAgIHRoaXMuZXNwZWNpYWxpZGFkRm9ybSxcbiAgICAgICAgXCJFc3BlY2lhbGlkYWQgYXNpZ25hZGFcIixcbiAgICAgICk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZ3VhcmRhbmRvID0gZmFsc2U7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxufVxuIl19
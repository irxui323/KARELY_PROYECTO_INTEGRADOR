var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { FormsModule } from "@angular/forms";
import { ListadoPaginado } from '../../../../core/utils/listado-paginado.mjs';
import { Paginador } from '../../../../shared/components/paginador/paginador.mjs';
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { errorText } from '../../../../core/utils/http-error.mjs';
import { fechaActual, fechaNoPasada } from '../../../../core/utils/fecha.mjs';
import { FeatureNav } from '../../../../shared/components/feature-nav/feature-nav.mjs';
import { SiPermiso } from '../../../../shared/directives/si-permiso.mjs';
import { ControlDisabled } from '../../../../shared/directives/control-disabled.mjs';
import { CatalogoService } from '../../../catalogos/services/catalogos-service.mjs';
import { DoctorService } from '../../services/doctores-service.mjs';
let DoctorHorarios = class DoctorHorarios {
    paginacion = new ListadoPaginado();
    buscar = "";
    changeDetector = inject(ChangeDetectorRef);
    guardando = false;
    get fechaMinima() {
        return fechaActual();
    }
    constructor() {
        this.horario = {};
    }
    doctoresService = inject(DoctorService);
    catalogoService = inject(CatalogoService);
    doctores = [];
    franjas = [];
    especialidades = [];
    cargandoEspecialidades = false;
    cargaEspecialidades = 0;
    async cargarEspecialidades() {
        const carga = ++this.cargaEspecialidades;
        const id = this.horario.idDoctor;
        this.horarioGroup.controls.idEspecialidad.reset(null);
        this.especialidades = [];
        this.cargandoEspecialidades = !!id;
        try {
            if (!id)
                return;
            const especialidades = await firstValueFrom(this.doctoresService.especialidades(id));
            if (carga === this.cargaEspecialidades)
                this.especialidades = especialidades.filter((e) => e.estado === "ACTIVO");
        }
        catch (e) {
            if (carga === this.cargaEspecialidades)
                this.error = errorText(e);
        }
        finally {
            if (carga === this.cargaEspecialidades)
                this.cargandoEspecialidades = false;
            this.changeDetector.markForCheck();
        }
    }
    async prepararClasificacion(h) {
        this.horario = {
            idDoctor: h.idDoctor,
            fecha: h.fechaTurno,
            idFranja: h.idFranja,
            idEspecialidad: null,
        };
        await this.cargarEspecialidades();
        this.exito =
            "Selecciona la especialidad y guarda para clasificar este horario pendiente.";
    }
    disponibilidades = [];
    error = "";
    exito = "";
    horarioGroup = new FormGroup({
        idEspecialidad: new FormControl(undefined, {
            validators: [Validators.required],
        }),
        idDoctor: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        fecha: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required, fechaNoPasada],
        }),
        idFranja: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });
    get horario() {
        return this.horarioGroup.getRawValue();
    }
    set horario(value) {
        this.horarioGroup.reset(value);
    }
    ngOnInit() {
        void this.cargar();
    }
    async cargar() {
        try {
            try {
                [this.doctores, this.franjas, this.disponibilidades] =
                    await Promise.all([
                        firstValueFrom(this.doctoresService.listar()),
                        firstValueFrom(this.catalogoService.franjas()),
                        this.paginacion.consultar(() => this.doctoresService.disponibilidadesPagina(this.paginacion.pagina, this.paginacion.tamanio, this.buscar)),
                    ]);
            }
            catch (e) {
                this.error = errorText(e);
            }
        }
        finally {
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
    async registrarHorario() {
        if (this.guardando || this.cargandoEspecialidades)
            return;
        this.guardando = true;
        try {
            this.horarioGroup.controls.fecha.updateValueAndValidity();
            if (this.horarioGroup.controls.fecha.hasError("fechaPasada")) {
                this.horarioGroup.controls.fecha.markAsTouched();
                this.exito = "";
                this.error = "La fecha del horario no puede ser anterior a hoy.";
                return;
            }
            if (this.horarioGroup.invalid) {
                this.horarioGroup.markAllAsTouched();
                this.exito = "";
                this.error =
                    "Selecciona el doctor, la especialidad, la fecha y la franja.";
                return;
            }
            await this.run("disponibilidad-registrar", this.horario, "Horario registrado");
        }
        finally {
            this.guardando = false;
            this.changeDetector.markForCheck();
        }
    }
    paginar(pagina, tamanio = this.paginacion.tamanio) {
        this.paginacion.pagina = pagina;
        this.paginacion.tamanio = tamanio;
        void this.cargar();
    }
};
DoctorHorarios = __decorate([
    Component({
        standalone: true,
        imports: [
            Paginador,
            FormsModule,
            ReactiveFormsModule,
            FeatureNav,
            SiPermiso,
            ControlDisabled,
        ],
        template: "<div class=\"k-module k-doctores\">\n  <header class=\"k-module-header\">\n    <div>\n      <span class=\"k-eyebrow\">GESTIÓN CLÍNICA / PERSONAL MÉDICO</span>\n      <h1 class=\"k-title\">Doctores</h1>\n      <p class=\"k-subtitle\">\n        Administra médicos, especialidades, documentos y disponibilidad de\n        atención.\n      </p>\n    </div>\n    <div class=\"k-header-actions\">\n      <button class=\"k-button k-button-secondary\" (click)=\"cargar()\">\n        ↻ Actualizar datos\n      </button>\n    </div>\n  </header>\n  <app-feature-nav feature=\"doctores\" />\n  @if(error){\n  <div class=\"k-error\" role=\"alert\">{{error}}</div>\n  }@if(exito){\n  <div class=\"k-success\" role=\"status\">{{exito}}</div>\n  }\n  <section class=\"k-panel\" *siPermiso=\"'HORARIOS_ESCRIBIR'\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>Disponibilidad médica</h2>\n        <p>Configura las fechas y turnos de atención para cada médico.</p>\n      </div>\n    </div>\n    <div class=\"k-form\">\n      <label class=\"k-field\"\n        >Doctor<select\n          [formControl]=\"horarioGroup.controls.idDoctor\"\n          [appControlDisabled]=\"guardando\"\n          (change)=\"cargarEspecialidades()\"\n        >\n          <option [ngValue]=\"null\">Selecciona un doctor</option>\n          @for(d of doctores;track d.idDoctor){\n          <option [ngValue]=\"d.idDoctor\">{{d.nombres}} {{d.apellidos}}</option>\n          }\n        </select></label\n      >\n      <label class=\"k-field\"\n        >Especialidad del turno<select\n          [formControl]=\"horarioGroup.controls.idEspecialidad\"\n          [appControlDisabled]=\"guardando || cargandoEspecialidades || !horario.idDoctor\"\n        >\n          <option [ngValue]=\"null\">\n            Selecciona una especialidad del doctor\n          </option>\n          @for(e of especialidades;track e.idEspecialidad){\n          <option [ngValue]=\"e.idEspecialidad\">{{e.nombre}}</option>\n          }\n        </select></label\n      >\n      <label class=\"k-field\"\n        >Fecha de atención<input\n          type=\"date\"\n          [min]=\"fechaMinima\"\n          [formControl]=\"horarioGroup.controls.fecha\"\n        />\n        @if(horarioGroup.controls.fecha.touched &&\n        horarioGroup.controls.fecha.hasError('fechaPasada')){\n        <small role=\"alert\">La fecha no puede ser anterior a hoy.</small>\n        }</label\n      >\n      <label class=\"k-field\"\n        >Franja horaria<select [formControl]=\"horarioGroup.controls.idFranja\">\n          <option [ngValue]=\"null\">Selecciona un turno</option>\n          @for(f of franjas;track f.idFranja){\n          <option [ngValue]=\"f.idFranja\">\n            {{f.horaInicio}} – {{f.horaFin}}\n          </option>\n          }\n        </select></label\n      >\n    </div>\n    <div class=\"k-actions\">\n      <button\n        *siPermiso=\"'HORARIOS_ESCRIBIR'\"\n        class=\"k-button\"\n        [disabled]=\"guardando || cargandoEspecialidades || (!horario.idDoctor || !horario.idEspecialidad || !horario.fecha || !horario.idFranja)\"\n        (click)=\"registrarHorario()\"\n      >\n        Registrar disponibilidad\n      </button>\n    </div>\n  </section>\n  <section class=\"k-panel\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>Horarios registrados</h2>\n        <p>Disponibilidades activas e históricas registradas.</p>\n      </div>\n    </div>\n    <div class=\"k-toolbar\">\n      <label class=\"k-search\"\n        ><span>Buscar horarios</span\n        ><input\n          type=\"search\"\n          [(ngModel)]=\"buscar\"\n          (ngModelChange)=\"paginar(0)\"\n          maxlength=\"150\"\n          placeholder=\"Doctor, especialidad o estado\"\n      /></label>\n    </div>\n    <div class=\"k-table-wrap\">\n      <table class=\"k-table\">\n        <thead>\n          <tr>\n            <th>Doctor</th>\n            <th>Especialidad</th>\n            <th>Fecha</th>\n            <th>Inicio</th>\n            <th>Fin</th>\n            <th>Estado</th>\n            <th>Acciones</th>\n          </tr>\n        </thead>\n        <tbody>\n          @for(h of disponibilidades;track h.idDisponibilidad){\n          <tr>\n            <td>{{h.nombreDoctor}}</td>\n            <td>{{h.nombreEspecialidad || 'Pendiente de asignar'}}</td>\n            <td>{{h.fechaTurno}}</td>\n            <td>{{h.horaInicio}}</td>\n            <td>{{h.horaFin}}</td>\n            <td><span class=\"k-status\">{{h.estado}}</span></td>\n            <td>\n              @if(!h.idEspecialidad && h.fechaTurno>=fechaMinima){<button\n                *siPermiso=\"'HORARIOS_ESCRIBIR'\"\n                type=\"button\"\n                class=\"k-button k-button-small k-button-secondary\"\n                [disabled]=\"guardando\"\n                (click)=\"prepararClasificacion(h)\"\n              >\n                Asignar especialidad</button\n              >}\n            </td>\n          </tr>\n          }@empty{\n          <tr>\n            <td colspan=\"7\" class=\"k-empty\">\n              No se encontraron horarios con los filtros actuales.\n            </td>\n          </tr>\n          }\n        </tbody>\n      </table>\n    </div>\n    <app-paginador\n      [pagina]=\"paginacion.pagina\"\n      [tamanio]=\"paginacion.tamanio\"\n      [totalElementos]=\"paginacion.totalElementos\"\n      [totalPaginas]=\"paginacion.totalPaginas\"\n      [cargando]=\"paginacion.cargando\"\n      (cambioPagina)=\"paginar($event)\"\n      (cambioTamanio)=\"paginar(0,$event)\"\n    />\n  </section>\n</div>\n",
        styles: [],
    })
], DoctorHorarios);
export { DoctorHorarios };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdG9yLWhvcmFyaW9zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vQzovVU5JVkVSU0lEQUQvTFAyL1NFTUFOQTExL2thcmVseV9tb2Rlcm5vL2Zyb250ZW5kL3NyYy9hcHAvZmVhdHVyZXMvZG9jdG9yZXMvcGFnZXMvZG9jdG9yLWhvcmFyaW9zLyIsInNvdXJjZXMiOlsiZG9jdG9yLWhvcmFyaW9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDMUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1EQUFtRCxDQUFDO0FBQzlFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQzdFLE9BQU8sRUFDTCxXQUFXLEVBQ1gsU0FBUyxFQUNULG1CQUFtQixFQUNuQixVQUFVLEdBQ1gsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUM5RCxPQUFPLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUNuRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFLckUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQU9oRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFlekQsSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBYztJQUNoQixVQUFVLEdBQUcsSUFBSSxl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QixTQUFTLENBQUM7UUFDVCxVQUFVLEVBQUUsSUFBSTtRQUNoQixPQUFPLEVBQUU7WUFDUCxTQUFTO1lBQ1QsV0FBVztZQUNYLG1CQUFtQjtZQUNuQixVQUFVO1lBQ1YsU0FBUztZQUNULGVBQWU7U0FDaEI7UUFDRCxRQUFRLEVBQUMsdzlLQUF3OUs7UUFDaitLLE1BQU0sRUFBQyxFQUFFO0tBQ1YsQ0FBQztHQUNXLGNBQWMsQ0E2SjFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRm9ybXNNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvZm9ybXNcIjtcbmltcG9ydCB7IExpc3RhZG9QYWdpbmFkbyB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb3JlL3V0aWxzL2xpc3RhZG8tcGFnaW5hZG9cIjtcbmltcG9ydCB7IFBhZ2luYWRvciB9IGZyb20gXCIuLi8uLi8uLi8uLi9zaGFyZWQvY29tcG9uZW50cy9wYWdpbmFkb3IvcGFnaW5hZG9yXCI7XG5pbXBvcnQgeyBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBpbmplY3QsIE9uSW5pdCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge1xuICBGb3JtQ29udHJvbCxcbiAgRm9ybUdyb3VwLFxuICBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxuICBWYWxpZGF0b3JzLFxufSBmcm9tIFwiQGFuZ3VsYXIvZm9ybXNcIjtcbmltcG9ydCB7IGZpcnN0VmFsdWVGcm9tIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGVycm9yVGV4dCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb3JlL3V0aWxzL2h0dHAtZXJyb3JcIjtcbmltcG9ydCB7IGZlY2hhQWN0dWFsLCBmZWNoYU5vUGFzYWRhIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvcmUvdXRpbHMvZmVjaGFcIjtcbmltcG9ydCB7IEZlYXR1cmVOYXYgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2NvbXBvbmVudHMvZmVhdHVyZS1uYXYvZmVhdHVyZS1uYXZcIjtcbmltcG9ydCB7IFNpUGVybWlzbyB9IGZyb20gXCIuLi8uLi8uLi8uLi9zaGFyZWQvZGlyZWN0aXZlcy9zaS1wZXJtaXNvXCI7XG5pbXBvcnQge1xuICBGcmFuamEsXG4gIEVzcGVjaWFsaWRhZCxcbn0gZnJvbSBcIi4uLy4uLy4uL2NhdGFsb2dvcy9tb2RlbHMvY2F0YWxvZ29zLm1vZGVsXCI7XG5pbXBvcnQgeyBDb250cm9sRGlzYWJsZWQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2RpcmVjdGl2ZXMvY29udHJvbC1kaXNhYmxlZFwiO1xuaW1wb3J0IHsgQ2F0YWxvZ29TZXJ2aWNlIH0gZnJvbSBcIi4uLy4uLy4uL2NhdGFsb2dvcy9zZXJ2aWNlcy9jYXRhbG9nb3Mtc2VydmljZVwiO1xuaW1wb3J0IHtcbiAgRGlzcG9uaWJpbGlkYWQsXG4gIERvY3RvcixcbiAgRG9jdG9yQWNjaW9uLFxuICBEb2N0b3JSZXF1ZXN0LFxufSBmcm9tIFwiLi4vLi4vbW9kZWxzL2RvY3RvcmVzLm1vZGVsXCI7XG5pbXBvcnQgeyBEb2N0b3JTZXJ2aWNlIH0gZnJvbSBcIi4uLy4uL3NlcnZpY2VzL2RvY3RvcmVzLXNlcnZpY2VcIjtcblxuQENvbXBvbmVudCh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtcbiAgICBQYWdpbmFkb3IsXG4gICAgRm9ybXNNb2R1bGUsXG4gICAgUmVhY3RpdmVGb3Jtc01vZHVsZSxcbiAgICBGZWF0dXJlTmF2LFxuICAgIFNpUGVybWlzbyxcbiAgICBDb250cm9sRGlzYWJsZWQsXG4gIF0sXG4gIHRlbXBsYXRlOlwiPGRpdiBjbGFzcz1cXFwiay1tb2R1bGUgay1kb2N0b3Jlc1xcXCI+XFxuICA8aGVhZGVyIGNsYXNzPVxcXCJrLW1vZHVsZS1oZWFkZXJcXFwiPlxcbiAgICA8ZGl2PlxcbiAgICAgIDxzcGFuIGNsYXNzPVxcXCJrLWV5ZWJyb3dcXFwiPkdFU1RJw5NOIENMw41OSUNBIC8gUEVSU09OQUwgTcOJRElDTzwvc3Bhbj5cXG4gICAgICA8aDEgY2xhc3M9XFxcImstdGl0bGVcXFwiPkRvY3RvcmVzPC9oMT5cXG4gICAgICA8cCBjbGFzcz1cXFwiay1zdWJ0aXRsZVxcXCI+XFxuICAgICAgICBBZG1pbmlzdHJhIG3DqWRpY29zLCBlc3BlY2lhbGlkYWRlcywgZG9jdW1lbnRvcyB5IGRpc3BvbmliaWxpZGFkIGRlXFxuICAgICAgICBhdGVuY2nDs24uXFxuICAgICAgPC9wPlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1oZWFkZXItYWN0aW9uc1xcXCI+XFxuICAgICAgPGJ1dHRvbiBjbGFzcz1cXFwiay1idXR0b24gay1idXR0b24tc2Vjb25kYXJ5XFxcIiAoY2xpY2spPVxcXCJjYXJnYXIoKVxcXCI+XFxuICAgICAgICDihrsgQWN0dWFsaXphciBkYXRvc1xcbiAgICAgIDwvYnV0dG9uPlxcbiAgICA8L2Rpdj5cXG4gIDwvaGVhZGVyPlxcbiAgPGFwcC1mZWF0dXJlLW5hdiBmZWF0dXJlPVxcXCJkb2N0b3Jlc1xcXCIgLz5cXG4gIEBpZihlcnJvcil7XFxuICA8ZGl2IGNsYXNzPVxcXCJrLWVycm9yXFxcIiByb2xlPVxcXCJhbGVydFxcXCI+e3tlcnJvcn19PC9kaXY+XFxuICB9QGlmKGV4aXRvKXtcXG4gIDxkaXYgY2xhc3M9XFxcImstc3VjY2Vzc1xcXCIgcm9sZT1cXFwic3RhdHVzXFxcIj57e2V4aXRvfX08L2Rpdj5cXG4gIH1cXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJrLXBhbmVsXFxcIiAqc2lQZXJtaXNvPVxcXCInSE9SQVJJT1NfRVNDUklCSVInXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1zZWN0aW9uLWhlYWRpbmdcXFwiPlxcbiAgICAgIDxkaXY+XFxuICAgICAgICA8aDI+RGlzcG9uaWJpbGlkYWQgbcOpZGljYTwvaDI+XFxuICAgICAgICA8cD5Db25maWd1cmEgbGFzIGZlY2hhcyB5IHR1cm5vcyBkZSBhdGVuY2nDs24gcGFyYSBjYWRhIG3DqWRpY28uPC9wPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1mb3JtXFxcIj5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+RG9jdG9yPHNlbGVjdFxcbiAgICAgICAgICBbZm9ybUNvbnRyb2xdPVxcXCJob3JhcmlvR3JvdXAuY29udHJvbHMuaWREb2N0b3JcXFwiXFxuICAgICAgICAgIFthcHBDb250cm9sRGlzYWJsZWRdPVxcXCJndWFyZGFuZG9cXFwiXFxuICAgICAgICAgIChjaGFuZ2UpPVxcXCJjYXJnYXJFc3BlY2lhbGlkYWRlcygpXFxcIlxcbiAgICAgICAgPlxcbiAgICAgICAgICA8b3B0aW9uIFtuZ1ZhbHVlXT1cXFwibnVsbFxcXCI+U2VsZWNjaW9uYSB1biBkb2N0b3I8L29wdGlvbj5cXG4gICAgICAgICAgQGZvcihkIG9mIGRvY3RvcmVzO3RyYWNrIGQuaWREb2N0b3Ipe1xcbiAgICAgICAgICA8b3B0aW9uIFtuZ1ZhbHVlXT1cXFwiZC5pZERvY3RvclxcXCI+e3tkLm5vbWJyZXN9fSB7e2QuYXBlbGxpZG9zfX08L29wdGlvbj5cXG4gICAgICAgICAgfVxcbiAgICAgICAgPC9zZWxlY3Q+PC9sYWJlbFxcbiAgICAgID5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+RXNwZWNpYWxpZGFkIGRlbCB0dXJubzxzZWxlY3RcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwiaG9yYXJpb0dyb3VwLmNvbnRyb2xzLmlkRXNwZWNpYWxpZGFkXFxcIlxcbiAgICAgICAgICBbYXBwQ29udHJvbERpc2FibGVkXT1cXFwiZ3VhcmRhbmRvIHx8IGNhcmdhbmRvRXNwZWNpYWxpZGFkZXMgfHwgIWhvcmFyaW8uaWREb2N0b3JcXFwiXFxuICAgICAgICA+XFxuICAgICAgICAgIDxvcHRpb24gW25nVmFsdWVdPVxcXCJudWxsXFxcIj5cXG4gICAgICAgICAgICBTZWxlY2Npb25hIHVuYSBlc3BlY2lhbGlkYWQgZGVsIGRvY3RvclxcbiAgICAgICAgICA8L29wdGlvbj5cXG4gICAgICAgICAgQGZvcihlIG9mIGVzcGVjaWFsaWRhZGVzO3RyYWNrIGUuaWRFc3BlY2lhbGlkYWQpe1xcbiAgICAgICAgICA8b3B0aW9uIFtuZ1ZhbHVlXT1cXFwiZS5pZEVzcGVjaWFsaWRhZFxcXCI+e3tlLm5vbWJyZX19PC9vcHRpb24+XFxuICAgICAgICAgIH1cXG4gICAgICAgIDwvc2VsZWN0PjwvbGFiZWxcXG4gICAgICA+XFxuICAgICAgPGxhYmVsIGNsYXNzPVxcXCJrLWZpZWxkXFxcIlxcbiAgICAgICAgPkZlY2hhIGRlIGF0ZW5jacOzbjxpbnB1dFxcbiAgICAgICAgICB0eXBlPVxcXCJkYXRlXFxcIlxcbiAgICAgICAgICBbbWluXT1cXFwiZmVjaGFNaW5pbWFcXFwiXFxuICAgICAgICAgIFtmb3JtQ29udHJvbF09XFxcImhvcmFyaW9Hcm91cC5jb250cm9scy5mZWNoYVxcXCJcXG4gICAgICAgIC8+XFxuICAgICAgICBAaWYoaG9yYXJpb0dyb3VwLmNvbnRyb2xzLmZlY2hhLnRvdWNoZWQgJiZcXG4gICAgICAgIGhvcmFyaW9Hcm91cC5jb250cm9scy5mZWNoYS5oYXNFcnJvcignZmVjaGFQYXNhZGEnKSl7XFxuICAgICAgICA8c21hbGwgcm9sZT1cXFwiYWxlcnRcXFwiPkxhIGZlY2hhIG5vIHB1ZWRlIHNlciBhbnRlcmlvciBhIGhveS48L3NtYWxsPlxcbiAgICAgICAgfTwvbGFiZWxcXG4gICAgICA+XFxuICAgICAgPGxhYmVsIGNsYXNzPVxcXCJrLWZpZWxkXFxcIlxcbiAgICAgICAgPkZyYW5qYSBob3JhcmlhPHNlbGVjdCBbZm9ybUNvbnRyb2xdPVxcXCJob3JhcmlvR3JvdXAuY29udHJvbHMuaWRGcmFuamFcXFwiPlxcbiAgICAgICAgICA8b3B0aW9uIFtuZ1ZhbHVlXT1cXFwibnVsbFxcXCI+U2VsZWNjaW9uYSB1biB0dXJubzwvb3B0aW9uPlxcbiAgICAgICAgICBAZm9yKGYgb2YgZnJhbmphczt0cmFjayBmLmlkRnJhbmphKXtcXG4gICAgICAgICAgPG9wdGlvbiBbbmdWYWx1ZV09XFxcImYuaWRGcmFuamFcXFwiPlxcbiAgICAgICAgICAgIHt7Zi5ob3JhSW5pY2lvfX0g4oCTIHt7Zi5ob3JhRmlufX1cXG4gICAgICAgICAgPC9vcHRpb24+XFxuICAgICAgICAgIH1cXG4gICAgICAgIDwvc2VsZWN0PjwvbGFiZWxcXG4gICAgICA+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLWFjdGlvbnNcXFwiPlxcbiAgICAgIDxidXR0b25cXG4gICAgICAgICpzaVBlcm1pc289XFxcIidIT1JBUklPU19FU0NSSUJJUidcXFwiXFxuICAgICAgICBjbGFzcz1cXFwiay1idXR0b25cXFwiXFxuICAgICAgICBbZGlzYWJsZWRdPVxcXCJndWFyZGFuZG8gfHwgY2FyZ2FuZG9Fc3BlY2lhbGlkYWRlcyB8fCAoIWhvcmFyaW8uaWREb2N0b3IgfHwgIWhvcmFyaW8uaWRFc3BlY2lhbGlkYWQgfHwgIWhvcmFyaW8uZmVjaGEgfHwgIWhvcmFyaW8uaWRGcmFuamEpXFxcIlxcbiAgICAgICAgKGNsaWNrKT1cXFwicmVnaXN0cmFySG9yYXJpbygpXFxcIlxcbiAgICAgID5cXG4gICAgICAgIFJlZ2lzdHJhciBkaXNwb25pYmlsaWRhZFxcbiAgICAgIDwvYnV0dG9uPlxcbiAgICA8L2Rpdj5cXG4gIDwvc2VjdGlvbj5cXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJrLXBhbmVsXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1zZWN0aW9uLWhlYWRpbmdcXFwiPlxcbiAgICAgIDxkaXY+XFxuICAgICAgICA8aDI+SG9yYXJpb3MgcmVnaXN0cmFkb3M8L2gyPlxcbiAgICAgICAgPHA+RGlzcG9uaWJpbGlkYWRlcyBhY3RpdmFzIGUgaGlzdMOzcmljYXMgcmVnaXN0cmFkYXMuPC9wPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay10b29sYmFyXFxcIj5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstc2VhcmNoXFxcIlxcbiAgICAgICAgPjxzcGFuPkJ1c2NhciBob3Jhcmlvczwvc3BhblxcbiAgICAgICAgPjxpbnB1dFxcbiAgICAgICAgICB0eXBlPVxcXCJzZWFyY2hcXFwiXFxuICAgICAgICAgIFsobmdNb2RlbCldPVxcXCJidXNjYXJcXFwiXFxuICAgICAgICAgIChuZ01vZGVsQ2hhbmdlKT1cXFwicGFnaW5hcigwKVxcXCJcXG4gICAgICAgICAgbWF4bGVuZ3RoPVxcXCIxNTBcXFwiXFxuICAgICAgICAgIHBsYWNlaG9sZGVyPVxcXCJEb2N0b3IsIGVzcGVjaWFsaWRhZCBvIGVzdGFkb1xcXCJcXG4gICAgICAvPjwvbGFiZWw+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLXRhYmxlLXdyYXBcXFwiPlxcbiAgICAgIDx0YWJsZSBjbGFzcz1cXFwiay10YWJsZVxcXCI+XFxuICAgICAgICA8dGhlYWQ+XFxuICAgICAgICAgIDx0cj5cXG4gICAgICAgICAgICA8dGg+RG9jdG9yPC90aD5cXG4gICAgICAgICAgICA8dGg+RXNwZWNpYWxpZGFkPC90aD5cXG4gICAgICAgICAgICA8dGg+RmVjaGE8L3RoPlxcbiAgICAgICAgICAgIDx0aD5JbmljaW88L3RoPlxcbiAgICAgICAgICAgIDx0aD5GaW48L3RoPlxcbiAgICAgICAgICAgIDx0aD5Fc3RhZG88L3RoPlxcbiAgICAgICAgICAgIDx0aD5BY2Npb25lczwvdGg+XFxuICAgICAgICAgIDwvdHI+XFxuICAgICAgICA8L3RoZWFkPlxcbiAgICAgICAgPHRib2R5PlxcbiAgICAgICAgICBAZm9yKGggb2YgZGlzcG9uaWJpbGlkYWRlczt0cmFjayBoLmlkRGlzcG9uaWJpbGlkYWQpe1xcbiAgICAgICAgICA8dHI+XFxuICAgICAgICAgICAgPHRkPnt7aC5ub21icmVEb2N0b3J9fTwvdGQ+XFxuICAgICAgICAgICAgPHRkPnt7aC5ub21icmVFc3BlY2lhbGlkYWQgfHwgJ1BlbmRpZW50ZSBkZSBhc2lnbmFyJ319PC90ZD5cXG4gICAgICAgICAgICA8dGQ+e3toLmZlY2hhVHVybm99fTwvdGQ+XFxuICAgICAgICAgICAgPHRkPnt7aC5ob3JhSW5pY2lvfX08L3RkPlxcbiAgICAgICAgICAgIDx0ZD57e2guaG9yYUZpbn19PC90ZD5cXG4gICAgICAgICAgICA8dGQ+PHNwYW4gY2xhc3M9XFxcImstc3RhdHVzXFxcIj57e2guZXN0YWRvfX08L3NwYW4+PC90ZD5cXG4gICAgICAgICAgICA8dGQ+XFxuICAgICAgICAgICAgICBAaWYoIWguaWRFc3BlY2lhbGlkYWQgJiYgaC5mZWNoYVR1cm5vPj1mZWNoYU1pbmltYSl7PGJ1dHRvblxcbiAgICAgICAgICAgICAgICAqc2lQZXJtaXNvPVxcXCInSE9SQVJJT1NfRVNDUklCSVInXFxcIlxcbiAgICAgICAgICAgICAgICB0eXBlPVxcXCJidXR0b25cXFwiXFxuICAgICAgICAgICAgICAgIGNsYXNzPVxcXCJrLWJ1dHRvbiBrLWJ1dHRvbi1zbWFsbCBrLWJ1dHRvbi1zZWNvbmRhcnlcXFwiXFxuICAgICAgICAgICAgICAgIFtkaXNhYmxlZF09XFxcImd1YXJkYW5kb1xcXCJcXG4gICAgICAgICAgICAgICAgKGNsaWNrKT1cXFwicHJlcGFyYXJDbGFzaWZpY2FjaW9uKGgpXFxcIlxcbiAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICBBc2lnbmFyIGVzcGVjaWFsaWRhZDwvYnV0dG9uXFxuICAgICAgICAgICAgICA+fVxcbiAgICAgICAgICAgIDwvdGQ+XFxuICAgICAgICAgIDwvdHI+XFxuICAgICAgICAgIH1AZW1wdHl7XFxuICAgICAgICAgIDx0cj5cXG4gICAgICAgICAgICA8dGQgY29sc3Bhbj1cXFwiN1xcXCIgY2xhc3M9XFxcImstZW1wdHlcXFwiPlxcbiAgICAgICAgICAgICAgTm8gc2UgZW5jb250cmFyb24gaG9yYXJpb3MgY29uIGxvcyBmaWx0cm9zIGFjdHVhbGVzLlxcbiAgICAgICAgICAgIDwvdGQ+XFxuICAgICAgICAgIDwvdHI+XFxuICAgICAgICAgIH1cXG4gICAgICAgIDwvdGJvZHk+XFxuICAgICAgPC90YWJsZT5cXG4gICAgPC9kaXY+XFxuICAgIDxhcHAtcGFnaW5hZG9yXFxuICAgICAgW3BhZ2luYV09XFxcInBhZ2luYWNpb24ucGFnaW5hXFxcIlxcbiAgICAgIFt0YW1hbmlvXT1cXFwicGFnaW5hY2lvbi50YW1hbmlvXFxcIlxcbiAgICAgIFt0b3RhbEVsZW1lbnRvc109XFxcInBhZ2luYWNpb24udG90YWxFbGVtZW50b3NcXFwiXFxuICAgICAgW3RvdGFsUGFnaW5hc109XFxcInBhZ2luYWNpb24udG90YWxQYWdpbmFzXFxcIlxcbiAgICAgIFtjYXJnYW5kb109XFxcInBhZ2luYWNpb24uY2FyZ2FuZG9cXFwiXFxuICAgICAgKGNhbWJpb1BhZ2luYSk9XFxcInBhZ2luYXIoJGV2ZW50KVxcXCJcXG4gICAgICAoY2FtYmlvVGFtYW5pbyk9XFxcInBhZ2luYXIoMCwkZXZlbnQpXFxcIlxcbiAgICAvPlxcbiAgPC9zZWN0aW9uPlxcbjwvZGl2PlxcblwiLFxuICBzdHlsZXM6W10sXG59KVxuZXhwb3J0IGNsYXNzIERvY3RvckhvcmFyaW9zIGltcGxlbWVudHMgT25Jbml0IHtcbiAgcmVhZG9ubHkgcGFnaW5hY2lvbiA9IG5ldyBMaXN0YWRvUGFnaW5hZG88RGlzcG9uaWJpbGlkYWQ+KCk7XG4gIGJ1c2NhciA9IFwiXCI7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBjaGFuZ2VEZXRlY3RvciA9IGluamVjdChDaGFuZ2VEZXRlY3RvclJlZik7XG4gIGd1YXJkYW5kbyA9IGZhbHNlO1xuICBnZXQgZmVjaGFNaW5pbWEoKSB7XG4gICAgcmV0dXJuIGZlY2hhQWN0dWFsKCk7XG4gIH1cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5ob3JhcmlvID0ge307XG4gIH1cbiAgcHJpdmF0ZSBkb2N0b3Jlc1NlcnZpY2UgPSBpbmplY3QoRG9jdG9yU2VydmljZSk7XG4gIHByaXZhdGUgY2F0YWxvZ29TZXJ2aWNlID0gaW5qZWN0KENhdGFsb2dvU2VydmljZSk7XG4gIGRvY3RvcmVzOiBEb2N0b3JbXSA9IFtdO1xuICBmcmFuamFzOiBGcmFuamFbXSA9IFtdO1xuICBlc3BlY2lhbGlkYWRlczogRXNwZWNpYWxpZGFkW10gPSBbXTtcbiAgY2FyZ2FuZG9Fc3BlY2lhbGlkYWRlcyA9IGZhbHNlO1xuICBwcml2YXRlIGNhcmdhRXNwZWNpYWxpZGFkZXMgPSAwO1xuICBhc3luYyBjYXJnYXJFc3BlY2lhbGlkYWRlcygpIHtcbiAgICBjb25zdCBjYXJnYSA9ICsrdGhpcy5jYXJnYUVzcGVjaWFsaWRhZGVzO1xuICAgIGNvbnN0IGlkID0gdGhpcy5ob3JhcmlvLmlkRG9jdG9yO1xuICAgIHRoaXMuaG9yYXJpb0dyb3VwLmNvbnRyb2xzLmlkRXNwZWNpYWxpZGFkLnJlc2V0KG51bGwpO1xuICAgIHRoaXMuZXNwZWNpYWxpZGFkZXMgPSBbXTtcbiAgICB0aGlzLmNhcmdhbmRvRXNwZWNpYWxpZGFkZXMgPSAhIWlkO1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWlkKSByZXR1cm47XG4gICAgICBjb25zdCBlc3BlY2lhbGlkYWRlcyA9IGF3YWl0IGZpcnN0VmFsdWVGcm9tKFxuICAgICAgICB0aGlzLmRvY3RvcmVzU2VydmljZS5lc3BlY2lhbGlkYWRlcyhpZCksXG4gICAgICApO1xuICAgICAgaWYgKGNhcmdhID09PSB0aGlzLmNhcmdhRXNwZWNpYWxpZGFkZXMpXG4gICAgICAgIHRoaXMuZXNwZWNpYWxpZGFkZXMgPSBlc3BlY2lhbGlkYWRlcy5maWx0ZXIoXG4gICAgICAgICAgKGUpID0+IGUuZXN0YWRvID09PSBcIkFDVElWT1wiLFxuICAgICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChjYXJnYSA9PT0gdGhpcy5jYXJnYUVzcGVjaWFsaWRhZGVzKSB0aGlzLmVycm9yID0gZXJyb3JUZXh0KGUpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoY2FyZ2EgPT09IHRoaXMuY2FyZ2FFc3BlY2lhbGlkYWRlcylcbiAgICAgICAgdGhpcy5jYXJnYW5kb0VzcGVjaWFsaWRhZGVzID0gZmFsc2U7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuICBhc3luYyBwcmVwYXJhckNsYXNpZmljYWNpb24oaDogRGlzcG9uaWJpbGlkYWQpIHtcbiAgICB0aGlzLmhvcmFyaW8gPSB7XG4gICAgICBpZERvY3RvcjogaC5pZERvY3RvcixcbiAgICAgIGZlY2hhOiBoLmZlY2hhVHVybm8sXG4gICAgICBpZEZyYW5qYTogaC5pZEZyYW5qYSxcbiAgICAgIGlkRXNwZWNpYWxpZGFkOiBudWxsLFxuICAgIH07XG4gICAgYXdhaXQgdGhpcy5jYXJnYXJFc3BlY2lhbGlkYWRlcygpO1xuICAgIHRoaXMuZXhpdG8gPVxuICAgICAgXCJTZWxlY2Npb25hIGxhIGVzcGVjaWFsaWRhZCB5IGd1YXJkYSBwYXJhIGNsYXNpZmljYXIgZXN0ZSBob3JhcmlvIHBlbmRpZW50ZS5cIjtcbiAgfVxuICBkaXNwb25pYmlsaWRhZGVzOiBEaXNwb25pYmlsaWRhZFtdID0gW107XG4gIGVycm9yID0gXCJcIjtcbiAgZXhpdG8gPSBcIlwiO1xuICByZWFkb25seSBob3JhcmlvR3JvdXAgPSBuZXcgRm9ybUdyb3VwKHtcbiAgICBpZEVzcGVjaWFsaWRhZDogbmV3IEZvcm1Db250cm9sPG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQ+KHVuZGVmaW5lZCwge1xuICAgICAgdmFsaWRhdG9yczogW1ZhbGlkYXRvcnMucmVxdWlyZWRdLFxuICAgIH0pLFxuICAgIGlkRG9jdG9yOiBuZXcgRm9ybUNvbnRyb2w8bnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtWYWxpZGF0b3JzLnJlcXVpcmVkXSxcbiAgICB9KSxcbiAgICBmZWNoYTogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbVmFsaWRhdG9ycy5yZXF1aXJlZCwgZmVjaGFOb1Bhc2FkYV0sXG4gICAgfSksXG4gICAgaWRGcmFuamE6IG5ldyBGb3JtQ29udHJvbDxudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkPih1bmRlZmluZWQsIHtcbiAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgICAgdmFsaWRhdG9yczogW1ZhbGlkYXRvcnMucmVxdWlyZWRdLFxuICAgIH0pLFxuICB9KTtcbiAgZ2V0IGhvcmFyaW8oKTogRG9jdG9yUmVxdWVzdCB7XG4gICAgcmV0dXJuIHRoaXMuaG9yYXJpb0dyb3VwLmdldFJhd1ZhbHVlKCk7XG4gIH1cbiAgc2V0IGhvcmFyaW8odmFsdWU6IERvY3RvclJlcXVlc3QpIHtcbiAgICB0aGlzLmhvcmFyaW9Hcm91cC5yZXNldCh2YWx1ZSk7XG4gIH1cbiAgbmdPbkluaXQoKSB7XG4gICAgdm9pZCB0aGlzLmNhcmdhcigpO1xuICB9XG4gIGFzeW5jIGNhcmdhcigpIHtcbiAgICB0cnkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgW3RoaXMuZG9jdG9yZXMsIHRoaXMuZnJhbmphcywgdGhpcy5kaXNwb25pYmlsaWRhZGVzXSA9XG4gICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgZmlyc3RWYWx1ZUZyb20odGhpcy5kb2N0b3Jlc1NlcnZpY2UubGlzdGFyKCkpLFxuICAgICAgICAgICAgZmlyc3RWYWx1ZUZyb20odGhpcy5jYXRhbG9nb1NlcnZpY2UuZnJhbmphcygpKSxcbiAgICAgICAgICAgIHRoaXMucGFnaW5hY2lvbi5jb25zdWx0YXIoKCkgPT5cbiAgICAgICAgICAgICAgdGhpcy5kb2N0b3Jlc1NlcnZpY2UuZGlzcG9uaWJpbGlkYWRlc1BhZ2luYShcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYWNpb24ucGFnaW5hLFxuICAgICAgICAgICAgICAgIHRoaXMucGFnaW5hY2lvbi50YW1hbmlvLFxuICAgICAgICAgICAgICAgIHRoaXMuYnVzY2FyLFxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICBdKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbiAgYXN5bmMgcnVuKFxuICAgIGFjdGlvbjogRG9jdG9yQWNjaW9uLFxuICAgIGRhdGE6IERvY3RvclJlcXVlc3QsXG4gICAgbXNnID0gXCJPcGVyYWNpw7NuIHJlYWxpemFkYVwiLFxuICApIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5lcnJvciA9IFwiXCI7XG4gICAgICB0aGlzLmV4aXRvID0gXCJcIjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMuZG9jdG9yZXNTZXJ2aWNlLmVqZWN1dGFyKGFjdGlvbiwgZGF0YSkpO1xuICAgICAgICB0aGlzLmV4aXRvID0gbXNnO1xuICAgICAgICBhd2FpdCB0aGlzLmNhcmdhcigpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLmVycm9yID0gZXJyb3JUZXh0KGUpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuICBhc3luYyByZWdpc3RyYXJIb3JhcmlvKCkge1xuICAgIGlmICh0aGlzLmd1YXJkYW5kbyB8fCB0aGlzLmNhcmdhbmRvRXNwZWNpYWxpZGFkZXMpIHJldHVybjtcbiAgICB0aGlzLmd1YXJkYW5kbyA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuaG9yYXJpb0dyb3VwLmNvbnRyb2xzLmZlY2hhLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKTtcbiAgICAgIGlmICh0aGlzLmhvcmFyaW9Hcm91cC5jb250cm9scy5mZWNoYS5oYXNFcnJvcihcImZlY2hhUGFzYWRhXCIpKSB7XG4gICAgICAgIHRoaXMuaG9yYXJpb0dyb3VwLmNvbnRyb2xzLmZlY2hhLm1hcmtBc1RvdWNoZWQoKTtcbiAgICAgICAgdGhpcy5leGl0byA9IFwiXCI7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBcIkxhIGZlY2hhIGRlbCBob3JhcmlvIG5vIHB1ZWRlIHNlciBhbnRlcmlvciBhIGhveS5cIjtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuaG9yYXJpb0dyb3VwLmludmFsaWQpIHtcbiAgICAgICAgdGhpcy5ob3JhcmlvR3JvdXAubWFya0FsbEFzVG91Y2hlZCgpO1xuICAgICAgICB0aGlzLmV4aXRvID0gXCJcIjtcbiAgICAgICAgdGhpcy5lcnJvciA9XG4gICAgICAgICAgXCJTZWxlY2Npb25hIGVsIGRvY3RvciwgbGEgZXNwZWNpYWxpZGFkLCBsYSBmZWNoYSB5IGxhIGZyYW5qYS5cIjtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5ydW4oXG4gICAgICAgIFwiZGlzcG9uaWJpbGlkYWQtcmVnaXN0cmFyXCIsXG4gICAgICAgIHRoaXMuaG9yYXJpbyxcbiAgICAgICAgXCJIb3JhcmlvIHJlZ2lzdHJhZG9cIixcbiAgICAgICk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZ3VhcmRhbmRvID0gZmFsc2U7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIHBhZ2luYXIocGFnaW5hOiBudW1iZXIsIHRhbWFuaW8gPSB0aGlzLnBhZ2luYWNpb24udGFtYW5pbykge1xuICAgIHRoaXMucGFnaW5hY2lvbi5wYWdpbmEgPSBwYWdpbmE7XG4gICAgdGhpcy5wYWdpbmFjaW9uLnRhbWFuaW8gPSB0YW1hbmlvO1xuICAgIHZvaWQgdGhpcy5jYXJnYXIoKTtcbiAgfVxufVxuIl19
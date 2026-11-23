var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { fechaActual, fechaNoPasada } from '../../../../core/utils/fecha.mjs';
import { CalendarioDisponibilidad } from '../../../../shared/components/calendario-disponibilidad/calendario-disponibilidad.mjs';
import { ControlDisabled } from '../../../../shared/directives/control-disabled.mjs';
import { errorText } from '../../../../core/utils/http-error.mjs';
import { FeatureNav } from '../../../../shared/components/feature-nav/feature-nav.mjs';
import { ModuleHeader } from '../../../../shared/components/module-header/module-header.mjs';
import { CatalogoService } from '../../../catalogos/services/catalogos-service.mjs';
import { CitaService } from '../../services/citas-service.mjs';
let CitaReprogramacion = class CitaReprogramacion {
    changeDetector = inject(ChangeDetectorRef);
    guardando = false;
    router = inject(Router);
    route = inject(ActivatedRoute, { optional: true });
    constructor() {
        this.repro = { aceptacionPaciente: "N" };
    }
    citasService = inject(CitaService);
    catalogoService = inject(CatalogoService);
    error = "";
    exito = "";
    consultorios = [];
    turnos = [];
    consultando = false;
    cargandoMes = false;
    errorCalendario = "";
    mes = fechaActual().slice(0, 7);
    cantidades = {};
    secuenciaTurnos = 0;
    secuenciaMes = 0;
    get fechaMinima() {
        return fechaActual();
    }
    get citaOriginal() {
        return this.citas.find((c) => Number(c.idCita) === Number(this.repro.idCita));
    }
    get citasProgramadas() {
        return this.citas.filter((c) => c.estadoCita === "PROGRAMADA" &&
            !c.reprogramaciones &&
            c.fechaCita.slice(0, 10) >= this.fechaMinima);
    }
    get turnoValido() {
        return this.turnos.some((t) => Number(t.idFranja) === Number(this.repro.idFranjaNueva));
    }
    citas = [];
    reproGroup = new FormGroup({
        idCita: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        fechaNueva: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required, fechaNoPasada],
        }),
        idFranjaNueva: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        idConsultorioNuevo: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        motivo: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        aceptacionPaciente: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern("S")],
        }),
    });
    get repro() {
        return this.reproGroup.getRawValue();
    }
    set repro(value) {
        this.reproGroup.reset(value);
    }
    ngOnInit() {
        const id = Number(this.route?.snapshot.paramMap.get("id"));
        if (id > 0)
            this.reproGroup.controls.idCita.setValue(id);
        void this.cargar();
    }
    async cargar() {
        try {
            try {
                [this.citas, this.consultorios] = await Promise.all([
                    firstValueFrom(this.citasService.listar()),
                    firstValueFrom(this.catalogoService.consultorios()),
                ]);
                this.consultorios = this.consultorios.filter((c) => c.estado === "ACTIVO");
                await this.cambiarCita();
            }
            catch (e) {
                this.error = errorText(e);
            }
        }
        finally {
            this.changeDetector.markForCheck();
        }
    }
    async cambiarCita() {
        this.reproGroup.controls.fechaNueva.setValue("");
        this.reproGroup.controls.idFranjaNueva.setValue(null);
        this.reproGroup.controls.idConsultorioNuevo.setValue(this.citaOriginal?.idConsultorio ?? null);
        this.turnos = [];
        ++this.secuenciaTurnos;
        this.consultando = false;
        await this.cargarMes(this.mes);
    }
    async cambiarConsultorio() {
        await Promise.all([this.actualizarTurnos(), this.cargarMes(this.mes)]);
    }
    async cargarMes(mes) {
        const seq = ++this.secuenciaMes;
        this.mes = mes;
        this.cantidades = {};
        this.errorCalendario = "";
        const cita = this.citaOriginal;
        const consultorio = this.repro.idConsultorioNuevo;
        if (!cita?.idEspecialidad || !consultorio) {
            this.cargandoMes = false;
            return;
        }
        this.cargandoMes = true;
        try {
            const dias = await firstValueFrom(this.citasService.disponibilidadMes(cita.idEspecialidad, mes, consultorio));
            if (seq !== this.secuenciaMes)
                return;
            this.cantidades = Object.fromEntries(dias
                .filter((d) => Number(d.idDoctor) === Number(cita.idDoctor))
                .map((d) => [d.fecha, d.total]));
        }
        catch (e) {
            if (seq === this.secuenciaMes)
                this.errorCalendario = errorText(e);
        }
        finally {
            if (seq === this.secuenciaMes)
                this.cargandoMes = false;
            this.changeDetector.markForCheck();
        }
    }
    async elegirFecha(fecha) {
        if (fecha < this.fechaMinima || !this.cantidades[fecha])
            return;
        this.reproGroup.controls.fechaNueva.setValue(fecha);
        await this.actualizarTurnos();
    }
    async actualizarTurnos() {
        const seq = ++this.secuenciaTurnos;
        this.turnos = [];
        this.reproGroup.controls.idFranjaNueva.setValue(null);
        const cita = this.citaOriginal, fecha = this.repro.fechaNueva, consultorio = this.repro.idConsultorioNuevo;
        if (!cita?.idEspecialidad ||
            !fecha ||
            fecha < this.fechaMinima ||
            !consultorio) {
            this.consultando = false;
            return;
        }
        this.consultando = true;
        try {
            const doctores = await firstValueFrom(this.citasService.disponibilidad(cita.idEspecialidad, fecha, consultorio));
            if (seq !== this.secuenciaTurnos)
                return;
            this.turnos =
                doctores.find((d) => Number(d.idDoctor) === Number(cita.idDoctor))
                    ?.turnos ?? [];
        }
        catch (e) {
            if (seq === this.secuenciaTurnos)
                this.error = errorText(e);
        }
        finally {
            if (seq === this.secuenciaTurnos)
                this.consultando = false;
            this.changeDetector.markForCheck();
        }
    }
    async reprogramar() {
        if (this.guardando)
            return;
        this.guardando = true;
        try {
            if (this.reproGroup.invalid ||
                this.consultando ||
                !this.turnoValido ||
                !this.citasProgramadas.some((c) => Number(c.idCita) === Number(this.repro.idCita))) {
                this.reproGroup.markAllAsTouched();
                this.exito = "";
                this.error = "Completa los datos obligatorios de la reprogramación.";
                return;
            }
            this.error = "";
            try {
                await firstValueFrom(this.citasService.ejecutar("cita-reprogramar", this.repro));
                this.exito = "Cita reprogramada sin nuevo cobro";
                await this.cargar();
                void this.router.navigateByUrl("/citas");
            }
            catch (e) {
                this.error = errorText(e);
                await Promise.all([this.actualizarTurnos(), this.cargarMes(this.mes)]);
            }
        }
        finally {
            this.guardando = false;
            this.changeDetector.markForCheck();
        }
    }
};
CitaReprogramacion = __decorate([
    Component({
        standalone: true,
        imports: [
            ReactiveFormsModule,
            FeatureNav,
            ModuleHeader,
            CalendarioDisponibilidad,
            ControlDisabled,
        ],
        template: "<div class=\"k-module k-citas\">\n  <header\n    appModuleHeader\n    class=\"k-module-header\"\n    contexto=\"GESTIÓN CLÍNICA / AGENDA\"\n    titulo=\"Citas médicas\"\n    descripcion=\"Consulta la agenda, reserva turnos y gestiona pagos y reprogramaciones.\"\n    textoActualizar=\"↻ Actualizar agenda\"\n    (actualizar)=\"cargar()\"\n  >\n  </header>\n  <app-feature-nav feature=\"citas\" />\n  @if(error){\n  <div class=\"k-error\" role=\"alert\">{{error}}</div>\n  }@if(exito){\n  <div class=\"k-success\" role=\"status\">{{exito}}</div>\n  }\n  <section class=\"k-panel\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>Reprogramar una cita</h2>\n        <p>\n          El paciente debe aceptar el nuevo turno antes de que comience su cita\n          original.\n        </p>\n      </div>\n    </div>\n    <div class=\"k-info\">\n      Solo se permite una reprogramación por cita y no se registra un segundo\n      cobro.\n    </div>\n    <div class=\"k-form\">\n      <label class=\"k-field k-field-wide\"\n        >Cita original<select\n          [formControl]=\"reproGroup.controls.idCita\"\n          (change)=\"cambiarCita()\"\n          [appControlDisabled]=\"guardando\"\n        >\n          <option [ngValue]=\"null\">Selecciona una cita programada</option>\n          @for(c of citasProgramadas;track c.idCita){\n          <option [ngValue]=\"c.idCita\">\n            #{{c.idCita}} — {{c.nombrePaciente}} — {{c.fechaCita}}\n          </option>\n          }\n        </select></label\n      >\n      <label class=\"k-field\"\n        >Nuevo consultorio<select\n          [formControl]=\"reproGroup.controls.idConsultorioNuevo\"\n          (change)=\"cambiarConsultorio()\"\n          [appControlDisabled]=\"guardando\"\n        >\n          <option [ngValue]=\"null\">Selecciona un consultorio</option>\n          @for(c of consultorios;track c.idConsultorio){\n          <option [ngValue]=\"c.idConsultorio\">{{c.nombre}}</option>\n          }\n        </select></label\n      >\n      <div class=\"k-field k-field-wide\">\n        <span\n          >Nueva fecha · {{citaOriginal?.nombreDoctor}} ·\n          {{citaOriginal?.especialidad}}</span\n        >\n        <app-calendario-disponibilidad\n          [mes]=\"mes\"\n          [minima]=\"fechaMinima\"\n          [seleccionada]=\"repro.fechaNueva || ''\"\n          [cantidades]=\"cantidades\"\n          [cargando]=\"cargandoMes || guardando\"\n          [error]=\"errorCalendario\"\n          (mesChange)=\"cargarMes($event)\"\n          (fechaChange)=\"elegirFecha($event)\"\n        />\n        <small\n          >Selecciona un consultorio para ver las fechas con turnos libres del\n          doctor y la especialidad de la cita original.</small\n        >\n      </div>\n      <label class=\"k-field\"\n        >Nuevo turno<select\n          [formControl]=\"reproGroup.controls.idFranjaNueva\"\n          [appControlDisabled]=\"guardando || consultando || !repro.fechaNueva || !turnos.length\"\n        >\n          <option [ngValue]=\"null\">Selecciona un horario</option>\n          @for(f of turnos;track f.idFranja){\n          <option [ngValue]=\"f.idFranja\">\n            {{f.horaInicio}} – {{f.horaFin}}\n          </option>\n          }\n        </select></label\n      >\n      <label class=\"k-field\"\n        >Motivo de reprogramación<input\n          [formControl]=\"reproGroup.controls.motivo\"\n          placeholder=\"Motivo informado por el paciente\"\n      /></label>\n      <label class=\"k-field\"\n        >Aceptación del paciente<select\n          [formControl]=\"reproGroup.controls.aceptacionPaciente\"\n        >\n          <option value=\"N\">Pendiente</option>\n          <option value=\"S\">Sí, aceptada</option>\n        </select></label\n      >\n    </div>\n    @if(repro.fechaNueva) {\n    <p class=\"k-info\">\n      Fecha seleccionada: {{repro.fechaNueva}} · {{consultando ? \"Consultando\n      turnos…\" : turnos.length + \" turnos disponibles\"}}. La disponibilidad se\n      vuelve a comprobar al guardar.\n    </p>\n    }\n    <div class=\"k-actions\">\n      <button\n        class=\"k-button\"\n        [disabled]=\"guardando || consultando || cargandoMes || reproGroup.invalid || !turnoValido\"\n        (click)=\"reprogramar()\"\n      >\n        Guardar reprogramación\n      </button>\n    </div>\n  </section>\n</div>\n",
        styles: [],
    })
], CitaReprogramacion);
export { CitaReprogramacion };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2l0YS1yZXByb2dyYW1hY2lvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL2ZlYXR1cmVzL2NpdGFzL3BhZ2VzL2NpdGEtcmVwcm9ncmFtYWNpb24vIiwic291cmNlcyI6WyJjaXRhLXJlcHJvZ3JhbWFjaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQzdFLE9BQU8sRUFDTCxXQUFXLEVBQ1gsU0FBUyxFQUNULG1CQUFtQixFQUNuQixVQUFVLEdBQ1gsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxtRkFBbUYsQ0FBQztBQUM3SCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDakYsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzlELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUNuRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkRBQTJELENBQUM7QUFFekYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBRWhGLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQWNwRCxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFrQjtJQUNaLGNBQWMsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FB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QUM7WUFDdkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNyQyxDQUFDO0lBQ0gsQ0FBQztDQUNGLENBQUE7QUE5Tlksa0JBQWtCO0lBWjlCLFNBQVMsQ0FBQztRQUNULFVBQVUsRUFBRSxJQUFJO1FBQ2hCLE9BQU8sRUFBRTtZQUNQLG1CQUFtQjtZQUNuQixVQUFVO1lBQ1YsWUFBWTtZQUNaLHdCQUF3QjtZQUN4QixlQUFlO1NBQ2hCO1FBQ0QsUUFBUSxFQUFDLDZ3SUFBNndJO1FBQ3R4SSxNQUFNLEVBQUMsRUFBRTtLQUNWLENBQUM7R0FDVyxrQkFBa0IsQ0E4TjlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgaW5qZWN0LCBPbkluaXQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtcbiAgRm9ybUNvbnRyb2wsXG4gIEZvcm1Hcm91cCxcbiAgUmVhY3RpdmVGb3Jtc01vZHVsZSxcbiAgVmFsaWRhdG9ycyxcbn0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5pbXBvcnQgeyBBY3RpdmF0ZWRSb3V0ZSwgUm91dGVyIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgZmlyc3RWYWx1ZUZyb20gfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgZmVjaGFBY3R1YWwsIGZlY2hhTm9QYXNhZGEgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29yZS91dGlscy9mZWNoYVwiO1xuaW1wb3J0IHsgQ2FsZW5kYXJpb0Rpc3BvbmliaWxpZGFkIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3NoYXJlZC9jb21wb25lbnRzL2NhbGVuZGFyaW8tZGlzcG9uaWJpbGlkYWQvY2FsZW5kYXJpby1kaXNwb25pYmlsaWRhZFwiO1xuaW1wb3J0IHsgQ29udHJvbERpc2FibGVkIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3NoYXJlZC9kaXJlY3RpdmVzL2NvbnRyb2wtZGlzYWJsZWRcIjtcbmltcG9ydCB7IGVycm9yVGV4dCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb3JlL3V0aWxzL2h0dHAtZXJyb3JcIjtcbmltcG9ydCB7IEZlYXR1cmVOYXYgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2NvbXBvbmVudHMvZmVhdHVyZS1uYXYvZmVhdHVyZS1uYXZcIjtcbmltcG9ydCB7IE1vZHVsZUhlYWRlciB9IGZyb20gXCIuLi8uLi8uLi8uLi9zaGFyZWQvY29tcG9uZW50cy9tb2R1bGUtaGVhZGVyL21vZHVsZS1oZWFkZXJcIjtcbmltcG9ydCB7IENvbnN1bHRvcmlvIH0gZnJvbSBcIi4uLy4uLy4uL2NhdGFsb2dvcy9tb2RlbHMvY2F0YWxvZ29zLm1vZGVsXCI7XG5pbXBvcnQgeyBDYXRhbG9nb1NlcnZpY2UgfSBmcm9tIFwiLi4vLi4vLi4vY2F0YWxvZ29zL3NlcnZpY2VzL2NhdGFsb2dvcy1zZXJ2aWNlXCI7XG5pbXBvcnQgeyBDaXRhLCBDaXRhUmVxdWVzdCwgVHVybm9EaXNwb25pYmxlIH0gZnJvbSBcIi4uLy4uL21vZGVscy9jaXRhcy5tb2RlbFwiO1xuaW1wb3J0IHsgQ2l0YVNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2VydmljZXMvY2l0YXMtc2VydmljZVwiO1xuXG5AQ29tcG9uZW50KHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW1xuICAgIFJlYWN0aXZlRm9ybXNNb2R1bGUsXG4gICAgRmVhdHVyZU5hdixcbiAgICBNb2R1bGVIZWFkZXIsXG4gICAgQ2FsZW5kYXJpb0Rpc3BvbmliaWxpZGFkLFxuICAgIENvbnRyb2xEaXNhYmxlZCxcbiAgXSxcbiAgdGVtcGxhdGU6XCI8ZGl2IGNsYXNzPVxcXCJrLW1vZHVsZSBrLWNpdGFzXFxcIj5cXG4gIDxoZWFkZXJcXG4gICAgYXBwTW9kdWxlSGVhZGVyXFxuICAgIGNsYXNzPVxcXCJrLW1vZHVsZS1oZWFkZXJcXFwiXFxuICAgIGNvbnRleHRvPVxcXCJHRVNUScOTTiBDTMONTklDQSAvIEFHRU5EQVxcXCJcXG4gICAgdGl0dWxvPVxcXCJDaXRhcyBtw6lkaWNhc1xcXCJcXG4gICAgZGVzY3JpcGNpb249XFxcIkNvbnN1bHRhIGxhIGFnZW5kYSwgcmVzZXJ2YSB0dXJub3MgeSBnZXN0aW9uYSBwYWdvcyB5IHJlcHJvZ3JhbWFjaW9uZXMuXFxcIlxcbiAgICB0ZXh0b0FjdHVhbGl6YXI9XFxcIuKGuyBBY3R1YWxpemFyIGFnZW5kYVxcXCJcXG4gICAgKGFjdHVhbGl6YXIpPVxcXCJjYXJnYXIoKVxcXCJcXG4gID5cXG4gIDwvaGVhZGVyPlxcbiAgPGFwcC1mZWF0dXJlLW5hdiBmZWF0dXJlPVxcXCJjaXRhc1xcXCIgLz5cXG4gIEBpZihlcnJvcil7XFxuICA8ZGl2IGNsYXNzPVxcXCJrLWVycm9yXFxcIiByb2xlPVxcXCJhbGVydFxcXCI+e3tlcnJvcn19PC9kaXY+XFxuICB9QGlmKGV4aXRvKXtcXG4gIDxkaXYgY2xhc3M9XFxcImstc3VjY2Vzc1xcXCIgcm9sZT1cXFwic3RhdHVzXFxcIj57e2V4aXRvfX08L2Rpdj5cXG4gIH1cXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJrLXBhbmVsXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1zZWN0aW9uLWhlYWRpbmdcXFwiPlxcbiAgICAgIDxkaXY+XFxuICAgICAgICA8aDI+UmVwcm9ncmFtYXIgdW5hIGNpdGE8L2gyPlxcbiAgICAgICAgPHA+XFxuICAgICAgICAgIEVsIHBhY2llbnRlIGRlYmUgYWNlcHRhciBlbCBudWV2byB0dXJubyBhbnRlcyBkZSBxdWUgY29taWVuY2Ugc3UgY2l0YVxcbiAgICAgICAgICBvcmlnaW5hbC5cXG4gICAgICAgIDwvcD5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcImstaW5mb1xcXCI+XFxuICAgICAgU29sbyBzZSBwZXJtaXRlIHVuYSByZXByb2dyYW1hY2nDs24gcG9yIGNpdGEgeSBubyBzZSByZWdpc3RyYSB1biBzZWd1bmRvXFxuICAgICAgY29icm8uXFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLWZvcm1cXFwiPlxcbiAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZCBrLWZpZWxkLXdpZGVcXFwiXFxuICAgICAgICA+Q2l0YSBvcmlnaW5hbDxzZWxlY3RcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwicmVwcm9Hcm91cC5jb250cm9scy5pZENpdGFcXFwiXFxuICAgICAgICAgIChjaGFuZ2UpPVxcXCJjYW1iaWFyQ2l0YSgpXFxcIlxcbiAgICAgICAgICBbYXBwQ29udHJvbERpc2FibGVkXT1cXFwiZ3VhcmRhbmRvXFxcIlxcbiAgICAgICAgPlxcbiAgICAgICAgICA8b3B0aW9uIFtuZ1ZhbHVlXT1cXFwibnVsbFxcXCI+U2VsZWNjaW9uYSB1bmEgY2l0YSBwcm9ncmFtYWRhPC9vcHRpb24+XFxuICAgICAgICAgIEBmb3IoYyBvZiBjaXRhc1Byb2dyYW1hZGFzO3RyYWNrIGMuaWRDaXRhKXtcXG4gICAgICAgICAgPG9wdGlvbiBbbmdWYWx1ZV09XFxcImMuaWRDaXRhXFxcIj5cXG4gICAgICAgICAgICAje3tjLmlkQ2l0YX19IOKAlCB7e2Mubm9tYnJlUGFjaWVudGV9fSDigJQge3tjLmZlY2hhQ2l0YX19XFxuICAgICAgICAgIDwvb3B0aW9uPlxcbiAgICAgICAgICB9XFxuICAgICAgICA8L3NlbGVjdD48L2xhYmVsXFxuICAgICAgPlxcbiAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5OdWV2byBjb25zdWx0b3JpbzxzZWxlY3RcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwicmVwcm9Hcm91cC5jb250cm9scy5pZENvbnN1bHRvcmlvTnVldm9cXFwiXFxuICAgICAgICAgIChjaGFuZ2UpPVxcXCJjYW1iaWFyQ29uc3VsdG9yaW8oKVxcXCJcXG4gICAgICAgICAgW2FwcENvbnRyb2xEaXNhYmxlZF09XFxcImd1YXJkYW5kb1xcXCJcXG4gICAgICAgID5cXG4gICAgICAgICAgPG9wdGlvbiBbbmdWYWx1ZV09XFxcIm51bGxcXFwiPlNlbGVjY2lvbmEgdW4gY29uc3VsdG9yaW88L29wdGlvbj5cXG4gICAgICAgICAgQGZvcihjIG9mIGNvbnN1bHRvcmlvczt0cmFjayBjLmlkQ29uc3VsdG9yaW8pe1xcbiAgICAgICAgICA8b3B0aW9uIFtuZ1ZhbHVlXT1cXFwiYy5pZENvbnN1bHRvcmlvXFxcIj57e2Mubm9tYnJlfX08L29wdGlvbj5cXG4gICAgICAgICAgfVxcbiAgICAgICAgPC9zZWxlY3Q+PC9sYWJlbFxcbiAgICAgID5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJrLWZpZWxkIGstZmllbGQtd2lkZVxcXCI+XFxuICAgICAgICA8c3BhblxcbiAgICAgICAgICA+TnVldmEgZmVjaGEgwrcge3tjaXRhT3JpZ2luYWw/Lm5vbWJyZURvY3Rvcn19IMK3XFxuICAgICAgICAgIHt7Y2l0YU9yaWdpbmFsPy5lc3BlY2lhbGlkYWR9fTwvc3BhblxcbiAgICAgICAgPlxcbiAgICAgICAgPGFwcC1jYWxlbmRhcmlvLWRpc3BvbmliaWxpZGFkXFxuICAgICAgICAgIFttZXNdPVxcXCJtZXNcXFwiXFxuICAgICAgICAgIFttaW5pbWFdPVxcXCJmZWNoYU1pbmltYVxcXCJcXG4gICAgICAgICAgW3NlbGVjY2lvbmFkYV09XFxcInJlcHJvLmZlY2hhTnVldmEgfHwgJydcXFwiXFxuICAgICAgICAgIFtjYW50aWRhZGVzXT1cXFwiY2FudGlkYWRlc1xcXCJcXG4gICAgICAgICAgW2NhcmdhbmRvXT1cXFwiY2FyZ2FuZG9NZXMgfHwgZ3VhcmRhbmRvXFxcIlxcbiAgICAgICAgICBbZXJyb3JdPVxcXCJlcnJvckNhbGVuZGFyaW9cXFwiXFxuICAgICAgICAgIChtZXNDaGFuZ2UpPVxcXCJjYXJnYXJNZXMoJGV2ZW50KVxcXCJcXG4gICAgICAgICAgKGZlY2hhQ2hhbmdlKT1cXFwiZWxlZ2lyRmVjaGEoJGV2ZW50KVxcXCJcXG4gICAgICAgIC8+XFxuICAgICAgICA8c21hbGxcXG4gICAgICAgICAgPlNlbGVjY2lvbmEgdW4gY29uc3VsdG9yaW8gcGFyYSB2ZXIgbGFzIGZlY2hhcyBjb24gdHVybm9zIGxpYnJlcyBkZWxcXG4gICAgICAgICAgZG9jdG9yIHkgbGEgZXNwZWNpYWxpZGFkIGRlIGxhIGNpdGEgb3JpZ2luYWwuPC9zbWFsbFxcbiAgICAgICAgPlxcbiAgICAgIDwvZGl2PlxcbiAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5OdWV2byB0dXJubzxzZWxlY3RcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwicmVwcm9Hcm91cC5jb250cm9scy5pZEZyYW5qYU51ZXZhXFxcIlxcbiAgICAgICAgICBbYXBwQ29udHJvbERpc2FibGVkXT1cXFwiZ3VhcmRhbmRvIHx8IGNvbnN1bHRhbmRvIHx8ICFyZXByby5mZWNoYU51ZXZhIHx8ICF0dXJub3MubGVuZ3RoXFxcIlxcbiAgICAgICAgPlxcbiAgICAgICAgICA8b3B0aW9uIFtuZ1ZhbHVlXT1cXFwibnVsbFxcXCI+U2VsZWNjaW9uYSB1biBob3JhcmlvPC9vcHRpb24+XFxuICAgICAgICAgIEBmb3IoZiBvZiB0dXJub3M7dHJhY2sgZi5pZEZyYW5qYSl7XFxuICAgICAgICAgIDxvcHRpb24gW25nVmFsdWVdPVxcXCJmLmlkRnJhbmphXFxcIj5cXG4gICAgICAgICAgICB7e2YuaG9yYUluaWNpb319IOKAkyB7e2YuaG9yYUZpbn19XFxuICAgICAgICAgIDwvb3B0aW9uPlxcbiAgICAgICAgICB9XFxuICAgICAgICA8L3NlbGVjdD48L2xhYmVsXFxuICAgICAgPlxcbiAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5Nb3Rpdm8gZGUgcmVwcm9ncmFtYWNpw7NuPGlucHV0XFxuICAgICAgICAgIFtmb3JtQ29udHJvbF09XFxcInJlcHJvR3JvdXAuY29udHJvbHMubW90aXZvXFxcIlxcbiAgICAgICAgICBwbGFjZWhvbGRlcj1cXFwiTW90aXZvIGluZm9ybWFkbyBwb3IgZWwgcGFjaWVudGVcXFwiXFxuICAgICAgLz48L2xhYmVsPlxcbiAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5BY2VwdGFjacOzbiBkZWwgcGFjaWVudGU8c2VsZWN0XFxuICAgICAgICAgIFtmb3JtQ29udHJvbF09XFxcInJlcHJvR3JvdXAuY29udHJvbHMuYWNlcHRhY2lvblBhY2llbnRlXFxcIlxcbiAgICAgICAgPlxcbiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJOXFxcIj5QZW5kaWVudGU8L29wdGlvbj5cXG4gICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiU1xcXCI+U8OtLCBhY2VwdGFkYTwvb3B0aW9uPlxcbiAgICAgICAgPC9zZWxlY3Q+PC9sYWJlbFxcbiAgICAgID5cXG4gICAgPC9kaXY+XFxuICAgIEBpZihyZXByby5mZWNoYU51ZXZhKSB7XFxuICAgIDxwIGNsYXNzPVxcXCJrLWluZm9cXFwiPlxcbiAgICAgIEZlY2hhIHNlbGVjY2lvbmFkYToge3tyZXByby5mZWNoYU51ZXZhfX0gwrcge3tjb25zdWx0YW5kbyA/IFxcXCJDb25zdWx0YW5kb1xcbiAgICAgIHR1cm5vc+KAplxcXCIgOiB0dXJub3MubGVuZ3RoICsgXFxcIiB0dXJub3MgZGlzcG9uaWJsZXNcXFwifX0uIExhIGRpc3BvbmliaWxpZGFkIHNlXFxuICAgICAgdnVlbHZlIGEgY29tcHJvYmFyIGFsIGd1YXJkYXIuXFxuICAgIDwvcD5cXG4gICAgfVxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLWFjdGlvbnNcXFwiPlxcbiAgICAgIDxidXR0b25cXG4gICAgICAgIGNsYXNzPVxcXCJrLWJ1dHRvblxcXCJcXG4gICAgICAgIFtkaXNhYmxlZF09XFxcImd1YXJkYW5kbyB8fCBjb25zdWx0YW5kbyB8fCBjYXJnYW5kb01lcyB8fCByZXByb0dyb3VwLmludmFsaWQgfHwgIXR1cm5vVmFsaWRvXFxcIlxcbiAgICAgICAgKGNsaWNrKT1cXFwicmVwcm9ncmFtYXIoKVxcXCJcXG4gICAgICA+XFxuICAgICAgICBHdWFyZGFyIHJlcHJvZ3JhbWFjacOzblxcbiAgICAgIDwvYnV0dG9uPlxcbiAgICA8L2Rpdj5cXG4gIDwvc2VjdGlvbj5cXG48L2Rpdj5cXG5cIixcbiAgc3R5bGVzOltdLFxufSlcbmV4cG9ydCBjbGFzcyBDaXRhUmVwcm9ncmFtYWNpb24gaW1wbGVtZW50cyBPbkluaXQge1xuICBwcml2YXRlIHJlYWRvbmx5IGNoYW5nZURldGVjdG9yID0gaW5qZWN0KENoYW5nZURldGVjdG9yUmVmKTtcbiAgZ3VhcmRhbmRvID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSByZWFkb25seSByb3V0ZXIgPSBpbmplY3QoUm91dGVyKTtcbiAgcHJpdmF0ZSByZWFkb25seSByb3V0ZSA9IGluamVjdChBY3RpdmF0ZWRSb3V0ZSwgeyBvcHRpb25hbDogdHJ1ZSB9KTtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yZXBybyA9IHsgYWNlcHRhY2lvblBhY2llbnRlOiBcIk5cIiB9O1xuICB9XG4gIHByaXZhdGUgY2l0YXNTZXJ2aWNlID0gaW5qZWN0KENpdGFTZXJ2aWNlKTtcbiAgcHJpdmF0ZSBjYXRhbG9nb1NlcnZpY2UgPSBpbmplY3QoQ2F0YWxvZ29TZXJ2aWNlKTtcbiAgZXJyb3IgPSBcIlwiO1xuICBleGl0byA9IFwiXCI7XG4gIGNvbnN1bHRvcmlvczogQ29uc3VsdG9yaW9bXSA9IFtdO1xuICB0dXJub3M6IFR1cm5vRGlzcG9uaWJsZVtdID0gW107XG4gIGNvbnN1bHRhbmRvID0gZmFsc2U7XG4gIGNhcmdhbmRvTWVzID0gZmFsc2U7XG4gIGVycm9yQ2FsZW5kYXJpbyA9IFwiXCI7XG4gIG1lcyA9IGZlY2hhQWN0dWFsKCkuc2xpY2UoMCwgNyk7XG4gIGNhbnRpZGFkZXM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcbiAgcHJpdmF0ZSBzZWN1ZW5jaWFUdXJub3MgPSAwO1xuICBwcml2YXRlIHNlY3VlbmNpYU1lcyA9IDA7XG4gIGdldCBmZWNoYU1pbmltYSgpIHtcbiAgICByZXR1cm4gZmVjaGFBY3R1YWwoKTtcbiAgfVxuICBnZXQgY2l0YU9yaWdpbmFsKCkge1xuICAgIHJldHVybiB0aGlzLmNpdGFzLmZpbmQoXG4gICAgICAoYykgPT4gTnVtYmVyKGMuaWRDaXRhKSA9PT0gTnVtYmVyKHRoaXMucmVwcm8uaWRDaXRhKSxcbiAgICApO1xuICB9XG4gIGdldCBjaXRhc1Byb2dyYW1hZGFzKCkge1xuICAgIHJldHVybiB0aGlzLmNpdGFzLmZpbHRlcihcbiAgICAgIChjKSA9PlxuICAgICAgICBjLmVzdGFkb0NpdGEgPT09IFwiUFJPR1JBTUFEQVwiICYmXG4gICAgICAgICFjLnJlcHJvZ3JhbWFjaW9uZXMgJiZcbiAgICAgICAgYy5mZWNoYUNpdGEuc2xpY2UoMCwgMTApID49IHRoaXMuZmVjaGFNaW5pbWEsXG4gICAgKTtcbiAgfVxuICBnZXQgdHVybm9WYWxpZG8oKSB7XG4gICAgcmV0dXJuIHRoaXMudHVybm9zLnNvbWUoXG4gICAgICAodCkgPT4gTnVtYmVyKHQuaWRGcmFuamEpID09PSBOdW1iZXIodGhpcy5yZXByby5pZEZyYW5qYU51ZXZhKSxcbiAgICApO1xuICB9XG5cbiAgY2l0YXM6IENpdGFbXSA9IFtdO1xuICByZWFkb25seSByZXByb0dyb3VwID0gbmV3IEZvcm1Hcm91cCh7XG4gICAgaWRDaXRhOiBuZXcgRm9ybUNvbnRyb2w8bnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtWYWxpZGF0b3JzLnJlcXVpcmVkXSxcbiAgICB9KSxcbiAgICBmZWNoYU51ZXZhOiBuZXcgRm9ybUNvbnRyb2w8c3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtWYWxpZGF0b3JzLnJlcXVpcmVkLCBmZWNoYU5vUGFzYWRhXSxcbiAgICB9KSxcbiAgICBpZEZyYW5qYU51ZXZhOiBuZXcgRm9ybUNvbnRyb2w8bnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtWYWxpZGF0b3JzLnJlcXVpcmVkXSxcbiAgICB9KSxcbiAgICBpZENvbnN1bHRvcmlvTnVldm86IG5ldyBGb3JtQ29udHJvbDxudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkPih1bmRlZmluZWQsIHtcbiAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgICAgdmFsaWRhdG9yczogW1ZhbGlkYXRvcnMucmVxdWlyZWRdLFxuICAgIH0pLFxuICAgIG1vdGl2bzogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbVmFsaWRhdG9ycy5yZXF1aXJlZF0sXG4gICAgfSksXG4gICAgYWNlcHRhY2lvblBhY2llbnRlOiBuZXcgRm9ybUNvbnRyb2w8c3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtWYWxpZGF0b3JzLnJlcXVpcmVkLCBWYWxpZGF0b3JzLnBhdHRlcm4oXCJTXCIpXSxcbiAgICB9KSxcbiAgfSk7XG4gIGdldCByZXBybygpOiBDaXRhUmVxdWVzdCB7XG4gICAgcmV0dXJuIHRoaXMucmVwcm9Hcm91cC5nZXRSYXdWYWx1ZSgpO1xuICB9XG4gIHNldCByZXBybyh2YWx1ZTogQ2l0YVJlcXVlc3QpIHtcbiAgICB0aGlzLnJlcHJvR3JvdXAucmVzZXQodmFsdWUpO1xuICB9XG4gIG5nT25Jbml0KCkge1xuICAgIGNvbnN0IGlkID0gTnVtYmVyKHRoaXMucm91dGU/LnNuYXBzaG90LnBhcmFtTWFwLmdldChcImlkXCIpKTtcbiAgICBpZiAoaWQgPiAwKSB0aGlzLnJlcHJvR3JvdXAuY29udHJvbHMuaWRDaXRhLnNldFZhbHVlKGlkKTtcbiAgICB2b2lkIHRoaXMuY2FyZ2FyKCk7XG4gIH1cbiAgYXN5bmMgY2FyZ2FyKCkge1xuICAgIHRyeSB7XG4gICAgICB0cnkge1xuICAgICAgICBbdGhpcy5jaXRhcywgdGhpcy5jb25zdWx0b3Jpb3NdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgIGZpcnN0VmFsdWVGcm9tKHRoaXMuY2l0YXNTZXJ2aWNlLmxpc3RhcigpKSxcbiAgICAgICAgICBmaXJzdFZhbHVlRnJvbSh0aGlzLmNhdGFsb2dvU2VydmljZS5jb25zdWx0b3Jpb3MoKSksXG4gICAgICAgIF0pO1xuICAgICAgICB0aGlzLmNvbnN1bHRvcmlvcyA9IHRoaXMuY29uc3VsdG9yaW9zLmZpbHRlcihcbiAgICAgICAgICAoYykgPT4gYy5lc3RhZG8gPT09IFwiQUNUSVZPXCIsXG4gICAgICAgICk7XG4gICAgICAgIGF3YWl0IHRoaXMuY2FtYmlhckNpdGEoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbiAgYXN5bmMgY2FtYmlhckNpdGEoKSB7XG4gICAgdGhpcy5yZXByb0dyb3VwLmNvbnRyb2xzLmZlY2hhTnVldmEuc2V0VmFsdWUoXCJcIik7XG4gICAgdGhpcy5yZXByb0dyb3VwLmNvbnRyb2xzLmlkRnJhbmphTnVldmEuc2V0VmFsdWUobnVsbCk7XG4gICAgdGhpcy5yZXByb0dyb3VwLmNvbnRyb2xzLmlkQ29uc3VsdG9yaW9OdWV2by5zZXRWYWx1ZShcbiAgICAgIHRoaXMuY2l0YU9yaWdpbmFsPy5pZENvbnN1bHRvcmlvID8/IG51bGwsXG4gICAgKTtcbiAgICB0aGlzLnR1cm5vcyA9IFtdO1xuICAgICsrdGhpcy5zZWN1ZW5jaWFUdXJub3M7XG4gICAgdGhpcy5jb25zdWx0YW5kbyA9IGZhbHNlO1xuICAgIGF3YWl0IHRoaXMuY2FyZ2FyTWVzKHRoaXMubWVzKTtcbiAgfVxuICBhc3luYyBjYW1iaWFyQ29uc3VsdG9yaW8oKSB7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoW3RoaXMuYWN0dWFsaXphclR1cm5vcygpLCB0aGlzLmNhcmdhck1lcyh0aGlzLm1lcyldKTtcbiAgfVxuICBhc3luYyBjYXJnYXJNZXMobWVzOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzZXEgPSArK3RoaXMuc2VjdWVuY2lhTWVzO1xuICAgIHRoaXMubWVzID0gbWVzO1xuICAgIHRoaXMuY2FudGlkYWRlcyA9IHt9O1xuICAgIHRoaXMuZXJyb3JDYWxlbmRhcmlvID0gXCJcIjtcbiAgICBjb25zdCBjaXRhID0gdGhpcy5jaXRhT3JpZ2luYWw7XG4gICAgY29uc3QgY29uc3VsdG9yaW8gPSB0aGlzLnJlcHJvLmlkQ29uc3VsdG9yaW9OdWV2bztcbiAgICBpZiAoIWNpdGE/LmlkRXNwZWNpYWxpZGFkIHx8ICFjb25zdWx0b3Jpbykge1xuICAgICAgdGhpcy5jYXJnYW5kb01lcyA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNhcmdhbmRvTWVzID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGlhcyA9IGF3YWl0IGZpcnN0VmFsdWVGcm9tKFxuICAgICAgICB0aGlzLmNpdGFzU2VydmljZS5kaXNwb25pYmlsaWRhZE1lcyhcbiAgICAgICAgICBjaXRhLmlkRXNwZWNpYWxpZGFkLFxuICAgICAgICAgIG1lcyxcbiAgICAgICAgICBjb25zdWx0b3JpbyxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgICBpZiAoc2VxICE9PSB0aGlzLnNlY3VlbmNpYU1lcykgcmV0dXJuO1xuICAgICAgdGhpcy5jYW50aWRhZGVzID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBkaWFzXG4gICAgICAgICAgLmZpbHRlcigoZCkgPT4gTnVtYmVyKGQuaWREb2N0b3IpID09PSBOdW1iZXIoY2l0YS5pZERvY3RvcikpXG4gICAgICAgICAgLm1hcCgoZCkgPT4gW2QuZmVjaGEsIGQudG90YWxdKSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKHNlcSA9PT0gdGhpcy5zZWN1ZW5jaWFNZXMpIHRoaXMuZXJyb3JDYWxlbmRhcmlvID0gZXJyb3JUZXh0KGUpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoc2VxID09PSB0aGlzLnNlY3VlbmNpYU1lcykgdGhpcy5jYXJnYW5kb01lcyA9IGZhbHNlO1xuICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbiAgYXN5bmMgZWxlZ2lyRmVjaGEoZmVjaGE6IHN0cmluZykge1xuICAgIGlmIChmZWNoYSA8IHRoaXMuZmVjaGFNaW5pbWEgfHwgIXRoaXMuY2FudGlkYWRlc1tmZWNoYV0pIHJldHVybjtcbiAgICB0aGlzLnJlcHJvR3JvdXAuY29udHJvbHMuZmVjaGFOdWV2YS5zZXRWYWx1ZShmZWNoYSk7XG4gICAgYXdhaXQgdGhpcy5hY3R1YWxpemFyVHVybm9zKCk7XG4gIH1cbiAgYXN5bmMgYWN0dWFsaXphclR1cm5vcygpIHtcbiAgICBjb25zdCBzZXEgPSArK3RoaXMuc2VjdWVuY2lhVHVybm9zO1xuICAgIHRoaXMudHVybm9zID0gW107XG4gICAgdGhpcy5yZXByb0dyb3VwLmNvbnRyb2xzLmlkRnJhbmphTnVldmEuc2V0VmFsdWUobnVsbCk7XG4gICAgY29uc3QgY2l0YSA9IHRoaXMuY2l0YU9yaWdpbmFsLFxuICAgICAgZmVjaGEgPSB0aGlzLnJlcHJvLmZlY2hhTnVldmEsXG4gICAgICBjb25zdWx0b3JpbyA9IHRoaXMucmVwcm8uaWRDb25zdWx0b3Jpb051ZXZvO1xuICAgIGlmIChcbiAgICAgICFjaXRhPy5pZEVzcGVjaWFsaWRhZCB8fFxuICAgICAgIWZlY2hhIHx8XG4gICAgICBmZWNoYSA8IHRoaXMuZmVjaGFNaW5pbWEgfHxcbiAgICAgICFjb25zdWx0b3Jpb1xuICAgICkge1xuICAgICAgdGhpcy5jb25zdWx0YW5kbyA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bHRhbmRvID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZG9jdG9yZXMgPSBhd2FpdCBmaXJzdFZhbHVlRnJvbShcbiAgICAgICAgdGhpcy5jaXRhc1NlcnZpY2UuZGlzcG9uaWJpbGlkYWQoXG4gICAgICAgICAgY2l0YS5pZEVzcGVjaWFsaWRhZCxcbiAgICAgICAgICBmZWNoYSxcbiAgICAgICAgICBjb25zdWx0b3JpbyxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgICBpZiAoc2VxICE9PSB0aGlzLnNlY3VlbmNpYVR1cm5vcykgcmV0dXJuO1xuICAgICAgdGhpcy50dXJub3MgPVxuICAgICAgICBkb2N0b3Jlcy5maW5kKChkKSA9PiBOdW1iZXIoZC5pZERvY3RvcikgPT09IE51bWJlcihjaXRhLmlkRG9jdG9yKSlcbiAgICAgICAgICA/LnR1cm5vcyA/PyBbXTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoc2VxID09PSB0aGlzLnNlY3VlbmNpYVR1cm5vcykgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKHNlcSA9PT0gdGhpcy5zZWN1ZW5jaWFUdXJub3MpIHRoaXMuY29uc3VsdGFuZG8gPSBmYWxzZTtcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG4gIGFzeW5jIHJlcHJvZ3JhbWFyKCkge1xuICAgIGlmICh0aGlzLmd1YXJkYW5kbykgcmV0dXJuO1xuICAgIHRoaXMuZ3VhcmRhbmRvID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLnJlcHJvR3JvdXAuaW52YWxpZCB8fFxuICAgICAgICB0aGlzLmNvbnN1bHRhbmRvIHx8XG4gICAgICAgICF0aGlzLnR1cm5vVmFsaWRvIHx8XG4gICAgICAgICF0aGlzLmNpdGFzUHJvZ3JhbWFkYXMuc29tZShcbiAgICAgICAgICAoYykgPT4gTnVtYmVyKGMuaWRDaXRhKSA9PT0gTnVtYmVyKHRoaXMucmVwcm8uaWRDaXRhKSxcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMucmVwcm9Hcm91cC5tYXJrQWxsQXNUb3VjaGVkKCk7XG4gICAgICAgIHRoaXMuZXhpdG8gPSBcIlwiO1xuICAgICAgICB0aGlzLmVycm9yID0gXCJDb21wbGV0YSBsb3MgZGF0b3Mgb2JsaWdhdG9yaW9zIGRlIGxhIHJlcHJvZ3JhbWFjacOzbi5cIjtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5lcnJvciA9IFwiXCI7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBmaXJzdFZhbHVlRnJvbShcbiAgICAgICAgICB0aGlzLmNpdGFzU2VydmljZS5lamVjdXRhcihcImNpdGEtcmVwcm9ncmFtYXJcIiwgdGhpcy5yZXBybyksXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZXhpdG8gPSBcIkNpdGEgcmVwcm9ncmFtYWRhIHNpbiBudWV2byBjb2Jyb1wiO1xuICAgICAgICBhd2FpdCB0aGlzLmNhcmdhcigpO1xuICAgICAgICB2b2lkIHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwoXCIvY2l0YXNcIik7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBlcnJvclRleHQoZSk7XG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFt0aGlzLmFjdHVhbGl6YXJUdXJub3MoKSwgdGhpcy5jYXJnYXJNZXModGhpcy5tZXMpXSk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZ3VhcmRhbmRvID0gZmFsc2U7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxufVxuIl19
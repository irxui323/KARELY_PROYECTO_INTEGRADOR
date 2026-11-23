var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Paginador } from '../../../../shared/components/paginador/paginador.mjs';
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from '../../../../core/utils/http-error.mjs';
import { FeatureNav } from '../../../../shared/components/feature-nav/feature-nav.mjs';
import { DoctorService } from '../../services/doctores-service.mjs';
let DoctorDocumentos = class DoctorDocumentos {
    changeDetector = inject(ChangeDetectorRef);
    guardando = false;
    route = inject(ActivatedRoute, { optional: true });
    doctoresService = inject(DoctorService);
    doctores = [];
    documentos = [];
    error = "";
    exito = "";
    selectedDoctor = 0;
    tipos = ["DNI", "TITULO"];
    archivos = {};
    motivos = {};
    dniConforme = false;
    tituloConforme = false;
    abiertos = new Set();
    carga = 0;
    resetRevision() {
        this.dniConforme = false;
        this.tituloConforme = false;
        this.abiertos.clear();
    }
    ultimo(tipo) {
        return this.documentos
            .filter((d) => d.tipoDocumento === tipo)
            .sort((a, b) => b.idDocumento - a.idDocumento)[0];
    }
    get puedeAprobar() {
        return (this.tipos.every((tipo) => {
            const d = this.ultimo(tipo);
            return (!!d &&
                ["PENDIENTE", "VALIDADO"].includes(d.estado) &&
                this.abiertos.has(d.idDocumento));
        }) &&
            this.dniConforme &&
            this.tituloConforme);
    }
    async verDocumento(d) {
        const doctor = this.selectedDoctor;
        const ventana = window.open("", "_blank");
        try {
            const blob = await firstValueFrom(this.doctoresService.descargarDocumento(doctor, d.idDocumento));
            if (this.selectedDoctor !== doctor) {
                ventana?.close();
                return;
            }
            const url = URL.createObjectURL(blob);
            if (ventana) {
                ventana.location.href = url;
                this.abiertos.add(d.idDocumento);
            }
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
        catch (e) {
            ventana?.close();
            this.error = errorText(e);
        }
        finally {
            this.changeDetector.markForCheck();
        }
    }
    async rechazarDocumento(d) {
        if (this.guardando)
            return;
        const motivo = this.motivos[d.idDocumento]?.trim();
        if (!motivo) {
            this.error = "Escribe el motivo del rechazo";
            return;
        }
        this.guardando = true;
        this.error = "";
        this.exito = "";
        const doctor = this.selectedDoctor;
        this.resetRevision();
        try {
            await firstValueFrom(this.doctoresService.rechazarDocumento(doctor, d.idDocumento, motivo));
            if (doctor === this.selectedDoctor) {
                this.exito = "Documento rechazado";
                await this.cargarDocumentos();
            }
            await this.cargar();
        }
        catch (e) {
            this.error = errorText(e);
        }
        finally {
            this.guardando = false;
            this.changeDetector.markForCheck();
        }
    }
    get doctorSeleccionado() {
        return this.doctores.find((d) => d.idDoctor === this.selectedDoctor);
    }
    get guardadoPendiente() {
        return Object.values(this.archivos).some(Boolean);
    }
    ngOnInit() {
        const id = Number(this.route?.snapshot.queryParamMap.get("doctor"));
        if (id > 0)
            this.selectedDoctor = id;
        void this.cargar();
        if (id > 0)
            void this.cargarDocumentos();
    }
    async cargar() {
        try {
            try {
                this.doctores = await firstValueFrom(this.doctoresService.listar());
            }
            catch (e) {
                this.error = errorText(e);
            }
        }
        finally {
            this.changeDetector.markForCheck();
        }
    }
    async cargarDocumentos(preservarRevision = false, preservarArchivos = false) {
        const carga = ++this.carga;
        if (!preservarRevision)
            this.resetRevision();
        if (!preservarArchivos && !preservarRevision)
            this.archivos = {};
        try {
            const doctor = this.selectedDoctor;
            this.documentos = [];
            if (!doctor)
                return;
            try {
                const documentos = await firstValueFrom(this.doctoresService.documentos(doctor));
                if (this.selectedDoctor === doctor && carga === this.carga)
                    this.documentos = documentos;
            }
            catch (e) {
                if (this.selectedDoctor === doctor && carga === this.carga)
                    this.error = errorText(e);
            }
        }
        finally {
            this.changeDetector.markForCheck();
        }
    }
    cambiarArchivo(e, tipo) {
        this.archivos[tipo] = e.target.files?.item(0) || null;
    }
    async subirDocumento(tipo) {
        if (this.guardando)
            return;
        const archivo = this.archivos[tipo];
        this.resetRevision();
        this.guardando = true;
        try {
            this.error = "";
            this.exito = "";
            if (!archivo || !this.selectedDoctor)
                return;
            if (archivo.size > 10 * 1024 * 1024) {
                this.error = "El archivo supera el máximo de 10 MB";
                return;
            }
            try {
                await firstValueFrom(this.doctoresService.subir(this.selectedDoctor, tipo, archivo));
                this.exito = "Documento recibido";
                this.archivos[tipo] = null;
                await this.cargarDocumentos(false, true);
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
    async aprobarDoctor() {
        if (this.guardando)
            return;
        this.guardando = true;
        try {
            this.error = "";
            this.exito = "";
            const doctor = this.selectedDoctor;
            if (!doctor) {
                this.error = "Selecciona un doctor";
                return;
            }
            await this.cargarDocumentos(true);
            if (this.error || this.selectedDoctor !== doctor)
                return;
            const faltantes = ["DNI", "TITULO"].filter((tipo) => {
                const ultimo = this.documentos
                    .filter((d) => d.tipoDocumento === tipo)
                    .sort((a, b) => Number(b.idDocumento) - Number(a.idDocumento))[0];
                return !ultimo || !["PENDIENTE", "VALIDADO"].includes(ultimo.estado);
            });
            if (faltantes.length) {
                this.error =
                    "Adjunta un DNI y un título profesional vigentes antes de validar. Falta o fue rechazado: " +
                        faltantes
                            .map((tipo) => (tipo === "TITULO" ? "Título profesional" : tipo))
                            .join(", ");
                return;
            }
            if (!this.puedeAprobar) {
                this.error =
                    "Abre, revisa y confirma el DNI y el título antes de validar";
                return;
            }
            try {
                await firstValueFrom(this.doctoresService.validarDocumentacion(doctor, {
                    dniConforme: this.dniConforme,
                    tituloConforme: this.tituloConforme,
                    idDni: this.ultimo("DNI").idDocumento,
                    idTitulo: this.ultimo("TITULO").idDocumento,
                }));
                this.exito = "Documentación validada";
                await this.cargar();
            }
            catch (e) {
                this.error = errorText(e);
            }
            if (!this.error && this.selectedDoctor === doctor)
                await this.cargarDocumentos();
        }
        finally {
            this.guardando = false;
            this.changeDetector.markForCheck();
        }
    }
};
DoctorDocumentos = __decorate([
    Component({
        standalone: true,
        imports: [Paginador, FormsModule, FeatureNav],
        template: "<div class=\"k-module k-doctores\">\n  <header class=\"k-module-header\">\n    <div>\n      <span class=\"k-eyebrow\">GESTIÓN CLÍNICA / PERSONAL MÉDICO</span>\n      <h1 class=\"k-title\">Documentación de doctores</h1>\n      <p class=\"k-subtitle\">\n        Revisa por separado el DNI y el título profesional.\n      </p>\n    </div>\n  </header>\n  <app-feature-nav feature=\"doctores\" />\n  @if(error){\n  <div class=\"k-error\" role=\"alert\">{{error}}</div>\n  } @if(exito){\n  <div class=\"k-success\" role=\"status\">{{exito}}</div>\n  }\n  <section class=\"k-panel\">\n    <label class=\"k-field\"\n      >Doctor<select\n        [(ngModel)]=\"selectedDoctor\"\n        (ngModelChange)=\"cargarDocumentos()\"\n        [disabled]=\"guardando\"\n      >\n        <option [ngValue]=\"0\">Selecciona un doctor</option>\n        @for(d of doctores;track d.idDoctor){\n        <option [ngValue]=\"d.idDoctor\">\n          {{d.nombres}} {{d.apellidos}} — {{d.estadoDocumentacion}}\n        </option>\n        }\n      </select></label\n    >\n  </section>\n  @if(guardadoPendiente){\n  <p class=\"k-info\" role=\"status\">Hay archivos pendientes de subir.</p>\n  } @if(!selectedDoctor){\n  <section class=\"k-panel documentos-vacio\">\n    <h2>Selecciona al doctor que vas a revisar</h2>\n    <p>\n      Verás su DNI y su título profesional por separado. Abre ambos archivos\n      antes de confirmar la revisión manual.\n    </p>\n  </section>\n  }@else{\n  <div class=\"documentos-grid\">\n    @for(tipo of tipos;track selectedDoctor + ':' + tipo){\n    <section class=\"k-panel documento-card\">\n      <h2>{{tipo === 'DNI' ? 'DNI' : 'Título profesional'}}</h2>\n      @if(doctorSeleccionado;as doctor){\n      <p class=\"documento-identidad\">\n        <strong>{{doctor.nombres}} {{doctor.apellidos}}</strong\n        ><br />{{doctor.tipoDocumento}} registrado: {{doctor.numeroDocumento}}\n      </p>\n      }\n      <div class=\"documento-upload\">\n        <label class=\"k-field\"\n          >Archivo PDF o imagen (máximo 10 MB)<input\n            type=\"file\"\n            accept=\"application/pdf,image/png,image/jpeg\"\n            [disabled]=\"guardando || !selectedDoctor\"\n            (change)=\"cambiarArchivo($event,tipo)\"\n        /></label>\n        @if(archivos[tipo];as archivo){\n        <p class=\"k-info\">Pendiente de subir: {{archivo.name}}</p>\n        }\n        <button\n          class=\"k-button\"\n          [disabled]=\"guardando || !selectedDoctor || !archivos[tipo]\"\n          (click)=\"subirDocumento(tipo)\"\n        >\n          Subir {{tipo === 'DNI' ? 'DNI' : 'título'}}\n        </button>\n      </div>\n      @if(ultimo(tipo);as d){\n      <div class=\"documento-version\">\n        <h3>Última versión</h3>\n        <p class=\"documento-archivo\">\n          <span>{{d.nombreArchivo}}</span>\n          <span class=\"k-status\">{{d.estado}}</span>\n        </p>\n        @if(d.motivoRechazo){\n        <p>{{d.motivoRechazo}}</p>\n        }\n        <button class=\"k-button k-button-secondary\" (click)=\"verDocumento(d)\">\n          Ver archivo\n        </button>\n        <label class=\"k-field\"\n          >Motivo de rechazo<input\n            [(ngModel)]=\"motivos[d.idDocumento]\"\n            [disabled]=\"guardando\" /></label\n        ><button\n          class=\"k-button k-button-secondary\"\n          [disabled]=\"guardando || !motivos[d.idDocumento]?.trim()\"\n          (click)=\"rechazarDocumento(d)\"\n        >\n          Rechazar documento\n        </button>\n        @if(tipo === 'DNI'){<label class=\"revision\"\n          ><input\n            type=\"checkbox\"\n            [(ngModel)]=\"dniConforme\"\n            [disabled]=\"guardando || !abiertos.has(d.idDocumento) || d.estado === 'RECHAZADO'\"\n          />\n          Comprobé que número y nombres coinciden con el doctor\n          registrado</label\n        >}@else{<label class=\"revision\"\n          ><input\n            type=\"checkbox\"\n            [(ngModel)]=\"tituloConforme\"\n            [disabled]=\"guardando || !abiertos.has(d.idDocumento) || d.estado === 'RECHAZADO'\"\n          />\n          Título pertenece al doctor y es conforme</label\n        >}\n      </div>\n      }@else{\n      <p class=\"k-info\">Todavía no se adjuntó este documento.</p>\n      }\n    </section>\n    }\n  </div>\n  <section class=\"k-panel\">\n    <p class=\"k-info\">\n      Abre cada última versión y confirma su conformidad antes de aprobar.\n    </p>\n    <button\n      class=\"k-button\"\n      [disabled]=\"guardando || !selectedDoctor || !puedeAprobar\"\n      (click)=\"aprobarDoctor()\"\n    >\n      Validar DNI y título\n    </button>\n  </section>\n  <section class=\"k-panel\">\n    <h2>Historial de documentos</h2>\n    <div class=\"k-table-wrap\">\n      <table class=\"k-table\">\n        <thead>\n          <tr>\n            <th>Versión</th>\n            <th>Tipo</th>\n            <th>Archivo</th>\n            <th>Estado</th>\n            <th>Motivo</th>\n            <th>Acciones</th>\n          </tr>\n        </thead>\n        <tbody>\n          @for(d of tabla.contenido();track d.idDocumento){\n          <tr>\n            <td>{{d.idDocumento}}</td>\n            <td>{{d.tipoDocumento}}</td>\n            <td>{{d.nombreArchivo}}</td>\n            <td>{{d.estado}}</td>\n            <td>{{d.motivoRechazo || '—'}}</td>\n            <td>\n              <button\n                class=\"k-button k-button-small k-button-secondary\"\n                (click)=\"verDocumento(d)\"\n              >\n                Ver archivo\n              </button>\n            </td>\n          </tr>\n          }@empty{\n          <tr>\n            <td colspan=\"6\" class=\"k-empty\">Sin documentos para mostrar.</td>\n          </tr>\n          }\n        </tbody>\n      </table>\n    </div>\n    <app-paginador #tabla [registros]=\"documentos\" />\n  </section>\n  }\n</div>\n",
        styles: [],
    })
], DoctorDocumentos);
export { DoctorDocumentos };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdG9yLWRvY3VtZW50b3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9DOi9VTklWRVJTSURBRC9MUDIvU0VNQU5BMTEva2FyZWx5X21vZGVybm8vZnJvbnRlbmQvc3JjL2FwcC9mZWF0dXJlcy9kb2N0b3Jlcy9wYWdlcy9kb2N0b3ItZG9jdW1lbnRvcy8iLCJzb3VyY2VzIjpbImRvY3Rvci1kb2N1bWVudG9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtREFBbUQsQ0FBQztBQUM5RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUM3RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDN0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzlELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUVuRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFRekQsSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBZ0I7SUFDVixjQUFjLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDNUQsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNELEtBQUssR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFFNUQsZUFBZSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNoRCxRQUFRLEdBQWEsRUFBRSxDQUFDO0lBQ3hCLFVBQVUsR0FBc0IsRUFBRSxDQUFDO0lBQ25DLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDWCxLQUFLLEdB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QUFDLENBQUM7WUFDNUIsQ0FBQztZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssTUFBTTtnQkFDL0MsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNsQyxDQUFDO2dCQUFTLENBQUM7WUFDVCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JDLENBQUM7SUFDSCxDQUFDO0NBQ0YsQ0FBQTtBQWhPWSxnQkFBZ0I7SUFONUIsU0FBUyxDQUFDO1FBQ1QsVUFBVSxFQUFFLElBQUk7UUFDaEIsT0FBTyxFQUFFLENBQUMsU0FBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUM7UUFDNUMsUUFBUSxFQUFDLHl4TEFBeXhMO1FBQ2x5TCxNQUFNLEVBQUMsRUFBRTtLQUNWLENBQUM7R0FDVyxnQkFBZ0IsQ0FnTzVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGFnaW5hZG9yIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3NoYXJlZC9jb21wb25lbnRzL3BhZ2luYWRvci9wYWdpbmFkb3JcIjtcbmltcG9ydCB7IENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnQsIGluamVjdCwgT25Jbml0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEZvcm1zTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5pbXBvcnQgeyBBY3RpdmF0ZWRSb3V0ZSB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcbmltcG9ydCB7IGZpcnN0VmFsdWVGcm9tIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGVycm9yVGV4dCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb3JlL3V0aWxzL2h0dHAtZXJyb3JcIjtcbmltcG9ydCB7IEZlYXR1cmVOYXYgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2NvbXBvbmVudHMvZmVhdHVyZS1uYXYvZmVhdHVyZS1uYXZcIjtcbmltcG9ydCB7IERvY3RvciwgRG9jdW1lbnRvRG9jdG9yIH0gZnJvbSBcIi4uLy4uL21vZGVscy9kb2N0b3Jlcy5tb2RlbFwiO1xuaW1wb3J0IHsgRG9jdG9yU2VydmljZSB9IGZyb20gXCIuLi8uLi9zZXJ2aWNlcy9kb2N0b3Jlcy1zZXJ2aWNlXCI7XG5cbkBDb21wb25lbnQoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbUGFnaW5hZG9yLEZvcm1zTW9kdWxlLCBGZWF0dXJlTmF2XSxcbiAgdGVtcGxhdGU6XCI8ZGl2IGNsYXNzPVxcXCJrLW1vZHVsZSBrLWRvY3RvcmVzXFxcIj5cXG4gIDxoZWFkZXIgY2xhc3M9XFxcImstbW9kdWxlLWhlYWRlclxcXCI+XFxuICAgIDxkaXY+XFxuICAgICAgPHNwYW4gY2xhc3M9XFxcImstZXllYnJvd1xcXCI+R0VTVEnDk04gQ0zDjU5JQ0EgLyBQRVJTT05BTCBNw4lESUNPPC9zcGFuPlxcbiAgICAgIDxoMSBjbGFzcz1cXFwiay10aXRsZVxcXCI+RG9jdW1lbnRhY2nDs24gZGUgZG9jdG9yZXM8L2gxPlxcbiAgICAgIDxwIGNsYXNzPVxcXCJrLXN1YnRpdGxlXFxcIj5cXG4gICAgICAgIFJldmlzYSBwb3Igc2VwYXJhZG8gZWwgRE5JIHkgZWwgdMOtdHVsbyBwcm9mZXNpb25hbC5cXG4gICAgICA8L3A+XFxuICAgIDwvZGl2PlxcbiAgPC9oZWFkZXI+XFxuICA8YXBwLWZlYXR1cmUtbmF2IGZlYXR1cmU9XFxcImRvY3RvcmVzXFxcIiAvPlxcbiAgQGlmKGVycm9yKXtcXG4gIDxkaXYgY2xhc3M9XFxcImstZXJyb3JcXFwiIHJvbGU9XFxcImFsZXJ0XFxcIj57e2Vycm9yfX08L2Rpdj5cXG4gIH0gQGlmKGV4aXRvKXtcXG4gIDxkaXYgY2xhc3M9XFxcImstc3VjY2Vzc1xcXCIgcm9sZT1cXFwic3RhdHVzXFxcIj57e2V4aXRvfX08L2Rpdj5cXG4gIH1cXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJrLXBhbmVsXFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJrLWZpZWxkXFxcIlxcbiAgICAgID5Eb2N0b3I8c2VsZWN0XFxuICAgICAgICBbKG5nTW9kZWwpXT1cXFwic2VsZWN0ZWREb2N0b3JcXFwiXFxuICAgICAgICAobmdNb2RlbENoYW5nZSk9XFxcImNhcmdhckRvY3VtZW50b3MoKVxcXCJcXG4gICAgICAgIFtkaXNhYmxlZF09XFxcImd1YXJkYW5kb1xcXCJcXG4gICAgICA+XFxuICAgICAgICA8b3B0aW9uIFtuZ1ZhbHVlXT1cXFwiMFxcXCI+U2VsZWNjaW9uYSB1biBkb2N0b3I8L29wdGlvbj5cXG4gICAgICAgIEBmb3IoZCBvZiBkb2N0b3Jlczt0cmFjayBkLmlkRG9jdG9yKXtcXG4gICAgICAgIDxvcHRpb24gW25nVmFsdWVdPVxcXCJkLmlkRG9jdG9yXFxcIj5cXG4gICAgICAgICAge3tkLm5vbWJyZXN9fSB7e2QuYXBlbGxpZG9zfX0g4oCUIHt7ZC5lc3RhZG9Eb2N1bWVudGFjaW9ufX1cXG4gICAgICAgIDwvb3B0aW9uPlxcbiAgICAgICAgfVxcbiAgICAgIDwvc2VsZWN0PjwvbGFiZWxcXG4gICAgPlxcbiAgPC9zZWN0aW9uPlxcbiAgQGlmKGd1YXJkYWRvUGVuZGllbnRlKXtcXG4gIDxwIGNsYXNzPVxcXCJrLWluZm9cXFwiIHJvbGU9XFxcInN0YXR1c1xcXCI+SGF5IGFyY2hpdm9zIHBlbmRpZW50ZXMgZGUgc3ViaXIuPC9wPlxcbiAgfSBAaWYoIXNlbGVjdGVkRG9jdG9yKXtcXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJrLXBhbmVsIGRvY3VtZW50b3MtdmFjaW9cXFwiPlxcbiAgICA8aDI+U2VsZWNjaW9uYSBhbCBkb2N0b3IgcXVlIHZhcyBhIHJldmlzYXI8L2gyPlxcbiAgICA8cD5cXG4gICAgICBWZXLDoXMgc3UgRE5JIHkgc3UgdMOtdHVsbyBwcm9mZXNpb25hbCBwb3Igc2VwYXJhZG8uIEFicmUgYW1ib3MgYXJjaGl2b3NcXG4gICAgICBhbnRlcyBkZSBjb25maXJtYXIgbGEgcmV2aXNpw7NuIG1hbnVhbC5cXG4gICAgPC9wPlxcbiAgPC9zZWN0aW9uPlxcbiAgfUBlbHNle1xcbiAgPGRpdiBjbGFzcz1cXFwiZG9jdW1lbnRvcy1ncmlkXFxcIj5cXG4gICAgQGZvcih0aXBvIG9mIHRpcG9zO3RyYWNrIHNlbGVjdGVkRG9jdG9yICsgJzonICsgdGlwbyl7XFxuICAgIDxzZWN0aW9uIGNsYXNzPVxcXCJrLXBhbmVsIGRvY3VtZW50by1jYXJkXFxcIj5cXG4gICAgICA8aDI+e3t0aXBvID09PSAnRE5JJyA/ICdETkknIDogJ1TDrXR1bG8gcHJvZmVzaW9uYWwnfX08L2gyPlxcbiAgICAgIEBpZihkb2N0b3JTZWxlY2Npb25hZG87YXMgZG9jdG9yKXtcXG4gICAgICA8cCBjbGFzcz1cXFwiZG9jdW1lbnRvLWlkZW50aWRhZFxcXCI+XFxuICAgICAgICA8c3Ryb25nPnt7ZG9jdG9yLm5vbWJyZXN9fSB7e2RvY3Rvci5hcGVsbGlkb3N9fTwvc3Ryb25nXFxuICAgICAgICA+PGJyIC8+e3tkb2N0b3IudGlwb0RvY3VtZW50b319IHJlZ2lzdHJhZG86IHt7ZG9jdG9yLm51bWVyb0RvY3VtZW50b319XFxuICAgICAgPC9wPlxcbiAgICAgIH1cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJkb2N1bWVudG8tdXBsb2FkXFxcIj5cXG4gICAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgICAgPkFyY2hpdm8gUERGIG8gaW1hZ2VuIChtw6F4aW1vIDEwIE1CKTxpbnB1dFxcbiAgICAgICAgICAgIHR5cGU9XFxcImZpbGVcXFwiXFxuICAgICAgICAgICAgYWNjZXB0PVxcXCJhcHBsaWNhdGlvbi9wZGYsaW1hZ2UvcG5nLGltYWdlL2pwZWdcXFwiXFxuICAgICAgICAgICAgW2Rpc2FibGVkXT1cXFwiZ3VhcmRhbmRvIHx8ICFzZWxlY3RlZERvY3RvclxcXCJcXG4gICAgICAgICAgICAoY2hhbmdlKT1cXFwiY2FtYmlhckFyY2hpdm8oJGV2ZW50LHRpcG8pXFxcIlxcbiAgICAgICAgLz48L2xhYmVsPlxcbiAgICAgICAgQGlmKGFyY2hpdm9zW3RpcG9dO2FzIGFyY2hpdm8pe1xcbiAgICAgICAgPHAgY2xhc3M9XFxcImstaW5mb1xcXCI+UGVuZGllbnRlIGRlIHN1YmlyOiB7e2FyY2hpdm8ubmFtZX19PC9wPlxcbiAgICAgICAgfVxcbiAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICBjbGFzcz1cXFwiay1idXR0b25cXFwiXFxuICAgICAgICAgIFtkaXNhYmxlZF09XFxcImd1YXJkYW5kbyB8fCAhc2VsZWN0ZWREb2N0b3IgfHwgIWFyY2hpdm9zW3RpcG9dXFxcIlxcbiAgICAgICAgICAoY2xpY2spPVxcXCJzdWJpckRvY3VtZW50byh0aXBvKVxcXCJcXG4gICAgICAgID5cXG4gICAgICAgICAgU3ViaXIge3t0aXBvID09PSAnRE5JJyA/ICdETkknIDogJ3TDrXR1bG8nfX1cXG4gICAgICAgIDwvYnV0dG9uPlxcbiAgICAgIDwvZGl2PlxcbiAgICAgIEBpZih1bHRpbW8odGlwbyk7YXMgZCl7XFxuICAgICAgPGRpdiBjbGFzcz1cXFwiZG9jdW1lbnRvLXZlcnNpb25cXFwiPlxcbiAgICAgICAgPGgzPsOabHRpbWEgdmVyc2nDs248L2gzPlxcbiAgICAgICAgPHAgY2xhc3M9XFxcImRvY3VtZW50by1hcmNoaXZvXFxcIj5cXG4gICAgICAgICAgPHNwYW4+e3tkLm5vbWJyZUFyY2hpdm99fTwvc3Bhbj5cXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImstc3RhdHVzXFxcIj57e2QuZXN0YWRvfX08L3NwYW4+XFxuICAgICAgICA8L3A+XFxuICAgICAgICBAaWYoZC5tb3Rpdm9SZWNoYXpvKXtcXG4gICAgICAgIDxwPnt7ZC5tb3Rpdm9SZWNoYXpvfX08L3A+XFxuICAgICAgICB9XFxuICAgICAgICA8YnV0dG9uIGNsYXNzPVxcXCJrLWJ1dHRvbiBrLWJ1dHRvbi1zZWNvbmRhcnlcXFwiIChjbGljayk9XFxcInZlckRvY3VtZW50byhkKVxcXCI+XFxuICAgICAgICAgIFZlciBhcmNoaXZvXFxuICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgICAgPk1vdGl2byBkZSByZWNoYXpvPGlucHV0XFxuICAgICAgICAgICAgWyhuZ01vZGVsKV09XFxcIm1vdGl2b3NbZC5pZERvY3VtZW50b11cXFwiXFxuICAgICAgICAgICAgW2Rpc2FibGVkXT1cXFwiZ3VhcmRhbmRvXFxcIiAvPjwvbGFiZWxcXG4gICAgICAgID48YnV0dG9uXFxuICAgICAgICAgIGNsYXNzPVxcXCJrLWJ1dHRvbiBrLWJ1dHRvbi1zZWNvbmRhcnlcXFwiXFxuICAgICAgICAgIFtkaXNhYmxlZF09XFxcImd1YXJkYW5kbyB8fCAhbW90aXZvc1tkLmlkRG9jdW1lbnRvXT8udHJpbSgpXFxcIlxcbiAgICAgICAgICAoY2xpY2spPVxcXCJyZWNoYXphckRvY3VtZW50byhkKVxcXCJcXG4gICAgICAgID5cXG4gICAgICAgICAgUmVjaGF6YXIgZG9jdW1lbnRvXFxuICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIEBpZih0aXBvID09PSAnRE5JJyl7PGxhYmVsIGNsYXNzPVxcXCJyZXZpc2lvblxcXCJcXG4gICAgICAgICAgPjxpbnB1dFxcbiAgICAgICAgICAgIHR5cGU9XFxcImNoZWNrYm94XFxcIlxcbiAgICAgICAgICAgIFsobmdNb2RlbCldPVxcXCJkbmlDb25mb3JtZVxcXCJcXG4gICAgICAgICAgICBbZGlzYWJsZWRdPVxcXCJndWFyZGFuZG8gfHwgIWFiaWVydG9zLmhhcyhkLmlkRG9jdW1lbnRvKSB8fCBkLmVzdGFkbyA9PT0gJ1JFQ0hBWkFETydcXFwiXFxuICAgICAgICAgIC8+XFxuICAgICAgICAgIENvbXByb2LDqSBxdWUgbsO6bWVybyB5IG5vbWJyZXMgY29pbmNpZGVuIGNvbiBlbCBkb2N0b3JcXG4gICAgICAgICAgcmVnaXN0cmFkbzwvbGFiZWxcXG4gICAgICAgID59QGVsc2V7PGxhYmVsIGNsYXNzPVxcXCJyZXZpc2lvblxcXCJcXG4gICAgICAgICAgPjxpbnB1dFxcbiAgICAgICAgICAgIHR5cGU9XFxcImNoZWNrYm94XFxcIlxcbiAgICAgICAgICAgIFsobmdNb2RlbCldPVxcXCJ0aXR1bG9Db25mb3JtZVxcXCJcXG4gICAgICAgICAgICBbZGlzYWJsZWRdPVxcXCJndWFyZGFuZG8gfHwgIWFiaWVydG9zLmhhcyhkLmlkRG9jdW1lbnRvKSB8fCBkLmVzdGFkbyA9PT0gJ1JFQ0hBWkFETydcXFwiXFxuICAgICAgICAgIC8+XFxuICAgICAgICAgIFTDrXR1bG8gcGVydGVuZWNlIGFsIGRvY3RvciB5IGVzIGNvbmZvcm1lPC9sYWJlbFxcbiAgICAgICAgPn1cXG4gICAgICA8L2Rpdj5cXG4gICAgICB9QGVsc2V7XFxuICAgICAgPHAgY2xhc3M9XFxcImstaW5mb1xcXCI+VG9kYXbDrWEgbm8gc2UgYWRqdW50w7MgZXN0ZSBkb2N1bWVudG8uPC9wPlxcbiAgICAgIH1cXG4gICAgPC9zZWN0aW9uPlxcbiAgICB9XFxuICA8L2Rpdj5cXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJrLXBhbmVsXFxcIj5cXG4gICAgPHAgY2xhc3M9XFxcImstaW5mb1xcXCI+XFxuICAgICAgQWJyZSBjYWRhIMO6bHRpbWEgdmVyc2nDs24geSBjb25maXJtYSBzdSBjb25mb3JtaWRhZCBhbnRlcyBkZSBhcHJvYmFyLlxcbiAgICA8L3A+XFxuICAgIDxidXR0b25cXG4gICAgICBjbGFzcz1cXFwiay1idXR0b25cXFwiXFxuICAgICAgW2Rpc2FibGVkXT1cXFwiZ3VhcmRhbmRvIHx8ICFzZWxlY3RlZERvY3RvciB8fCAhcHVlZGVBcHJvYmFyXFxcIlxcbiAgICAgIChjbGljayk9XFxcImFwcm9iYXJEb2N0b3IoKVxcXCJcXG4gICAgPlxcbiAgICAgIFZhbGlkYXIgRE5JIHkgdMOtdHVsb1xcbiAgICA8L2J1dHRvbj5cXG4gIDwvc2VjdGlvbj5cXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJrLXBhbmVsXFxcIj5cXG4gICAgPGgyPkhpc3RvcmlhbCBkZSBkb2N1bWVudG9zPC9oMj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay10YWJsZS13cmFwXFxcIj5cXG4gICAgICA8dGFibGUgY2xhc3M9XFxcImstdGFibGVcXFwiPlxcbiAgICAgICAgPHRoZWFkPlxcbiAgICAgICAgICA8dHI+XFxuICAgICAgICAgICAgPHRoPlZlcnNpw7NuPC90aD5cXG4gICAgICAgICAgICA8dGg+VGlwbzwvdGg+XFxuICAgICAgICAgICAgPHRoPkFyY2hpdm88L3RoPlxcbiAgICAgICAgICAgIDx0aD5Fc3RhZG88L3RoPlxcbiAgICAgICAgICAgIDx0aD5Nb3Rpdm88L3RoPlxcbiAgICAgICAgICAgIDx0aD5BY2Npb25lczwvdGg+XFxuICAgICAgICAgIDwvdHI+XFxuICAgICAgICA8L3RoZWFkPlxcbiAgICAgICAgPHRib2R5PlxcbiAgICAgICAgICBAZm9yKGQgb2YgdGFibGEuY29udGVuaWRvKCk7dHJhY2sgZC5pZERvY3VtZW50byl7XFxuICAgICAgICAgIDx0cj5cXG4gICAgICAgICAgICA8dGQ+e3tkLmlkRG9jdW1lbnRvfX08L3RkPlxcbiAgICAgICAgICAgIDx0ZD57e2QudGlwb0RvY3VtZW50b319PC90ZD5cXG4gICAgICAgICAgICA8dGQ+e3tkLm5vbWJyZUFyY2hpdm99fTwvdGQ+XFxuICAgICAgICAgICAgPHRkPnt7ZC5lc3RhZG99fTwvdGQ+XFxuICAgICAgICAgICAgPHRkPnt7ZC5tb3Rpdm9SZWNoYXpvIHx8ICfigJQnfX08L3RkPlxcbiAgICAgICAgICAgIDx0ZD5cXG4gICAgICAgICAgICAgIDxidXR0b25cXG4gICAgICAgICAgICAgICAgY2xhc3M9XFxcImstYnV0dG9uIGstYnV0dG9uLXNtYWxsIGstYnV0dG9uLXNlY29uZGFyeVxcXCJcXG4gICAgICAgICAgICAgICAgKGNsaWNrKT1cXFwidmVyRG9jdW1lbnRvKGQpXFxcIlxcbiAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICBWZXIgYXJjaGl2b1xcbiAgICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgPC90ZD5cXG4gICAgICAgICAgPC90cj5cXG4gICAgICAgICAgfUBlbXB0eXtcXG4gICAgICAgICAgPHRyPlxcbiAgICAgICAgICAgIDx0ZCBjb2xzcGFuPVxcXCI2XFxcIiBjbGFzcz1cXFwiay1lbXB0eVxcXCI+U2luIGRvY3VtZW50b3MgcGFyYSBtb3N0cmFyLjwvdGQ+XFxuICAgICAgICAgIDwvdHI+XFxuICAgICAgICAgIH1cXG4gICAgICAgIDwvdGJvZHk+XFxuICAgICAgPC90YWJsZT5cXG4gICAgPC9kaXY+XFxuICAgIDxhcHAtcGFnaW5hZG9yICN0YWJsYSBbcmVnaXN0cm9zXT1cXFwiZG9jdW1lbnRvc1xcXCIgLz5cXG4gIDwvc2VjdGlvbj5cXG4gIH1cXG48L2Rpdj5cXG5cIixcbiAgc3R5bGVzOltdLFxufSlcbmV4cG9ydCBjbGFzcyBEb2N0b3JEb2N1bWVudG9zIGltcGxlbWVudHMgT25Jbml0IHtcbiAgcHJpdmF0ZSByZWFkb25seSBjaGFuZ2VEZXRlY3RvciA9IGluamVjdChDaGFuZ2VEZXRlY3RvclJlZik7XG4gIGd1YXJkYW5kbyA9IGZhbHNlO1xuICBwcml2YXRlIHJlYWRvbmx5IHJvdXRlID0gaW5qZWN0KEFjdGl2YXRlZFJvdXRlLCB7IG9wdGlvbmFsOiB0cnVlIH0pO1xuXG4gIHByaXZhdGUgZG9jdG9yZXNTZXJ2aWNlID0gaW5qZWN0KERvY3RvclNlcnZpY2UpO1xuICBkb2N0b3JlczogRG9jdG9yW10gPSBbXTtcbiAgZG9jdW1lbnRvczogRG9jdW1lbnRvRG9jdG9yW10gPSBbXTtcbiAgZXJyb3IgPSBcIlwiO1xuICBleGl0byA9IFwiXCI7XG4gIHNlbGVjdGVkRG9jdG9yID0gMDtcbiAgcmVhZG9ubHkgdGlwb3MgPSBbXCJETklcIiwgXCJUSVRVTE9cIl07XG4gIGFyY2hpdm9zOiBSZWNvcmQ8c3RyaW5nLCBGaWxlIHwgbnVsbD4gPSB7fTtcbiAgbW90aXZvczogUmVjb3JkPG51bWJlciwgc3RyaW5nPiA9IHt9O1xuICBkbmlDb25mb3JtZSA9IGZhbHNlO1xuICB0aXR1bG9Db25mb3JtZSA9IGZhbHNlO1xuICBhYmllcnRvcyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICBwcml2YXRlIGNhcmdhID0gMDtcbiAgcmVzZXRSZXZpc2lvbigpIHtcbiAgICB0aGlzLmRuaUNvbmZvcm1lID0gZmFsc2U7XG4gICAgdGhpcy50aXR1bG9Db25mb3JtZSA9IGZhbHNlO1xuICAgIHRoaXMuYWJpZXJ0b3MuY2xlYXIoKTtcbiAgfVxuICB1bHRpbW8odGlwbzogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnRvc1xuICAgICAgLmZpbHRlcigoZCkgPT4gZC50aXBvRG9jdW1lbnRvID09PSB0aXBvKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGIuaWREb2N1bWVudG8gLSBhLmlkRG9jdW1lbnRvKVswXTtcbiAgfVxuICBnZXQgcHVlZGVBcHJvYmFyKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLnRpcG9zLmV2ZXJ5KCh0aXBvKSA9PiB7XG4gICAgICAgIGNvbnN0IGQgPSB0aGlzLnVsdGltbyh0aXBvKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAhIWQgJiZcbiAgICAgICAgICBbXCJQRU5ESUVOVEVcIiwgXCJWQUxJREFET1wiXS5pbmNsdWRlcyhkLmVzdGFkbykgJiZcbiAgICAgICAgICB0aGlzLmFiaWVydG9zLmhhcyhkLmlkRG9jdW1lbnRvKVxuICAgICAgICApO1xuICAgICAgfSkgJiZcbiAgICAgIHRoaXMuZG5pQ29uZm9ybWUgJiZcbiAgICAgIHRoaXMudGl0dWxvQ29uZm9ybWVcbiAgICApO1xuICB9XG4gIGFzeW5jIHZlckRvY3VtZW50byhkOiBEb2N1bWVudG9Eb2N0b3IpIHtcbiAgICBjb25zdCBkb2N0b3IgPSB0aGlzLnNlbGVjdGVkRG9jdG9yO1xuICAgIGNvbnN0IHZlbnRhbmEgPSB3aW5kb3cub3BlbihcIlwiLCBcIl9ibGFua1wiKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IGZpcnN0VmFsdWVGcm9tKFxuICAgICAgICB0aGlzLmRvY3RvcmVzU2VydmljZS5kZXNjYXJnYXJEb2N1bWVudG8oZG9jdG9yLCBkLmlkRG9jdW1lbnRvKSxcbiAgICAgICk7XG4gICAgICBpZiAodGhpcy5zZWxlY3RlZERvY3RvciAhPT0gZG9jdG9yKSB7XG4gICAgICAgIHZlbnRhbmE/LmNsb3NlKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICBpZiAodmVudGFuYSkge1xuICAgICAgICB2ZW50YW5hLmxvY2F0aW9uLmhyZWYgPSB1cmw7XG4gICAgICAgIHRoaXMuYWJpZXJ0b3MuYWRkKGQuaWREb2N1bWVudG8pO1xuICAgICAgfVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCksIDYwMDAwKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB2ZW50YW5hPy5jbG9zZSgpO1xuICAgICAgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbiAgYXN5bmMgcmVjaGF6YXJEb2N1bWVudG8oZDogRG9jdW1lbnRvRG9jdG9yKSB7XG4gICAgaWYgKHRoaXMuZ3VhcmRhbmRvKSByZXR1cm47XG4gICAgY29uc3QgbW90aXZvID0gdGhpcy5tb3Rpdm9zW2QuaWREb2N1bWVudG9dPy50cmltKCk7XG4gICAgaWYgKCFtb3Rpdm8pIHtcbiAgICAgIHRoaXMuZXJyb3IgPSBcIkVzY3JpYmUgZWwgbW90aXZvIGRlbCByZWNoYXpvXCI7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZ3VhcmRhbmRvID0gdHJ1ZTtcbiAgICB0aGlzLmVycm9yID0gXCJcIjtcbiAgICB0aGlzLmV4aXRvID0gXCJcIjtcbiAgICBjb25zdCBkb2N0b3IgPSB0aGlzLnNlbGVjdGVkRG9jdG9yO1xuICAgIHRoaXMucmVzZXRSZXZpc2lvbigpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBmaXJzdFZhbHVlRnJvbShcbiAgICAgICAgdGhpcy5kb2N0b3Jlc1NlcnZpY2UucmVjaGF6YXJEb2N1bWVudG8oZG9jdG9yLCBkLmlkRG9jdW1lbnRvLCBtb3Rpdm8pLFxuICAgICAgKTtcbiAgICAgIGlmIChkb2N0b3IgPT09IHRoaXMuc2VsZWN0ZWREb2N0b3IpIHtcbiAgICAgICAgdGhpcy5leGl0byA9IFwiRG9jdW1lbnRvIHJlY2hhemFkb1wiO1xuICAgICAgICBhd2FpdCB0aGlzLmNhcmdhckRvY3VtZW50b3MoKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuY2FyZ2FyKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5ndWFyZGFuZG8gPSBmYWxzZTtcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG4gIGdldCBkb2N0b3JTZWxlY2Npb25hZG8oKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9jdG9yZXMuZmluZCgoZCkgPT4gZC5pZERvY3RvciA9PT0gdGhpcy5zZWxlY3RlZERvY3Rvcik7XG4gIH1cbiAgZ2V0IGd1YXJkYWRvUGVuZGllbnRlKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuYXJjaGl2b3MpLnNvbWUoQm9vbGVhbik7XG4gIH1cbiAgbmdPbkluaXQoKSB7XG4gICAgY29uc3QgaWQgPSBOdW1iZXIodGhpcy5yb3V0ZT8uc25hcHNob3QucXVlcnlQYXJhbU1hcC5nZXQoXCJkb2N0b3JcIikpO1xuICAgIGlmIChpZCA+IDApIHRoaXMuc2VsZWN0ZWREb2N0b3IgPSBpZDtcbiAgICB2b2lkIHRoaXMuY2FyZ2FyKCk7XG4gICAgaWYgKGlkID4gMCkgdm9pZCB0aGlzLmNhcmdhckRvY3VtZW50b3MoKTtcbiAgfVxuICBhc3luYyBjYXJnYXIoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuZG9jdG9yZXMgPSBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLmRvY3RvcmVzU2VydmljZS5saXN0YXIoKSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBlcnJvclRleHQoZSk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG4gIGFzeW5jIGNhcmdhckRvY3VtZW50b3MocHJlc2VydmFyUmV2aXNpb24gPSBmYWxzZSwgcHJlc2VydmFyQXJjaGl2b3MgPSBmYWxzZSkge1xuICAgIGNvbnN0IGNhcmdhID0gKyt0aGlzLmNhcmdhO1xuICAgIGlmICghcHJlc2VydmFyUmV2aXNpb24pIHRoaXMucmVzZXRSZXZpc2lvbigpO1xuICAgIGlmICghcHJlc2VydmFyQXJjaGl2b3MgJiYgIXByZXNlcnZhclJldmlzaW9uKSB0aGlzLmFyY2hpdm9zID0ge307XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRvY3RvciA9IHRoaXMuc2VsZWN0ZWREb2N0b3I7XG4gICAgICB0aGlzLmRvY3VtZW50b3MgPSBbXTtcbiAgICAgIGlmICghZG9jdG9yKSByZXR1cm47XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkb2N1bWVudG9zID0gYXdhaXQgZmlyc3RWYWx1ZUZyb20oXG4gICAgICAgICAgdGhpcy5kb2N0b3Jlc1NlcnZpY2UuZG9jdW1lbnRvcyhkb2N0b3IpLFxuICAgICAgICApO1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZERvY3RvciA9PT0gZG9jdG9yICYmIGNhcmdhID09PSB0aGlzLmNhcmdhKVxuICAgICAgICAgIHRoaXMuZG9jdW1lbnRvcyA9IGRvY3VtZW50b3M7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkRG9jdG9yID09PSBkb2N0b3IgJiYgY2FyZ2EgPT09IHRoaXMuY2FyZ2EpXG4gICAgICAgICAgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbiAgY2FtYmlhckFyY2hpdm8oZTogRXZlbnQsIHRpcG86IHN0cmluZykge1xuICAgIHRoaXMuYXJjaGl2b3NbdGlwb10gPSAoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkuZmlsZXM/Lml0ZW0oMCkgfHwgbnVsbDtcbiAgfVxuICBhc3luYyBzdWJpckRvY3VtZW50byh0aXBvOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5ndWFyZGFuZG8pIHJldHVybjtcbiAgICBjb25zdCBhcmNoaXZvID0gdGhpcy5hcmNoaXZvc1t0aXBvXTtcbiAgICB0aGlzLnJlc2V0UmV2aXNpb24oKTtcbiAgICB0aGlzLmd1YXJkYW5kbyA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZXJyb3IgPSBcIlwiO1xuICAgICAgdGhpcy5leGl0byA9IFwiXCI7XG4gICAgICBpZiAoIWFyY2hpdm8gfHwgIXRoaXMuc2VsZWN0ZWREb2N0b3IpIHJldHVybjtcbiAgICAgIGlmIChhcmNoaXZvLnNpemUgPiAxMCAqIDEwMjQgKiAxMDI0KSB7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBcIkVsIGFyY2hpdm8gc3VwZXJhIGVsIG3DoXhpbW8gZGUgMTAgTUJcIjtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZmlyc3RWYWx1ZUZyb20oXG4gICAgICAgICAgdGhpcy5kb2N0b3Jlc1NlcnZpY2Uuc3ViaXIodGhpcy5zZWxlY3RlZERvY3RvciwgdGlwbywgYXJjaGl2byksXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZXhpdG8gPSBcIkRvY3VtZW50byByZWNpYmlkb1wiO1xuICAgICAgICB0aGlzLmFyY2hpdm9zW3RpcG9dID0gbnVsbDtcbiAgICAgICAgYXdhaXQgdGhpcy5jYXJnYXJEb2N1bWVudG9zKGZhbHNlLCB0cnVlKTtcbiAgICAgICAgYXdhaXQgdGhpcy5jYXJnYXIoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5ndWFyZGFuZG8gPSBmYWxzZTtcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG4gIGFzeW5jIGFwcm9iYXJEb2N0b3IoKSB7XG4gICAgaWYgKHRoaXMuZ3VhcmRhbmRvKSByZXR1cm47XG4gICAgdGhpcy5ndWFyZGFuZG8gPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmVycm9yID0gXCJcIjtcbiAgICAgIHRoaXMuZXhpdG8gPSBcIlwiO1xuICAgICAgY29uc3QgZG9jdG9yID0gdGhpcy5zZWxlY3RlZERvY3RvcjtcbiAgICAgIGlmICghZG9jdG9yKSB7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBcIlNlbGVjY2lvbmEgdW4gZG9jdG9yXCI7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuY2FyZ2FyRG9jdW1lbnRvcyh0cnVlKTtcbiAgICAgIGlmICh0aGlzLmVycm9yIHx8IHRoaXMuc2VsZWN0ZWREb2N0b3IgIT09IGRvY3RvcikgcmV0dXJuO1xuICAgICAgY29uc3QgZmFsdGFudGVzID0gW1wiRE5JXCIsIFwiVElUVUxPXCJdLmZpbHRlcigodGlwbykgPT4ge1xuICAgICAgICBjb25zdCB1bHRpbW8gPSB0aGlzLmRvY3VtZW50b3NcbiAgICAgICAgICAuZmlsdGVyKChkKSA9PiBkLnRpcG9Eb2N1bWVudG8gPT09IHRpcG8pXG4gICAgICAgICAgLnNvcnQoKGEsIGIpID0+IE51bWJlcihiLmlkRG9jdW1lbnRvKSAtIE51bWJlcihhLmlkRG9jdW1lbnRvKSlbMF07XG4gICAgICAgIHJldHVybiAhdWx0aW1vIHx8ICFbXCJQRU5ESUVOVEVcIiwgXCJWQUxJREFET1wiXS5pbmNsdWRlcyh1bHRpbW8uZXN0YWRvKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKGZhbHRhbnRlcy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5lcnJvciA9XG4gICAgICAgICAgXCJBZGp1bnRhIHVuIEROSSB5IHVuIHTDrXR1bG8gcHJvZmVzaW9uYWwgdmlnZW50ZXMgYW50ZXMgZGUgdmFsaWRhci4gRmFsdGEgbyBmdWUgcmVjaGF6YWRvOiBcIiArXG4gICAgICAgICAgZmFsdGFudGVzXG4gICAgICAgICAgICAubWFwKCh0aXBvKSA9PiAodGlwbyA9PT0gXCJUSVRVTE9cIiA/IFwiVMOtdHVsbyBwcm9mZXNpb25hbFwiIDogdGlwbykpXG4gICAgICAgICAgICAuam9pbihcIiwgXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMucHVlZGVBcHJvYmFyKSB7XG4gICAgICAgIHRoaXMuZXJyb3IgPVxuICAgICAgICAgIFwiQWJyZSwgcmV2aXNhIHkgY29uZmlybWEgZWwgRE5JIHkgZWwgdMOtdHVsbyBhbnRlcyBkZSB2YWxpZGFyXCI7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGZpcnN0VmFsdWVGcm9tKFxuICAgICAgICAgIHRoaXMuZG9jdG9yZXNTZXJ2aWNlLnZhbGlkYXJEb2N1bWVudGFjaW9uKGRvY3Rvciwge1xuICAgICAgICAgICAgZG5pQ29uZm9ybWU6IHRoaXMuZG5pQ29uZm9ybWUsXG4gICAgICAgICAgICB0aXR1bG9Db25mb3JtZTogdGhpcy50aXR1bG9Db25mb3JtZSxcbiAgICAgICAgICAgIGlkRG5pOiB0aGlzLnVsdGltbyhcIkROSVwiKSEuaWREb2N1bWVudG8sXG4gICAgICAgICAgICBpZFRpdHVsbzogdGhpcy51bHRpbW8oXCJUSVRVTE9cIikhLmlkRG9jdW1lbnRvLFxuICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLmV4aXRvID0gXCJEb2N1bWVudGFjacOzbiB2YWxpZGFkYVwiO1xuICAgICAgICBhd2FpdCB0aGlzLmNhcmdhcigpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLmVycm9yID0gZXJyb3JUZXh0KGUpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmVycm9yICYmIHRoaXMuc2VsZWN0ZWREb2N0b3IgPT09IGRvY3RvcilcbiAgICAgICAgYXdhaXQgdGhpcy5jYXJnYXJEb2N1bWVudG9zKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZ3VhcmRhbmRvID0gZmFsc2U7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxufVxuIl19
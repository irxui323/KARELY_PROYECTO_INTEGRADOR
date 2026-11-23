var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Paginador } from '../../../../shared/components/paginador/paginador.mjs';
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { errorText } from '../../../../core/utils/http-error.mjs';
import { FeatureNav } from '../../../../shared/components/feature-nav/feature-nav.mjs';
import { ModuleHeader } from '../../../../shared/components/module-header/module-header.mjs';
import { AdministracionService } from '../../services/administracion-service.mjs';
let ParametroForm = class ParametroForm {
    changeDetector = inject(ChangeDetectorRef);
    guardando = false;
    constructor() {
        this.config = { nombre: "", valor: "" };
    }
    administracionService = inject(AdministracionService);
    error = "";
    exito = "";
    parametros = [];
    configGroup = new FormGroup({
        nombre: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        valor: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });
    get config() {
        return this.configGroup.getRawValue();
    }
    set config(value) {
        this.configGroup.reset(value);
    }
    ngOnInit() {
        void this.cargar();
    }
    async cargar() {
        try {
            try {
                this.parametros = await firstValueFrom(this.administracionService.parametros());
            }
            catch (e) {
                this.error = errorText(e);
            }
        }
        finally {
            this.changeDetector.markForCheck();
        }
    }
    async ejecutar(a, d) {
        if (this.guardando)
            return;
        this.guardando = true;
        try {
            this.configGroup.patchValue(d);
            if (this.configGroup.invalid) {
                this.configGroup.markAllAsTouched();
                this.exito = "";
                this.error = "Selecciona el parámetro e introduce su valor.";
                return;
            }
            this.error = "";
            this.exito = "";
            try {
                await firstValueFrom(this.administracionService.ejecutar(a, d));
                this.exito = "Actualización guardada";
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
    async cambiarParametro() {
        await this.ejecutar("parametro-cambiar", this.config);
    }
};
ParametroForm = __decorate([
    Component({
        standalone: true,
        imports: [Paginador, ReactiveFormsModule, FeatureNav, ModuleHeader],
        template: "<div class=\"k-module k-admin\">\n  <header\n    appModuleHeader\n    class=\"k-module-header\"\n    contexto=\"CONFIGURACIÓN / ADMINISTRACIÓN\"\n    titulo=\"Administración\"\n    descripcion=\"Gestiona usuarios, parámetros, catálogos, notificaciones y auditoría.\"\n    textoActualizar=\"↻ Actualizar información\"\n    (actualizar)=\"cargar()\"\n  ></header>\n  <app-feature-nav feature=\"administracion\" />\n  @if(error){\n  <div class=\"k-error\" role=\"alert\">{{error}}</div>\n  }@if(exito){\n  <div class=\"k-success\" role=\"status\">{{exito}}</div>\n  }\n  <section class=\"k-panel\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>Parámetros configurables</h2>\n        <p>Consulta los valores activos que utiliza el sistema.</p>\n      </div>\n    </div>\n    <div class=\"k-table-wrap\">\n      <table class=\"k-table\">\n        <thead>\n          <tr>\n            <th>Parámetro</th>\n            <th>Valor</th>\n            <th>Descripción</th>\n          </tr>\n        </thead>\n        <tbody>\n          @for(p of tabla.contenido();track p.idParametro){\n          <tr>\n            <td><strong>{{p.nombre}}</strong></td>\n            <td>{{p.valor}}</td>\n            <td>{{p.descripcion}}</td>\n          </tr>\n          }@empty{\n          <tr>\n            <td class=\"k-empty\" colspan=\"3\">No hay parámetros registrados.</td>\n          </tr>\n          }\n        </tbody>\n      </table>\n    </div>\n    <app-paginador #tabla [registros]=\"parametros\" />\n  </section>\n  <section class=\"k-panel\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>Actualizar parámetro</h2>\n        <p>El cambio queda registrado en el historial del sistema.</p>\n      </div>\n    </div>\n    <div class=\"k-form\">\n      <label class=\"k-field\"\n        >Parámetro<select [formControl]=\"configGroup.controls.nombre\">\n          <option value=\"\">Selecciona un parámetro</option>\n          @for(p of parametros;track p.idParametro){\n          <option [value]=\"p.nombre\">{{p.nombre}}</option>\n          }\n        </select></label\n      ><label class=\"k-field\"\n        >Nuevo valor<input\n          [formControl]=\"configGroup.controls.valor\"\n          placeholder=\"Introduce el nuevo valor\"\n      /></label>\n    </div>\n    <div class=\"k-actions\">\n      <button\n        class=\"k-button\"\n        [disabled]=\"guardando || !config.nombre || !config.valor\"\n        (click)=\"cambiarParametro()\"\n      >\n        Actualizar parámetro\n      </button>\n    </div>\n  </section>\n</div>\n",
        styles: [],
    })
], ParametroForm);
export { ParametroForm };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldHJvLWZvcm0uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9DOi9VTklWRVJTSURBRC9MUDIvU0VNQU5BMTEva2FyZWx5X21vZGVybm8vZnJvbnRlbmQvc3JjL2FwcC9mZWF0dXJlcy9hZG1pbmlzdHJhY2lvbi9wYWdlcy9wYXJhbWV0cm8tZm9ybS8iLCJzb3VyY2VzIjpbInBhcmFtZXRyby1mb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtREFBbUQsQ0FBQztBQUM5RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUM3RSxPQUFPLEVBQ0wsV0FBVyxFQUNYLFNBQVMsRUFDVCxtQkFBbUIsRUFDbkIsVUFBVSxHQUNYLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN0QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDOUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQ25GLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyREFBMkQsQ0FBQztBQU16RixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQVF2RSxJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFhO0lBQ1AsY0FBYyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzVELFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDbEI7UUFDRSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDMUMsQ0FBQztJQUNPLHFCQUFxQixHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQzlELEtBQUssR0FBRyxFQUFFLENBQUM7SUFDWCxLQUFLLEdB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LFNBQVMsQ0FBQztRQUNULFVBQVUsRUFBRSxJQUFJO1FBQ2hCLE9BQU8sRUFBRSxDQUFDLFNBQVMsRUFBQyxtQkFBbUIsRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDO1FBQ2xFLFFBQVEsRUFBQyx1Z0ZBQXVnRjtRQUNoaEYsTUFBTSxFQUFDLEVBQUU7S0FDVixDQUFDO0dBQ1csYUFBYSxDQXNFekIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQYWdpbmFkb3IgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2NvbXBvbmVudHMvcGFnaW5hZG9yL3BhZ2luYWRvclwiO1xuaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgaW5qZWN0LCBPbkluaXQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtcbiAgRm9ybUNvbnRyb2wsXG4gIEZvcm1Hcm91cCxcbiAgUmVhY3RpdmVGb3Jtc01vZHVsZSxcbiAgVmFsaWRhdG9ycyxcbn0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5pbXBvcnQgeyBmaXJzdFZhbHVlRnJvbSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBlcnJvclRleHQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29yZS91dGlscy9odHRwLWVycm9yXCI7XG5pbXBvcnQgeyBGZWF0dXJlTmF2IH0gZnJvbSBcIi4uLy4uLy4uLy4uL3NoYXJlZC9jb21wb25lbnRzL2ZlYXR1cmUtbmF2L2ZlYXR1cmUtbmF2XCI7XG5pbXBvcnQgeyBNb2R1bGVIZWFkZXIgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2hhcmVkL2NvbXBvbmVudHMvbW9kdWxlLWhlYWRlci9tb2R1bGUtaGVhZGVyXCI7XG5pbXBvcnQge1xuICBBZG1pbmlzdHJhY2lvbkFjY2lvbixcbiAgQWRtaW5pc3RyYWNpb25SZXF1ZXN0LFxuICBQYXJhbWV0cm8sXG59IGZyb20gXCIuLi8uLi9tb2RlbHMvYWRtaW5pc3RyYWNpb24ubW9kZWxcIjtcbmltcG9ydCB7IEFkbWluaXN0cmFjaW9uU2VydmljZSB9IGZyb20gXCIuLi8uLi9zZXJ2aWNlcy9hZG1pbmlzdHJhY2lvbi1zZXJ2aWNlXCI7XG5cbkBDb21wb25lbnQoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbUGFnaW5hZG9yLFJlYWN0aXZlRm9ybXNNb2R1bGUsIEZlYXR1cmVOYXYsIE1vZHVsZUhlYWRlcl0sXG4gIHRlbXBsYXRlOlwiPGRpdiBjbGFzcz1cXFwiay1tb2R1bGUgay1hZG1pblxcXCI+XFxuICA8aGVhZGVyXFxuICAgIGFwcE1vZHVsZUhlYWRlclxcbiAgICBjbGFzcz1cXFwiay1tb2R1bGUtaGVhZGVyXFxcIlxcbiAgICBjb250ZXh0bz1cXFwiQ09ORklHVVJBQ0nDk04gLyBBRE1JTklTVFJBQ0nDk05cXFwiXFxuICAgIHRpdHVsbz1cXFwiQWRtaW5pc3RyYWNpw7NuXFxcIlxcbiAgICBkZXNjcmlwY2lvbj1cXFwiR2VzdGlvbmEgdXN1YXJpb3MsIHBhcsOhbWV0cm9zLCBjYXTDoWxvZ29zLCBub3RpZmljYWNpb25lcyB5IGF1ZGl0b3LDrWEuXFxcIlxcbiAgICB0ZXh0b0FjdHVhbGl6YXI9XFxcIuKGuyBBY3R1YWxpemFyIGluZm9ybWFjacOzblxcXCJcXG4gICAgKGFjdHVhbGl6YXIpPVxcXCJjYXJnYXIoKVxcXCJcXG4gID48L2hlYWRlcj5cXG4gIDxhcHAtZmVhdHVyZS1uYXYgZmVhdHVyZT1cXFwiYWRtaW5pc3RyYWNpb25cXFwiIC8+XFxuICBAaWYoZXJyb3Ipe1xcbiAgPGRpdiBjbGFzcz1cXFwiay1lcnJvclxcXCIgcm9sZT1cXFwiYWxlcnRcXFwiPnt7ZXJyb3J9fTwvZGl2PlxcbiAgfUBpZihleGl0byl7XFxuICA8ZGl2IGNsYXNzPVxcXCJrLXN1Y2Nlc3NcXFwiIHJvbGU9XFxcInN0YXR1c1xcXCI+e3tleGl0b319PC9kaXY+XFxuICB9XFxuICA8c2VjdGlvbiBjbGFzcz1cXFwiay1wYW5lbFxcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcImstc2VjdGlvbi1oZWFkaW5nXFxcIj5cXG4gICAgICA8ZGl2PlxcbiAgICAgICAgPGgyPlBhcsOhbWV0cm9zIGNvbmZpZ3VyYWJsZXM8L2gyPlxcbiAgICAgICAgPHA+Q29uc3VsdGEgbG9zIHZhbG9yZXMgYWN0aXZvcyBxdWUgdXRpbGl6YSBlbCBzaXN0ZW1hLjwvcD5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcImstdGFibGUtd3JhcFxcXCI+XFxuICAgICAgPHRhYmxlIGNsYXNzPVxcXCJrLXRhYmxlXFxcIj5cXG4gICAgICAgIDx0aGVhZD5cXG4gICAgICAgICAgPHRyPlxcbiAgICAgICAgICAgIDx0aD5QYXLDoW1ldHJvPC90aD5cXG4gICAgICAgICAgICA8dGg+VmFsb3I8L3RoPlxcbiAgICAgICAgICAgIDx0aD5EZXNjcmlwY2nDs248L3RoPlxcbiAgICAgICAgICA8L3RyPlxcbiAgICAgICAgPC90aGVhZD5cXG4gICAgICAgIDx0Ym9keT5cXG4gICAgICAgICAgQGZvcihwIG9mIHRhYmxhLmNvbnRlbmlkbygpO3RyYWNrIHAuaWRQYXJhbWV0cm8pe1xcbiAgICAgICAgICA8dHI+XFxuICAgICAgICAgICAgPHRkPjxzdHJvbmc+e3twLm5vbWJyZX19PC9zdHJvbmc+PC90ZD5cXG4gICAgICAgICAgICA8dGQ+e3twLnZhbG9yfX08L3RkPlxcbiAgICAgICAgICAgIDx0ZD57e3AuZGVzY3JpcGNpb259fTwvdGQ+XFxuICAgICAgICAgIDwvdHI+XFxuICAgICAgICAgIH1AZW1wdHl7XFxuICAgICAgICAgIDx0cj5cXG4gICAgICAgICAgICA8dGQgY2xhc3M9XFxcImstZW1wdHlcXFwiIGNvbHNwYW49XFxcIjNcXFwiPk5vIGhheSBwYXLDoW1ldHJvcyByZWdpc3RyYWRvcy48L3RkPlxcbiAgICAgICAgICA8L3RyPlxcbiAgICAgICAgICB9XFxuICAgICAgICA8L3Rib2R5PlxcbiAgICAgIDwvdGFibGU+XFxuICAgIDwvZGl2PlxcbiAgICA8YXBwLXBhZ2luYWRvciAjdGFibGEgW3JlZ2lzdHJvc109XFxcInBhcmFtZXRyb3NcXFwiIC8+XFxuICA8L3NlY3Rpb24+XFxuICA8c2VjdGlvbiBjbGFzcz1cXFwiay1wYW5lbFxcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcImstc2VjdGlvbi1oZWFkaW5nXFxcIj5cXG4gICAgICA8ZGl2PlxcbiAgICAgICAgPGgyPkFjdHVhbGl6YXIgcGFyw6FtZXRybzwvaDI+XFxuICAgICAgICA8cD5FbCBjYW1iaW8gcXVlZGEgcmVnaXN0cmFkbyBlbiBlbCBoaXN0b3JpYWwgZGVsIHNpc3RlbWEuPC9wPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1mb3JtXFxcIj5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+UGFyw6FtZXRybzxzZWxlY3QgW2Zvcm1Db250cm9sXT1cXFwiY29uZmlnR3JvdXAuY29udHJvbHMubm9tYnJlXFxcIj5cXG4gICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXFxcIj5TZWxlY2Npb25hIHVuIHBhcsOhbWV0cm88L29wdGlvbj5cXG4gICAgICAgICAgQGZvcihwIG9mIHBhcmFtZXRyb3M7dHJhY2sgcC5pZFBhcmFtZXRybyl7XFxuICAgICAgICAgIDxvcHRpb24gW3ZhbHVlXT1cXFwicC5ub21icmVcXFwiPnt7cC5ub21icmV9fTwvb3B0aW9uPlxcbiAgICAgICAgICB9XFxuICAgICAgICA8L3NlbGVjdD48L2xhYmVsXFxuICAgICAgPjxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5OdWV2byB2YWxvcjxpbnB1dFxcbiAgICAgICAgICBbZm9ybUNvbnRyb2xdPVxcXCJjb25maWdHcm91cC5jb250cm9scy52YWxvclxcXCJcXG4gICAgICAgICAgcGxhY2Vob2xkZXI9XFxcIkludHJvZHVjZSBlbCBudWV2byB2YWxvclxcXCJcXG4gICAgICAvPjwvbGFiZWw+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLWFjdGlvbnNcXFwiPlxcbiAgICAgIDxidXR0b25cXG4gICAgICAgIGNsYXNzPVxcXCJrLWJ1dHRvblxcXCJcXG4gICAgICAgIFtkaXNhYmxlZF09XFxcImd1YXJkYW5kbyB8fCAhY29uZmlnLm5vbWJyZSB8fCAhY29uZmlnLnZhbG9yXFxcIlxcbiAgICAgICAgKGNsaWNrKT1cXFwiY2FtYmlhclBhcmFtZXRybygpXFxcIlxcbiAgICAgID5cXG4gICAgICAgIEFjdHVhbGl6YXIgcGFyw6FtZXRyb1xcbiAgICAgIDwvYnV0dG9uPlxcbiAgICA8L2Rpdj5cXG4gIDwvc2VjdGlvbj5cXG48L2Rpdj5cXG5cIixcbiAgc3R5bGVzOltdLFxufSlcbmV4cG9ydCBjbGFzcyBQYXJhbWV0cm9Gb3JtIGltcGxlbWVudHMgT25Jbml0IHtcbiAgcHJpdmF0ZSByZWFkb25seSBjaGFuZ2VEZXRlY3RvciA9IGluamVjdChDaGFuZ2VEZXRlY3RvclJlZik7XG4gIGd1YXJkYW5kbyA9IGZhbHNlO1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbmZpZyA9IHsgbm9tYnJlOiBcIlwiLCB2YWxvcjogXCJcIiB9O1xuICB9XG4gIHByaXZhdGUgYWRtaW5pc3RyYWNpb25TZXJ2aWNlID0gaW5qZWN0KEFkbWluaXN0cmFjaW9uU2VydmljZSk7XG4gIGVycm9yID0gXCJcIjtcbiAgZXhpdG8gPSBcIlwiO1xuICBwYXJhbWV0cm9zOiBQYXJhbWV0cm9bXSA9IFtdO1xuICByZWFkb25seSBjb25maWdHcm91cCA9IG5ldyBGb3JtR3JvdXAoe1xuICAgIG5vbWJyZTogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbVmFsaWRhdG9ycy5yZXF1aXJlZF0sXG4gICAgfSksXG4gICAgdmFsb3I6IG5ldyBGb3JtQ29udHJvbDxzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsPih1bmRlZmluZWQsIHtcbiAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgICAgdmFsaWRhdG9yczogW1ZhbGlkYXRvcnMucmVxdWlyZWRdLFxuICAgIH0pLFxuICB9KTtcbiAgZ2V0IGNvbmZpZygpOiBBZG1pbmlzdHJhY2lvblJlcXVlc3Qge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZ0dyb3VwLmdldFJhd1ZhbHVlKCk7XG4gIH1cbiAgc2V0IGNvbmZpZyh2YWx1ZTogQWRtaW5pc3RyYWNpb25SZXF1ZXN0KSB7XG4gICAgdGhpcy5jb25maWdHcm91cC5yZXNldCh2YWx1ZSk7XG4gIH1cbiAgbmdPbkluaXQoKSB7XG4gICAgdm9pZCB0aGlzLmNhcmdhcigpO1xuICB9XG4gIGFzeW5jIGNhcmdhcigpIHtcbiAgICB0cnkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5wYXJhbWV0cm9zID0gYXdhaXQgZmlyc3RWYWx1ZUZyb20oXG4gICAgICAgICAgdGhpcy5hZG1pbmlzdHJhY2lvblNlcnZpY2UucGFyYW1ldHJvcygpLFxuICAgICAgICApO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLmVycm9yID0gZXJyb3JUZXh0KGUpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuICBhc3luYyBlamVjdXRhcihhOiBBZG1pbmlzdHJhY2lvbkFjY2lvbiwgZDogQWRtaW5pc3RyYWNpb25SZXF1ZXN0KSB7XG4gICAgaWYgKHRoaXMuZ3VhcmRhbmRvKSByZXR1cm47XG4gICAgdGhpcy5ndWFyZGFuZG8gPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmNvbmZpZ0dyb3VwLnBhdGNoVmFsdWUoZCk7XG4gICAgICBpZiAodGhpcy5jb25maWdHcm91cC5pbnZhbGlkKSB7XG4gICAgICAgIHRoaXMuY29uZmlnR3JvdXAubWFya0FsbEFzVG91Y2hlZCgpO1xuICAgICAgICB0aGlzLmV4aXRvID0gXCJcIjtcbiAgICAgICAgdGhpcy5lcnJvciA9IFwiU2VsZWNjaW9uYSBlbCBwYXLDoW1ldHJvIGUgaW50cm9kdWNlIHN1IHZhbG9yLlwiO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmVycm9yID0gXCJcIjtcbiAgICAgIHRoaXMuZXhpdG8gPSBcIlwiO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5hZG1pbmlzdHJhY2lvblNlcnZpY2UuZWplY3V0YXIoYSwgZCkpO1xuICAgICAgICB0aGlzLmV4aXRvID0gXCJBY3R1YWxpemFjacOzbiBndWFyZGFkYVwiO1xuICAgICAgICBhd2FpdCB0aGlzLmNhcmdhcigpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLmVycm9yID0gZXJyb3JUZXh0KGUpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmd1YXJkYW5kbyA9IGZhbHNlO1xuICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbiAgYXN5bmMgY2FtYmlhclBhcmFtZXRybygpIHtcbiAgICBhd2FpdCB0aGlzLmVqZWN1dGFyKFwicGFyYW1ldHJvLWNhbWJpYXJcIiwgdGhpcy5jb25maWcpO1xuICB9XG59XG4iXX0=
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
import { errorText, formErrorText } from '../../../../core/utils/http-error.mjs';
import { FeatureNav } from '../../../../shared/components/feature-nav/feature-nav.mjs';
import { ModuleHeader } from '../../../../shared/components/module-header/module-header.mjs';
import { AdministracionService } from '../../services/administracion-service.mjs';
let UsuarioForm = class UsuarioForm {
    changeDetector = inject(ChangeDetectorRef);
    guardando = false;
    constructor() {
        this.nuevo = {};
    }
    administracionService = inject(AdministracionService);
    error = "";
    exito = "";
    roles = [];
    acceso = null;
    nuevoGroup = new FormGroup({
        idRol: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        username: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(60)],
        }),
        correo: new FormControl(undefined, {
            nonNullable: true,
            validators: [Validators.required, Validators.email, Validators.maxLength(150)],
        }),
    });
    get nuevo() {
        return this.nuevoGroup.getRawValue();
    }
    set nuevo(value) {
        this.nuevoGroup.reset(value);
    }
    ngOnInit() {
        void this.cargar();
    }
    async cargar() {
        try {
            try {
                this.roles = (await firstValueFrom(this.administracionService.roles())).filter((r) => r.nombre !== "DOCTOR" && (!r.estado || r.estado === "ACTIVO"));
            }
            catch (e) {
                this.error = errorText(e);
            }
        }
        finally {
            this.changeDetector.markForCheck();
        }
    }
    async crearUsuario() {
        if (this.guardando)
            return;
        this.guardando = true;
        try {
            if (this.nuevoGroup.invalid) {
                this.nuevoGroup.markAllAsTouched();
                this.exito = "";
                this.error = formErrorText(this.nuevoGroup);
                return;
            }
            this.error = "";
            this.exito = "";
            this.acceso = null;
            try {
                this.acceso = await firstValueFrom(this.administracionService.crearUsuario(this.nuevo));
                this.exito =
                    "Trabajador registrado. Entrega estas credenciales al trabajador antes de salir.";
                this.nuevo = {};
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
UsuarioForm = __decorate([
    Component({
        standalone: true,
        imports: [ReactiveFormsModule, RouterLink, FeatureNav, ModuleHeader],
        template: "<div class=\"k-module k-admin\">\n  <header\n    appModuleHeader\n    class=\"k-module-header\"\n    contexto=\"CONFIGURACIÓN / ADMINISTRACIÓN\"\n    titulo=\"Administración\"\n    descripcion=\"Gestiona usuarios, parámetros, catálogos, notificaciones y auditoría.\"\n    textoActualizar=\"↻ Actualizar información\"\n    (actualizar)=\"cargar()\"\n  ></header>\n  <app-feature-nav feature=\"administracion\" />\n  @if(error){\n  <div class=\"k-error\" role=\"alert\">{{error}}</div>\n  }@if(exito){\n  <div class=\"k-success\" role=\"status\">{{exito}}</div>\n  } @if (acceso) {\n  <section class=\"k-panel\" aria-label=\"Credenciales del trabajador\">\n    <h2>Cuenta creada</h2>\n    <p>\n      Guarda estos datos antes de salir. La contraseña no se mostrará en el\n      listado.\n    </p>\n    <dl>\n      <dt>Usuario</dt>\n      <dd>{{ acceso.username }}</dd>\n      <dt>Correo</dt>\n      <dd>{{ acceso.correo }}</dd>\n      <dt>Contraseña inicial</dt>\n      <dd><code>{{ acceso.password }}</code></dd>\n    </dl>\n    <a class=\"k-button\" routerLink=\"/admin\">Volver a usuarios</a>\n  </section>\n  }\n  <section class=\"k-panel\">\n    <div class=\"k-section-heading\">\n      <div>\n        <h2>Registrar trabajador</h2>\n        <p>Completa los datos de acceso y asigna el rol correspondiente.</p>\n      </div>\n    </div>\n    <div class=\"k-form\">\n      <label class=\"k-field\"\n        >Nombre de usuario<input\n          [formControl]=\"nuevoGroup.controls.username\"\n          placeholder=\"Ej. recepcionista1\"\n          autocomplete=\"off\"\n      /></label>\n      <label class=\"k-field\"\n        >Correo electrónico<input\n          type=\"email\"\n          [formControl]=\"nuevoGroup.controls.correo\"\n          placeholder=\"usuario@ejemplo.com\"\n      /></label>\n      <label class=\"k-field\"\n        >Rol<select [formControl]=\"nuevoGroup.controls.idRol\">\n          <option [ngValue]=\"null\">Selecciona un rol</option>\n          @for(r of roles;track r.idRol){\n          <option [ngValue]=\"r.idRol\">{{r.nombre}}</option>\n          }\n        </select></label\n      >\n      <p class=\"k-info\">\n        El sistema generará una contraseña segura. Las cuentas de doctores se\n        crean desde Doctores, después de aprobar su documentación.\n      </p>\n    </div>\n    <div class=\"k-actions\">\n      <button\n        class=\"k-button\"\n        [disabled]=\"guardando || nuevoGroup.invalid\"\n        (click)=\"crearUsuario()\"\n      >\n        Registrar usuario</button\n      ><button class=\"k-button k-button-secondary\" routerLink=\"/admin\">\n        Cancelar\n      </button>\n    </div>\n  </section>\n</div>\n",
        styles: [],
    })
], UsuarioForm);
export { UsuarioForm };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN1YXJpby1mb3JtLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vQzovVU5JVkVSU0lEQUQvTFAyL1NFTUFOQTExL2thcmVseV9tb2Rlcm5vL2Zyb250ZW5kL3NyYy9hcHAvZmVhdHVyZXMvYWRtaW5pc3RyYWNpb24vcGFnZXMvdXN1YXJpby1mb3JtLyIsInNvdXJjZXMiOlsidXN1YXJpby1mb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQzdFLE9BQU8sRUFDTCxXQUFXLEVBQ1gsU0FBUyxFQUNULG1CQUFtQixFQUNuQixVQUFVLEdBQ1gsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN0QyxPQUFPLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUNuRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkRBQTJELENBQUM7QUFNekYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFRdkUsSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBVztJQUNMLGNBQWMsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUM1RCxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBRWxCO1FBQ0UsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUNPLHFCQUFxQixHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQzlELEtBQUssR0FBRyxFQUFFLENBQUM7SUFDWCxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ1gsS0FBSyxHQUFrQixFQUFFLENB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QUM7Z0JBQ3BGLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUVoQixNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN0QixDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDWCxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDO1FBQ0gsQ0FBQztnQkFBUyxDQUFDO1lBQ1QsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNyQyxDQUFDO0lBQ0gsQ0FBQztDQUNGLENBQUE7QUFoRlksV0FBVztJQU52QixTQUFTLENBQUM7UUFDVCxVQUFVLEVBQUUsSUFBSTtRQUNoQixPQUFPLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQztRQUNwRSxRQUFRLEVBQUMsbW5GQUFtbkY7UUFDNW5GLE1BQU0sRUFBQyxFQUFFO0tBQ1YsQ0FBQztHQUNXLFdBQVcsQ0FnRnZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgaW5qZWN0LCBPbkluaXQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtcbiAgRm9ybUNvbnRyb2wsXG4gIEZvcm1Hcm91cCxcbiAgUmVhY3RpdmVGb3Jtc01vZHVsZSxcbiAgVmFsaWRhdG9ycyxcbn0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5pbXBvcnQgeyBSb3V0ZXJMaW5rIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgZmlyc3RWYWx1ZUZyb20gfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgZXJyb3JUZXh0LCBmb3JtRXJyb3JUZXh0IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvcmUvdXRpbHMvaHR0cC1lcnJvclwiO1xuaW1wb3J0IHsgRmVhdHVyZU5hdiB9IGZyb20gXCIuLi8uLi8uLi8uLi9zaGFyZWQvY29tcG9uZW50cy9mZWF0dXJlLW5hdi9mZWF0dXJlLW5hdlwiO1xuaW1wb3J0IHsgTW9kdWxlSGVhZGVyIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3NoYXJlZC9jb21wb25lbnRzL21vZHVsZS1oZWFkZXIvbW9kdWxlLWhlYWRlclwiO1xuaW1wb3J0IHtcbiAgQWRtaW5pc3RyYWNpb25SZXF1ZXN0LFxuICBBY2Nlc29Vc3VhcmlvLFxuICBSb2xDYXRhbG9nbyxcbn0gZnJvbSBcIi4uLy4uL21vZGVscy9hZG1pbmlzdHJhY2lvbi5tb2RlbFwiO1xuaW1wb3J0IHsgQWRtaW5pc3RyYWNpb25TZXJ2aWNlIH0gZnJvbSBcIi4uLy4uL3NlcnZpY2VzL2FkbWluaXN0cmFjaW9uLXNlcnZpY2VcIjtcblxuQENvbXBvbmVudCh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtSZWFjdGl2ZUZvcm1zTW9kdWxlLCBSb3V0ZXJMaW5rLCBGZWF0dXJlTmF2LCBNb2R1bGVIZWFkZXJdLFxuICB0ZW1wbGF0ZTpcIjxkaXYgY2xhc3M9XFxcImstbW9kdWxlIGstYWRtaW5cXFwiPlxcbiAgPGhlYWRlclxcbiAgICBhcHBNb2R1bGVIZWFkZXJcXG4gICAgY2xhc3M9XFxcImstbW9kdWxlLWhlYWRlclxcXCJcXG4gICAgY29udGV4dG89XFxcIkNPTkZJR1VSQUNJw5NOIC8gQURNSU5JU1RSQUNJw5NOXFxcIlxcbiAgICB0aXR1bG89XFxcIkFkbWluaXN0cmFjacOzblxcXCJcXG4gICAgZGVzY3JpcGNpb249XFxcIkdlc3Rpb25hIHVzdWFyaW9zLCBwYXLDoW1ldHJvcywgY2F0w6Fsb2dvcywgbm90aWZpY2FjaW9uZXMgeSBhdWRpdG9yw61hLlxcXCJcXG4gICAgdGV4dG9BY3R1YWxpemFyPVxcXCLihrsgQWN0dWFsaXphciBpbmZvcm1hY2nDs25cXFwiXFxuICAgIChhY3R1YWxpemFyKT1cXFwiY2FyZ2FyKClcXFwiXFxuICA+PC9oZWFkZXI+XFxuICA8YXBwLWZlYXR1cmUtbmF2IGZlYXR1cmU9XFxcImFkbWluaXN0cmFjaW9uXFxcIiAvPlxcbiAgQGlmKGVycm9yKXtcXG4gIDxkaXYgY2xhc3M9XFxcImstZXJyb3JcXFwiIHJvbGU9XFxcImFsZXJ0XFxcIj57e2Vycm9yfX08L2Rpdj5cXG4gIH1AaWYoZXhpdG8pe1xcbiAgPGRpdiBjbGFzcz1cXFwiay1zdWNjZXNzXFxcIiByb2xlPVxcXCJzdGF0dXNcXFwiPnt7ZXhpdG99fTwvZGl2PlxcbiAgfSBAaWYgKGFjY2Vzbykge1xcbiAgPHNlY3Rpb24gY2xhc3M9XFxcImstcGFuZWxcXFwiIGFyaWEtbGFiZWw9XFxcIkNyZWRlbmNpYWxlcyBkZWwgdHJhYmFqYWRvclxcXCI+XFxuICAgIDxoMj5DdWVudGEgY3JlYWRhPC9oMj5cXG4gICAgPHA+XFxuICAgICAgR3VhcmRhIGVzdG9zIGRhdG9zIGFudGVzIGRlIHNhbGlyLiBMYSBjb250cmFzZcOxYSBubyBzZSBtb3N0cmFyw6EgZW4gZWxcXG4gICAgICBsaXN0YWRvLlxcbiAgICA8L3A+XFxuICAgIDxkbD5cXG4gICAgICA8ZHQ+VXN1YXJpbzwvZHQ+XFxuICAgICAgPGRkPnt7IGFjY2Vzby51c2VybmFtZSB9fTwvZGQ+XFxuICAgICAgPGR0PkNvcnJlbzwvZHQ+XFxuICAgICAgPGRkPnt7IGFjY2Vzby5jb3JyZW8gfX08L2RkPlxcbiAgICAgIDxkdD5Db250cmFzZcOxYSBpbmljaWFsPC9kdD5cXG4gICAgICA8ZGQ+PGNvZGU+e3sgYWNjZXNvLnBhc3N3b3JkIH19PC9jb2RlPjwvZGQ+XFxuICAgIDwvZGw+XFxuICAgIDxhIGNsYXNzPVxcXCJrLWJ1dHRvblxcXCIgcm91dGVyTGluaz1cXFwiL2FkbWluXFxcIj5Wb2x2ZXIgYSB1c3VhcmlvczwvYT5cXG4gIDwvc2VjdGlvbj5cXG4gIH1cXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJrLXBhbmVsXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiay1zZWN0aW9uLWhlYWRpbmdcXFwiPlxcbiAgICAgIDxkaXY+XFxuICAgICAgICA8aDI+UmVnaXN0cmFyIHRyYWJhamFkb3I8L2gyPlxcbiAgICAgICAgPHA+Q29tcGxldGEgbG9zIGRhdG9zIGRlIGFjY2VzbyB5IGFzaWduYSBlbCByb2wgY29ycmVzcG9uZGllbnRlLjwvcD5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcImstZm9ybVxcXCI+XFxuICAgICAgPGxhYmVsIGNsYXNzPVxcXCJrLWZpZWxkXFxcIlxcbiAgICAgICAgPk5vbWJyZSBkZSB1c3VhcmlvPGlucHV0XFxuICAgICAgICAgIFtmb3JtQ29udHJvbF09XFxcIm51ZXZvR3JvdXAuY29udHJvbHMudXNlcm5hbWVcXFwiXFxuICAgICAgICAgIHBsYWNlaG9sZGVyPVxcXCJFai4gcmVjZXBjaW9uaXN0YTFcXFwiXFxuICAgICAgICAgIGF1dG9jb21wbGV0ZT1cXFwib2ZmXFxcIlxcbiAgICAgIC8+PC9sYWJlbD5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+Q29ycmVvIGVsZWN0csOzbmljbzxpbnB1dFxcbiAgICAgICAgICB0eXBlPVxcXCJlbWFpbFxcXCJcXG4gICAgICAgICAgW2Zvcm1Db250cm9sXT1cXFwibnVldm9Hcm91cC5jb250cm9scy5jb3JyZW9cXFwiXFxuICAgICAgICAgIHBsYWNlaG9sZGVyPVxcXCJ1c3VhcmlvQGVqZW1wbG8uY29tXFxcIlxcbiAgICAgIC8+PC9sYWJlbD5cXG4gICAgICA8bGFiZWwgY2xhc3M9XFxcImstZmllbGRcXFwiXFxuICAgICAgICA+Um9sPHNlbGVjdCBbZm9ybUNvbnRyb2xdPVxcXCJudWV2b0dyb3VwLmNvbnRyb2xzLmlkUm9sXFxcIj5cXG4gICAgICAgICAgPG9wdGlvbiBbbmdWYWx1ZV09XFxcIm51bGxcXFwiPlNlbGVjY2lvbmEgdW4gcm9sPC9vcHRpb24+XFxuICAgICAgICAgIEBmb3IociBvZiByb2xlczt0cmFjayByLmlkUm9sKXtcXG4gICAgICAgICAgPG9wdGlvbiBbbmdWYWx1ZV09XFxcInIuaWRSb2xcXFwiPnt7ci5ub21icmV9fTwvb3B0aW9uPlxcbiAgICAgICAgICB9XFxuICAgICAgICA8L3NlbGVjdD48L2xhYmVsXFxuICAgICAgPlxcbiAgICAgIDxwIGNsYXNzPVxcXCJrLWluZm9cXFwiPlxcbiAgICAgICAgRWwgc2lzdGVtYSBnZW5lcmFyw6EgdW5hIGNvbnRyYXNlw7FhIHNlZ3VyYS4gTGFzIGN1ZW50YXMgZGUgZG9jdG9yZXMgc2VcXG4gICAgICAgIGNyZWFuIGRlc2RlIERvY3RvcmVzLCBkZXNwdcOpcyBkZSBhcHJvYmFyIHN1IGRvY3VtZW50YWNpw7NuLlxcbiAgICAgIDwvcD5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcImstYWN0aW9uc1xcXCI+XFxuICAgICAgPGJ1dHRvblxcbiAgICAgICAgY2xhc3M9XFxcImstYnV0dG9uXFxcIlxcbiAgICAgICAgW2Rpc2FibGVkXT1cXFwiZ3VhcmRhbmRvIHx8IG51ZXZvR3JvdXAuaW52YWxpZFxcXCJcXG4gICAgICAgIChjbGljayk9XFxcImNyZWFyVXN1YXJpbygpXFxcIlxcbiAgICAgID5cXG4gICAgICAgIFJlZ2lzdHJhciB1c3VhcmlvPC9idXR0b25cXG4gICAgICA+PGJ1dHRvbiBjbGFzcz1cXFwiay1idXR0b24gay1idXR0b24tc2Vjb25kYXJ5XFxcIiByb3V0ZXJMaW5rPVxcXCIvYWRtaW5cXFwiPlxcbiAgICAgICAgQ2FuY2VsYXJcXG4gICAgICA8L2J1dHRvbj5cXG4gICAgPC9kaXY+XFxuICA8L3NlY3Rpb24+XFxuPC9kaXY+XFxuXCIsXG4gIHN0eWxlczpbXSxcbn0pXG5leHBvcnQgY2xhc3MgVXN1YXJpb0Zvcm0gaW1wbGVtZW50cyBPbkluaXQge1xuICBwcml2YXRlIHJlYWRvbmx5IGNoYW5nZURldGVjdG9yID0gaW5qZWN0KENoYW5nZURldGVjdG9yUmVmKTtcbiAgZ3VhcmRhbmRvID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5udWV2byA9IHt9O1xuICB9XG4gIHByaXZhdGUgYWRtaW5pc3RyYWNpb25TZXJ2aWNlID0gaW5qZWN0KEFkbWluaXN0cmFjaW9uU2VydmljZSk7XG4gIGVycm9yID0gXCJcIjtcbiAgZXhpdG8gPSBcIlwiO1xuICByb2xlczogUm9sQ2F0YWxvZ29bXSA9IFtdO1xuICBhY2Nlc286IEFjY2Vzb1VzdWFyaW8gfCBudWxsID0gbnVsbDtcbiAgcmVhZG9ubHkgbnVldm9Hcm91cCA9IG5ldyBGb3JtR3JvdXAoe1xuICAgIGlkUm9sOiBuZXcgRm9ybUNvbnRyb2w8bnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZD4odW5kZWZpbmVkLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtWYWxpZGF0b3JzLnJlcXVpcmVkXSxcbiAgICB9KSxcbiAgICB1c2VybmFtZTogbmV3IEZvcm1Db250cm9sPHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw+KHVuZGVmaW5lZCwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbVmFsaWRhdG9ycy5yZXF1aXJlZCwgVmFsaWRhdG9ycy5wYXR0ZXJuKC9cXFMvKSwgVmFsaWRhdG9ycy5tYXhMZW5ndGgoNjApXSxcbiAgICB9KSxcbiAgICBjb3JyZW86IG5ldyBGb3JtQ29udHJvbDxzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsPih1bmRlZmluZWQsIHtcbiAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgICAgdmFsaWRhdG9yczogW1ZhbGlkYXRvcnMucmVxdWlyZWQsIFZhbGlkYXRvcnMuZW1haWwsIFZhbGlkYXRvcnMubWF4TGVuZ3RoKDE1MCldLFxuICAgIH0pLFxuICB9KTtcbiAgZ2V0IG51ZXZvKCk6IEFkbWluaXN0cmFjaW9uUmVxdWVzdCB7XG4gICAgcmV0dXJuIHRoaXMubnVldm9Hcm91cC5nZXRSYXdWYWx1ZSgpO1xuICB9XG4gIHNldCBudWV2byh2YWx1ZTogQWRtaW5pc3RyYWNpb25SZXF1ZXN0KSB7XG4gICAgdGhpcy5udWV2b0dyb3VwLnJlc2V0KHZhbHVlKTtcbiAgfVxuICBuZ09uSW5pdCgpIHtcbiAgICB2b2lkIHRoaXMuY2FyZ2FyKCk7XG4gIH1cbiAgYXN5bmMgY2FyZ2FyKCkge1xuICAgIHRyeSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnJvbGVzID0gKFxuICAgICAgICAgIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMuYWRtaW5pc3RyYWNpb25TZXJ2aWNlLnJvbGVzKCkpXG4gICAgICAgICkuZmlsdGVyKFxuICAgICAgICAgIChyKSA9PiByLm5vbWJyZSAhPT0gXCJET0NUT1JcIiAmJiAoIXIuZXN0YWRvIHx8IHIuZXN0YWRvID09PSBcIkFDVElWT1wiKSxcbiAgICAgICAgKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbiAgYXN5bmMgY3JlYXJVc3VhcmlvKCkge1xuICAgIGlmICh0aGlzLmd1YXJkYW5kbykgcmV0dXJuO1xuICAgIHRoaXMuZ3VhcmRhbmRvID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgaWYgKHRoaXMubnVldm9Hcm91cC5pbnZhbGlkKSB7XG4gICAgICAgIHRoaXMubnVldm9Hcm91cC5tYXJrQWxsQXNUb3VjaGVkKCk7XG4gICAgICAgIHRoaXMuZXhpdG8gPSBcIlwiO1xuICAgICAgICB0aGlzLmVycm9yID0gZm9ybUVycm9yVGV4dCh0aGlzLm51ZXZvR3JvdXApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmVycm9yID0gXCJcIjtcbiAgICAgIHRoaXMuZXhpdG8gPSBcIlwiO1xuICAgICAgdGhpcy5hY2Nlc28gPSBudWxsO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5hY2Nlc28gPSBhd2FpdCBmaXJzdFZhbHVlRnJvbShcbiAgICAgICAgICB0aGlzLmFkbWluaXN0cmFjaW9uU2VydmljZS5jcmVhclVzdWFyaW8odGhpcy5udWV2byksXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZXhpdG8gPVxuICAgICAgICAgIFwiVHJhYmFqYWRvciByZWdpc3RyYWRvLiBFbnRyZWdhIGVzdGFzIGNyZWRlbmNpYWxlcyBhbCB0cmFiYWphZG9yIGFudGVzIGRlIHNhbGlyLlwiO1xuICAgICAgICB0aGlzLm51ZXZvID0ge307XG5cbiAgICAgICAgYXdhaXQgdGhpcy5jYXJnYXIoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5lcnJvciA9IGVycm9yVGV4dChlKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5ndWFyZGFuZG8gPSBmYWxzZTtcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG59XG4iXX0=
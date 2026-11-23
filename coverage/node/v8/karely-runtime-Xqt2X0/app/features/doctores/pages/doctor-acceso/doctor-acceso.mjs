var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ChangeDetectorRef, Component, inject, } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { FeatureNav } from '../../../../shared/components/feature-nav/feature-nav.mjs';
import { errorText } from '../../../../core/utils/http-error.mjs';
import { DoctorService } from '../../services/doctores-service.mjs';
let DoctorAcceso = class DoctorAcceso {
    service = inject(DoctorService);
    changeDetector = inject(ChangeDetectorRef);
    doctores = [];
    selectedDoctor = 0;
    accesoForm = new FormGroup({
        username: new FormControl("", {
            nonNullable: true,
            validators: [
                Validators.required,
                Validators.pattern("[A-Za-z0-9._-]{3,60}"),
            ],
        }),
    });
    get username() {
        return this.accesoForm.controls.username.value;
    }
    set username(value) {
        this.accesoForm.controls.username.setValue(value);
    }
    error = "";
    guardando = false;
    activo = true;
    credenciales = null;
    get elegibles() {
        return this.doctores.filter((d) => d.estadoDocumentacion === "COMPLETO" && !d.idUsuario);
    }
    get doctor() {
        return this.elegibles.find((d) => d.idDoctor === this.selectedDoctor);
    }
    ngOnInit() {
        void this.cargar();
    }
    ngOnDestroy() {
        this.activo = false;
        this.credenciales = null;
    }
    cambiarDoctor() {
        this.credenciales = null;
        this.username = "";
        this.error = "";
    }
    async cargar() {
        try {
            this.doctores = await firstValueFrom(this.service.listar());
        }
        catch (e) {
            this.error = errorText(e);
        }
        finally {
            this.changeDetector.markForCheck();
        }
    }
    async generarAcceso() {
        if (this.guardando)
            return;
        this.credenciales = null;
        this.error = "";
        if (!this.doctor || this.accesoForm.invalid) {
            this.accesoForm.markAllAsTouched();
            this.error =
                "Selecciona un doctor y escribe un usuario de 3 a 60 caracteres: letras, números, punto, guion o guion bajo";
            return;
        }
        const id = this.selectedDoctor;
        this.guardando = true;
        try {
            const result = await firstValueFrom(this.service.crearAcceso(id, this.username.trim()));
            if (this.activo && id === this.selectedDoctor)
                this.credenciales = result;
            this.doctores = this.doctores.filter((d) => d.idDoctor !== id);
        }
        catch (e) {
            this.error = errorText(e);
        }
        finally {
            this.guardando = false;
            this.changeDetector.markForCheck();
        }
    }
};
DoctorAcceso = __decorate([
    Component({
        standalone: true,
        imports: [FormsModule, ReactiveFormsModule, FeatureNav],
        template: "<div class=\"k-module k-doctores\">\n  <header class=\"k-module-header\">\n    <div>\n      <span class=\"k-eyebrow\">GESTIÓN CLÍNICA / PERSONAL MÉDICO</span>\n      <h1 class=\"k-title\">Acceso médico</h1>\n      <p class=\"k-subtitle\">\n        Genera la cuenta después de completar la documentación y asignar una\n        especialidad.\n      </p>\n    </div>\n  </header>\n  <app-feature-nav feature=\"doctores\" /> @if(error){\n  <div class=\"k-error\" role=\"alert\">{{error}}</div>\n  }\n  <section class=\"k-panel\">\n    <h2>Crear acceso</h2>\n    <div class=\"k-form\">\n      <label class=\"k-field\"\n        >Doctor<select\n          [(ngModel)]=\"selectedDoctor\"\n          (ngModelChange)=\"cambiarDoctor()\"\n          [disabled]=\"guardando\"\n        >\n          <option [ngValue]=\"0\">Selecciona un doctor</option>\n          @for(d of elegibles;track d.idDoctor){\n          <option [ngValue]=\"d.idDoctor\">{{d.nombres}} {{d.apellidos}}</option>\n          }\n        </select></label\n      ><label class=\"k-field\"\n        >Usuario<input\n          [formControl]=\"accesoForm.controls.username\"\n          autocomplete=\"off\"\n          [readOnly]=\"guardando || !doctor\" /></label\n      ><label class=\"k-field\"\n        >Correo del doctor<input [value]=\"doctor?.correo || ''\" readonly\n      /></label>\n    </div>\n    <button\n      class=\"k-button\"\n      [disabled]=\"guardando || !doctor || !username.trim()\"\n      (click)=\"generarAcceso()\"\n    >\n      Generar acceso\n    </button>\n  </section>\n  @if(credenciales;as c){\n  <section class=\"k-panel\" role=\"status\">\n    <h2>Acceso creado</h2>\n    <p>Usuario: <strong>{{c.username}}</strong></p>\n    <p>Correo: {{c.correo}}</p>\n    <p>Contraseña generada: <strong>{{c.passwordTemporal}}</strong></p>\n    <p class=\"k-info\">\n      Copia la contraseña ahora. Se oculta al cambiar de doctor o salir de esta\n      página.\n    </p>\n    <button class=\"k-button k-button-secondary\" (click)=\"credenciales = null\">\n      Ocultar contraseña\n    </button>\n  </section>\n  }\n</div>\n",
    })
], DoctorAcceso);
export { DoctorAcceso };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdG9yLWFjY2Vzby5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL2ZlYXR1cmVzL2RvY3RvcmVzL3BhZ2VzL2RvY3Rvci1hY2Nlc28vIiwic291cmNlcyI6WyJkb2N0b3ItYWNjZXNvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDTCxpQkFBaUIsRUFDakIsU0FBUyxFQUNULE1BQU0sR0FHUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQ0wsV0FBVyxFQUNYLFNBQVMsRUFDVCxXQUFXLEVBQ1gsbUJBQW1CLEVBQ25CLFVBQVUsR0FDWCxNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQ25GLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUU5RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFNekQsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBWTtJQUNOLE9BQU8sR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDaEMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzVELFFBQVEsR0FBYSxFQUFFLENBQUM7SUFDeEIsY0FBYyxHQUFHLENBQUMsQ0FBQztJQUNWLFVBQVUsR0FBRyxJQUFJLFNBQVMsQ0FBQztRQUNsQyxRQUFRLEVBQUUsSUFBSSxXQUFXLENBQUMsRUFBRSxFQUFFO1lBQzVCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLFVBQVUsRUFBRTtnQkFDVixVQUFVLENBQUMsUUFBUTtnQkFDbkIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQzthQUMzQztTQUNGLENBQUM7S0FDSCxDQUFD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QUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNYLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLENBQUM7Z0JBQVMsQ0FBQztZQUNULElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDckMsQ0FBQztJQUNILENBQUM7Q0FDRixDQUFBO0FBbEZZLFlBQVk7SUFMeEIsU0FBUyxDQUFDO1FBQ1QsVUFBVSxFQUFFLElBQUk7UUFDaEIsT0FBTyxFQUFFLENBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFFLFVBQVUsQ0FBQztRQUN2RCxRQUFRLEVBQUMsZ2pFQUFnakU7S0FDMWpFLENBQUM7R0FDVyxZQUFZLENBa0Z4QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIGluamVjdCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG59IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge1xuICBGb3JtQ29udHJvbCxcbiAgRm9ybUdyb3VwLFxuICBGb3Jtc01vZHVsZSxcbiAgUmVhY3RpdmVGb3Jtc01vZHVsZSxcbiAgVmFsaWRhdG9ycyxcbn0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5pbXBvcnQgeyBmaXJzdFZhbHVlRnJvbSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBGZWF0dXJlTmF2IH0gZnJvbSBcIi4uLy4uLy4uLy4uL3NoYXJlZC9jb21wb25lbnRzL2ZlYXR1cmUtbmF2L2ZlYXR1cmUtbmF2XCI7XG5pbXBvcnQgeyBlcnJvclRleHQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29yZS91dGlscy9odHRwLWVycm9yXCI7XG5pbXBvcnQgeyBEb2N0b3IgfSBmcm9tIFwiLi4vLi4vbW9kZWxzL2RvY3RvcmVzLm1vZGVsXCI7XG5pbXBvcnQgeyBEb2N0b3JTZXJ2aWNlIH0gZnJvbSBcIi4uLy4uL3NlcnZpY2VzL2RvY3RvcmVzLXNlcnZpY2VcIjtcbkBDb21wb25lbnQoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbRm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGUsIEZlYXR1cmVOYXZdLFxuICB0ZW1wbGF0ZTpcIjxkaXYgY2xhc3M9XFxcImstbW9kdWxlIGstZG9jdG9yZXNcXFwiPlxcbiAgPGhlYWRlciBjbGFzcz1cXFwiay1tb2R1bGUtaGVhZGVyXFxcIj5cXG4gICAgPGRpdj5cXG4gICAgICA8c3BhbiBjbGFzcz1cXFwiay1leWVicm93XFxcIj5HRVNUScOTTiBDTMONTklDQSAvIFBFUlNPTkFMIE3DiURJQ088L3NwYW4+XFxuICAgICAgPGgxIGNsYXNzPVxcXCJrLXRpdGxlXFxcIj5BY2Nlc28gbcOpZGljbzwvaDE+XFxuICAgICAgPHAgY2xhc3M9XFxcImstc3VidGl0bGVcXFwiPlxcbiAgICAgICAgR2VuZXJhIGxhIGN1ZW50YSBkZXNwdcOpcyBkZSBjb21wbGV0YXIgbGEgZG9jdW1lbnRhY2nDs24geSBhc2lnbmFyIHVuYVxcbiAgICAgICAgZXNwZWNpYWxpZGFkLlxcbiAgICAgIDwvcD5cXG4gICAgPC9kaXY+XFxuICA8L2hlYWRlcj5cXG4gIDxhcHAtZmVhdHVyZS1uYXYgZmVhdHVyZT1cXFwiZG9jdG9yZXNcXFwiIC8+IEBpZihlcnJvcil7XFxuICA8ZGl2IGNsYXNzPVxcXCJrLWVycm9yXFxcIiByb2xlPVxcXCJhbGVydFxcXCI+e3tlcnJvcn19PC9kaXY+XFxuICB9XFxuICA8c2VjdGlvbiBjbGFzcz1cXFwiay1wYW5lbFxcXCI+XFxuICAgIDxoMj5DcmVhciBhY2Nlc288L2gyPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrLWZvcm1cXFwiPlxcbiAgICAgIDxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5Eb2N0b3I8c2VsZWN0XFxuICAgICAgICAgIFsobmdNb2RlbCldPVxcXCJzZWxlY3RlZERvY3RvclxcXCJcXG4gICAgICAgICAgKG5nTW9kZWxDaGFuZ2UpPVxcXCJjYW1iaWFyRG9jdG9yKClcXFwiXFxuICAgICAgICAgIFtkaXNhYmxlZF09XFxcImd1YXJkYW5kb1xcXCJcXG4gICAgICAgID5cXG4gICAgICAgICAgPG9wdGlvbiBbbmdWYWx1ZV09XFxcIjBcXFwiPlNlbGVjY2lvbmEgdW4gZG9jdG9yPC9vcHRpb24+XFxuICAgICAgICAgIEBmb3IoZCBvZiBlbGVnaWJsZXM7dHJhY2sgZC5pZERvY3Rvcil7XFxuICAgICAgICAgIDxvcHRpb24gW25nVmFsdWVdPVxcXCJkLmlkRG9jdG9yXFxcIj57e2Qubm9tYnJlc319IHt7ZC5hcGVsbGlkb3N9fTwvb3B0aW9uPlxcbiAgICAgICAgICB9XFxuICAgICAgICA8L3NlbGVjdD48L2xhYmVsXFxuICAgICAgPjxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5Vc3VhcmlvPGlucHV0XFxuICAgICAgICAgIFtmb3JtQ29udHJvbF09XFxcImFjY2Vzb0Zvcm0uY29udHJvbHMudXNlcm5hbWVcXFwiXFxuICAgICAgICAgIGF1dG9jb21wbGV0ZT1cXFwib2ZmXFxcIlxcbiAgICAgICAgICBbcmVhZE9ubHldPVxcXCJndWFyZGFuZG8gfHwgIWRvY3RvclxcXCIgLz48L2xhYmVsXFxuICAgICAgPjxsYWJlbCBjbGFzcz1cXFwiay1maWVsZFxcXCJcXG4gICAgICAgID5Db3JyZW8gZGVsIGRvY3RvcjxpbnB1dCBbdmFsdWVdPVxcXCJkb2N0b3I/LmNvcnJlbyB8fCAnJ1xcXCIgcmVhZG9ubHlcXG4gICAgICAvPjwvbGFiZWw+XFxuICAgIDwvZGl2PlxcbiAgICA8YnV0dG9uXFxuICAgICAgY2xhc3M9XFxcImstYnV0dG9uXFxcIlxcbiAgICAgIFtkaXNhYmxlZF09XFxcImd1YXJkYW5kbyB8fCAhZG9jdG9yIHx8ICF1c2VybmFtZS50cmltKClcXFwiXFxuICAgICAgKGNsaWNrKT1cXFwiZ2VuZXJhckFjY2VzbygpXFxcIlxcbiAgICA+XFxuICAgICAgR2VuZXJhciBhY2Nlc29cXG4gICAgPC9idXR0b24+XFxuICA8L3NlY3Rpb24+XFxuICBAaWYoY3JlZGVuY2lhbGVzO2FzIGMpe1xcbiAgPHNlY3Rpb24gY2xhc3M9XFxcImstcGFuZWxcXFwiIHJvbGU9XFxcInN0YXR1c1xcXCI+XFxuICAgIDxoMj5BY2Nlc28gY3JlYWRvPC9oMj5cXG4gICAgPHA+VXN1YXJpbzogPHN0cm9uZz57e2MudXNlcm5hbWV9fTwvc3Ryb25nPjwvcD5cXG4gICAgPHA+Q29ycmVvOiB7e2MuY29ycmVvfX08L3A+XFxuICAgIDxwPkNvbnRyYXNlw7FhIGdlbmVyYWRhOiA8c3Ryb25nPnt7Yy5wYXNzd29yZFRlbXBvcmFsfX08L3N0cm9uZz48L3A+XFxuICAgIDxwIGNsYXNzPVxcXCJrLWluZm9cXFwiPlxcbiAgICAgIENvcGlhIGxhIGNvbnRyYXNlw7FhIGFob3JhLiBTZSBvY3VsdGEgYWwgY2FtYmlhciBkZSBkb2N0b3IgbyBzYWxpciBkZSBlc3RhXFxuICAgICAgcMOhZ2luYS5cXG4gICAgPC9wPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJrLWJ1dHRvbiBrLWJ1dHRvbi1zZWNvbmRhcnlcXFwiIChjbGljayk9XFxcImNyZWRlbmNpYWxlcyA9IG51bGxcXFwiPlxcbiAgICAgIE9jdWx0YXIgY29udHJhc2XDsWFcXG4gICAgPC9idXR0b24+XFxuICA8L3NlY3Rpb24+XFxuICB9XFxuPC9kaXY+XFxuXCIsXG59KVxuZXhwb3J0IGNsYXNzIERvY3RvckFjY2VzbyBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSByZWFkb25seSBzZXJ2aWNlID0gaW5qZWN0KERvY3RvclNlcnZpY2UpO1xuICBwcml2YXRlIHJlYWRvbmx5IGNoYW5nZURldGVjdG9yID0gaW5qZWN0KENoYW5nZURldGVjdG9yUmVmKTtcbiAgZG9jdG9yZXM6IERvY3RvcltdID0gW107XG4gIHNlbGVjdGVkRG9jdG9yID0gMDtcbiAgcmVhZG9ubHkgYWNjZXNvRm9ybSA9IG5ldyBGb3JtR3JvdXAoe1xuICAgIHVzZXJuYW1lOiBuZXcgRm9ybUNvbnRyb2woXCJcIiwge1xuICAgICAgbm9uTnVsbGFibGU6IHRydWUsXG4gICAgICB2YWxpZGF0b3JzOiBbXG4gICAgICAgIFZhbGlkYXRvcnMucmVxdWlyZWQsXG4gICAgICAgIFZhbGlkYXRvcnMucGF0dGVybihcIltBLVphLXowLTkuXy1dezMsNjB9XCIpLFxuICAgICAgXSxcbiAgICB9KSxcbiAgfSk7XG4gIGdldCB1c2VybmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5hY2Nlc29Gb3JtLmNvbnRyb2xzLnVzZXJuYW1lLnZhbHVlO1xuICB9XG4gIHNldCB1c2VybmFtZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5hY2Nlc29Gb3JtLmNvbnRyb2xzLnVzZXJuYW1lLnNldFZhbHVlKHZhbHVlKTtcbiAgfVxuICBlcnJvciA9IFwiXCI7XG4gIGd1YXJkYW5kbyA9IGZhbHNlO1xuICBwcml2YXRlIGFjdGl2byA9IHRydWU7XG4gIGNyZWRlbmNpYWxlczoge1xuICAgIHVzZXJuYW1lOiBzdHJpbmc7XG4gICAgY29ycmVvOiBzdHJpbmc7XG4gICAgcGFzc3dvcmRUZW1wb3JhbDogc3RyaW5nO1xuICB9IHwgbnVsbCA9IG51bGw7XG4gIGdldCBlbGVnaWJsZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9jdG9yZXMuZmlsdGVyKFxuICAgICAgKGQpID0+IGQuZXN0YWRvRG9jdW1lbnRhY2lvbiA9PT0gXCJDT01QTEVUT1wiICYmICFkLmlkVXN1YXJpbyxcbiAgICApO1xuICB9XG4gIGdldCBkb2N0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlZ2libGVzLmZpbmQoKGQpID0+IGQuaWREb2N0b3IgPT09IHRoaXMuc2VsZWN0ZWREb2N0b3IpO1xuICB9XG4gIG5nT25Jbml0KCkge1xuICAgIHZvaWQgdGhpcy5jYXJnYXIoKTtcbiAgfVxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmFjdGl2byA9IGZhbHNlO1xuICAgIHRoaXMuY3JlZGVuY2lhbGVzID0gbnVsbDtcbiAgfVxuICBjYW1iaWFyRG9jdG9yKCkge1xuICAgIHRoaXMuY3JlZGVuY2lhbGVzID0gbnVsbDtcbiAgICB0aGlzLnVzZXJuYW1lID0gXCJcIjtcbiAgICB0aGlzLmVycm9yID0gXCJcIjtcbiAgfVxuICBhc3luYyBjYXJnYXIoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZG9jdG9yZXMgPSBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLnNlcnZpY2UubGlzdGFyKCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuZXJyb3IgPSBlcnJvclRleHQoZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG4gIGFzeW5jIGdlbmVyYXJBY2Nlc28oKSB7XG4gICAgaWYgKHRoaXMuZ3VhcmRhbmRvKSByZXR1cm47XG4gICAgdGhpcy5jcmVkZW5jaWFsZXMgPSBudWxsO1xuICAgIHRoaXMuZXJyb3IgPSBcIlwiO1xuICAgIGlmICghdGhpcy5kb2N0b3IgfHwgdGhpcy5hY2Nlc29Gb3JtLmludmFsaWQpIHtcbiAgICAgIHRoaXMuYWNjZXNvRm9ybS5tYXJrQWxsQXNUb3VjaGVkKCk7XG4gICAgICB0aGlzLmVycm9yID1cbiAgICAgICAgXCJTZWxlY2Npb25hIHVuIGRvY3RvciB5IGVzY3JpYmUgdW4gdXN1YXJpbyBkZSAzIGEgNjAgY2FyYWN0ZXJlczogbGV0cmFzLCBuw7ptZXJvcywgcHVudG8sIGd1aW9uIG8gZ3Vpb24gYmFqb1wiO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBpZCA9IHRoaXMuc2VsZWN0ZWREb2N0b3I7XG4gICAgdGhpcy5ndWFyZGFuZG8gPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBmaXJzdFZhbHVlRnJvbShcbiAgICAgICAgdGhpcy5zZXJ2aWNlLmNyZWFyQWNjZXNvKGlkLCB0aGlzLnVzZXJuYW1lLnRyaW0oKSksXG4gICAgICApO1xuICAgICAgaWYgKHRoaXMuYWN0aXZvICYmIGlkID09PSB0aGlzLnNlbGVjdGVkRG9jdG9yKSB0aGlzLmNyZWRlbmNpYWxlcyA9IHJlc3VsdDtcbiAgICAgIHRoaXMuZG9jdG9yZXMgPSB0aGlzLmRvY3RvcmVzLmZpbHRlcigoZCkgPT4gZC5pZERvY3RvciAhPT0gaWQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuZXJyb3IgPSBlcnJvclRleHQoZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZ3VhcmRhbmRvID0gZmFsc2U7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxufVxuIl19
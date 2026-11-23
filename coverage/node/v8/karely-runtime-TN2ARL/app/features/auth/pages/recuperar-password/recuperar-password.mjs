var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { RecoveryService } from '../../services/recovery-service.mjs';
let RecuperarPassword = class RecuperarPassword {
    service = inject(RecoveryService);
    changeDetector = inject(ChangeDetectorRef);
    error = "";
    loading = false;
    enviado = false;
    form = new FormGroup({
        correo: new FormControl("", {
            nonNullable: true,
            validators: [
                Validators.required,
                Validators.email,
                Validators.maxLength(150),
            ],
        }),
    });
    async enviar() {
        if (this.loading || this.enviado)
            return;
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.error = "Introduce un correo electrónico válido.";
            return;
        }
        this.error = "";
        this.loading = true;
        try {
            await this.service.solicitar(this.form.getRawValue().correo.trim());
            this.enviado = true;
        }
        catch {
            this.error =
                "No se pudo enviar la solicitud. Inténtalo nuevamente en unos minutos.";
        }
        finally {
            this.loading = false;
            this.changeDetector.markForCheck();
        }
    }
};
RecuperarPassword = __decorate([
    Component({
        standalone: true,
        imports: [ReactiveFormsModule, RouterLink],
        template: "<main class=\"recovery-shell\">\n  <section class=\"recovery-panel\" aria-labelledby=\"recovery-title\">\n    <img src=\"/img/LOGO GRANDE.png\" alt=\"Karely’s\" class=\"logo\" />\n    <h1 id=\"recovery-title\">Recupera tu contraseña</h1>\n    @if(enviado) {\n    <div role=\"status\">\n      <h2>Revisa tu bandeja de entrada</h2>\n      <p>\n        Si el correo corresponde a una cuenta, recibirás instrucciones para\n        restablecer tu contraseña.\n      </p>\n      <p>\n        Revisa también la carpeta de correo no deseado. El enlace es de un solo\n        uso y vence en 15 minutos.\n      </p>\n    </div>\n    } @else {\n    <p>\n      Escribe el correo asociado a tu cuenta para solicitar un enlace de\n      recuperación.\n    </p>\n    <form [formGroup]=\"form\" (ngSubmit)=\"enviar()\" [attr.aria-busy]=\"loading\">\n      <label for=\"correo\">Correo electrónico</label>\n      <input\n        id=\"correo\"\n        type=\"email\"\n        formControlName=\"correo\"\n        autocomplete=\"email\"\n        maxlength=\"150\"\n        required\n        [readOnly]=\"loading\"\n        aria-describedby=\"correo-ayuda\"\n      />\n      <p id=\"correo-ayuda\" class=\"help\">Por ejemplo: nombre&#64;correo.com</p>\n      @if(error) {\n      <p class=\"error\" role=\"alert\">{{error}}</p>\n      }\n      <button type=\"submit\" [disabled]=\"loading\">\n        {{loading ? 'Enviando solicitud…' : 'Solicitar enlace'}}\n      </button>\n    </form>\n    }\n    <a routerLink=\"/login\">Volver a iniciar sesión</a>\n  </section>\n</main>\n",
        styles: [],
    })
], RecuperarPassword);
export { RecuperarPassword };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjdXBlcmFyLXBhc3N3b3JkLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vQzovVU5JVkVSU0lEQUQvTFAyL1NFTUFOQTExL2thcmVseV9tb2Rlcm5vL2Zyb250ZW5kL3NyYy9hcHAvZmVhdHVyZXMvYXV0aC9wYWdlcy9yZWN1cGVyYXItcGFzc3dvcmQvIiwic291cmNlcyI6WyJyZWN1cGVyYXItcGFzc3dvcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUNMLFdBQVcsRUFDWCxTQUFTLEVBQ1QsbUJBQW1CLEVBQ25CLFVBQVUsR0FDWCxNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFPM0QsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBaUI7SUFDWCxPQUFPLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2xDLGNBQWMsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUM1RCxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ1gsT0FBTyxHQUFHLEtBQUssQ0FBQztJQUNoQixPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQ1AsSUFBSSxHQUFHLElBQUksU0FBUyxDQUFDO1FBQzVCLE1BQU0sRUFBRSxJQUFJLFdBQVcsQ0FBQyxFQUFFLEVBQUU7WUFDMUIsV0FBVyxFQUFFLElBQUk7WUFDakIsVUFBVSxFQUFFO2dCQUNWLFVBQVUsQ0FBQyxRQUFRO2dCQUNuQixVQUFVLENBQUMsS0FBSztnQkFDaEIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7YUFDMUI7U0FDRixDQUFDO0tBQ0gsQ0FBQyxDQUFDO0lBQ0gsS0FBSyxDQUFDLE1BQU07UUFDVixJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBQ3pDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLEtBQUssR0FBRyx5Q0FBeUMsQ0FBQztZQUN2RCxPQUFPO1FBQ1QsQ0FBQztRQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQztZQUNILE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ1AsSUFBSSxDQUFDLEtBQUs7Z0JBQ1IsdUVBQXVFLENBQUM7UUFDNUUsQ0FBQztnQkFBUyxDQUFDO1lBQ1QsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDckIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNyQyxDQUFDO0lBQ0gsQ0FBQztDQUNGLENBQUE7QUFwQ1ksaUJBQWlCO0lBTjdCLFNBQVMsQ0FBQztRQUNULFVBQVUsRUFBRSxJQUFJO1FBQ2hCLE9BQU8sRUFBRSxDQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQztRQUMxQyxRQUFRLEVBQUMsc2hEQUFzaEQ7UUFDL2hELE1BQU0sRUFBQyxFQUFFO0tBQ1YsQ0FBQztHQUNXLGlCQUFpQixDQW9DN0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBpbmplY3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtcbiAgRm9ybUNvbnRyb2wsXG4gIEZvcm1Hcm91cCxcbiAgUmVhY3RpdmVGb3Jtc01vZHVsZSxcbiAgVmFsaWRhdG9ycyxcbn0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5pbXBvcnQgeyBSb3V0ZXJMaW5rIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgUmVjb3ZlcnlTZXJ2aWNlIH0gZnJvbSBcIi4uLy4uL3NlcnZpY2VzL3JlY292ZXJ5LXNlcnZpY2VcIjtcbkBDb21wb25lbnQoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbUmVhY3RpdmVGb3Jtc01vZHVsZSwgUm91dGVyTGlua10sXG4gIHRlbXBsYXRlOlwiPG1haW4gY2xhc3M9XFxcInJlY292ZXJ5LXNoZWxsXFxcIj5cXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJyZWNvdmVyeS1wYW5lbFxcXCIgYXJpYS1sYWJlbGxlZGJ5PVxcXCJyZWNvdmVyeS10aXRsZVxcXCI+XFxuICAgIDxpbWcgc3JjPVxcXCIvaW1nL0xPR08gR1JBTkRFLnBuZ1xcXCIgYWx0PVxcXCJLYXJlbHnigJlzXFxcIiBjbGFzcz1cXFwibG9nb1xcXCIgLz5cXG4gICAgPGgxIGlkPVxcXCJyZWNvdmVyeS10aXRsZVxcXCI+UmVjdXBlcmEgdHUgY29udHJhc2XDsWE8L2gxPlxcbiAgICBAaWYoZW52aWFkbykge1xcbiAgICA8ZGl2IHJvbGU9XFxcInN0YXR1c1xcXCI+XFxuICAgICAgPGgyPlJldmlzYSB0dSBiYW5kZWphIGRlIGVudHJhZGE8L2gyPlxcbiAgICAgIDxwPlxcbiAgICAgICAgU2kgZWwgY29ycmVvIGNvcnJlc3BvbmRlIGEgdW5hIGN1ZW50YSwgcmVjaWJpcsOhcyBpbnN0cnVjY2lvbmVzIHBhcmFcXG4gICAgICAgIHJlc3RhYmxlY2VyIHR1IGNvbnRyYXNlw7FhLlxcbiAgICAgIDwvcD5cXG4gICAgICA8cD5cXG4gICAgICAgIFJldmlzYSB0YW1iacOpbiBsYSBjYXJwZXRhIGRlIGNvcnJlbyBubyBkZXNlYWRvLiBFbCBlbmxhY2UgZXMgZGUgdW4gc29sb1xcbiAgICAgICAgdXNvIHkgdmVuY2UgZW4gMTUgbWludXRvcy5cXG4gICAgICA8L3A+XFxuICAgIDwvZGl2PlxcbiAgICB9IEBlbHNlIHtcXG4gICAgPHA+XFxuICAgICAgRXNjcmliZSBlbCBjb3JyZW8gYXNvY2lhZG8gYSB0dSBjdWVudGEgcGFyYSBzb2xpY2l0YXIgdW4gZW5sYWNlIGRlXFxuICAgICAgcmVjdXBlcmFjacOzbi5cXG4gICAgPC9wPlxcbiAgICA8Zm9ybSBbZm9ybUdyb3VwXT1cXFwiZm9ybVxcXCIgKG5nU3VibWl0KT1cXFwiZW52aWFyKClcXFwiIFthdHRyLmFyaWEtYnVzeV09XFxcImxvYWRpbmdcXFwiPlxcbiAgICAgIDxsYWJlbCBmb3I9XFxcImNvcnJlb1xcXCI+Q29ycmVvIGVsZWN0csOzbmljbzwvbGFiZWw+XFxuICAgICAgPGlucHV0XFxuICAgICAgICBpZD1cXFwiY29ycmVvXFxcIlxcbiAgICAgICAgdHlwZT1cXFwiZW1haWxcXFwiXFxuICAgICAgICBmb3JtQ29udHJvbE5hbWU9XFxcImNvcnJlb1xcXCJcXG4gICAgICAgIGF1dG9jb21wbGV0ZT1cXFwiZW1haWxcXFwiXFxuICAgICAgICBtYXhsZW5ndGg9XFxcIjE1MFxcXCJcXG4gICAgICAgIHJlcXVpcmVkXFxuICAgICAgICBbcmVhZE9ubHldPVxcXCJsb2FkaW5nXFxcIlxcbiAgICAgICAgYXJpYS1kZXNjcmliZWRieT1cXFwiY29ycmVvLWF5dWRhXFxcIlxcbiAgICAgIC8+XFxuICAgICAgPHAgaWQ9XFxcImNvcnJlby1heXVkYVxcXCIgY2xhc3M9XFxcImhlbHBcXFwiPlBvciBlamVtcGxvOiBub21icmUmIzY0O2NvcnJlby5jb208L3A+XFxuICAgICAgQGlmKGVycm9yKSB7XFxuICAgICAgPHAgY2xhc3M9XFxcImVycm9yXFxcIiByb2xlPVxcXCJhbGVydFxcXCI+e3tlcnJvcn19PC9wPlxcbiAgICAgIH1cXG4gICAgICA8YnV0dG9uIHR5cGU9XFxcInN1Ym1pdFxcXCIgW2Rpc2FibGVkXT1cXFwibG9hZGluZ1xcXCI+XFxuICAgICAgICB7e2xvYWRpbmcgPyAnRW52aWFuZG8gc29saWNpdHVk4oCmJyA6ICdTb2xpY2l0YXIgZW5sYWNlJ319XFxuICAgICAgPC9idXR0b24+XFxuICAgIDwvZm9ybT5cXG4gICAgfVxcbiAgICA8YSByb3V0ZXJMaW5rPVxcXCIvbG9naW5cXFwiPlZvbHZlciBhIGluaWNpYXIgc2VzacOzbjwvYT5cXG4gIDwvc2VjdGlvbj5cXG48L21haW4+XFxuXCIsXG4gIHN0eWxlczpbXSxcbn0pXG5leHBvcnQgY2xhc3MgUmVjdXBlcmFyUGFzc3dvcmQge1xuICBwcml2YXRlIHJlYWRvbmx5IHNlcnZpY2UgPSBpbmplY3QoUmVjb3ZlcnlTZXJ2aWNlKTtcbiAgcHJpdmF0ZSByZWFkb25seSBjaGFuZ2VEZXRlY3RvciA9IGluamVjdChDaGFuZ2VEZXRlY3RvclJlZik7XG4gIGVycm9yID0gXCJcIjtcbiAgbG9hZGluZyA9IGZhbHNlO1xuICBlbnZpYWRvID0gZmFsc2U7XG4gIHJlYWRvbmx5IGZvcm0gPSBuZXcgRm9ybUdyb3VwKHtcbiAgICBjb3JyZW86IG5ldyBGb3JtQ29udHJvbChcIlwiLCB7XG4gICAgICBub25OdWxsYWJsZTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRvcnM6IFtcbiAgICAgICAgVmFsaWRhdG9ycy5yZXF1aXJlZCxcbiAgICAgICAgVmFsaWRhdG9ycy5lbWFpbCxcbiAgICAgICAgVmFsaWRhdG9ycy5tYXhMZW5ndGgoMTUwKSxcbiAgICAgIF0sXG4gICAgfSksXG4gIH0pO1xuICBhc3luYyBlbnZpYXIoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZyB8fCB0aGlzLmVudmlhZG8pIHJldHVybjtcbiAgICBpZiAodGhpcy5mb3JtLmludmFsaWQpIHtcbiAgICAgIHRoaXMuZm9ybS5tYXJrQWxsQXNUb3VjaGVkKCk7XG4gICAgICB0aGlzLmVycm9yID0gXCJJbnRyb2R1Y2UgdW4gY29ycmVvIGVsZWN0csOzbmljbyB2w6FsaWRvLlwiO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmVycm9yID0gXCJcIjtcbiAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLnNlcnZpY2Uuc29saWNpdGFyKHRoaXMuZm9ybS5nZXRSYXdWYWx1ZSgpLmNvcnJlby50cmltKCkpO1xuICAgICAgdGhpcy5lbnZpYWRvID0gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRoaXMuZXJyb3IgPVxuICAgICAgICBcIk5vIHNlIHB1ZG8gZW52aWFyIGxhIHNvbGljaXR1ZC4gSW50w6ludGFsbyBudWV2YW1lbnRlIGVuIHVub3MgbWludXRvcy5cIjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxufVxuIl19
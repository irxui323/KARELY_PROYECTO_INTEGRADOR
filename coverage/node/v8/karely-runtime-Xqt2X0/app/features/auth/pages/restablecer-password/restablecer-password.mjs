var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AuthService } from '../../../../core/auth/auth-service.mjs';
import { RecoveryService } from '../../services/recovery-service.mjs';
let RestablecerPassword = class RestablecerPassword {
    service = inject(RecoveryService);
    auth = inject(AuthService);
    changeDetector = inject(ChangeDetectorRef);
    token = new URLSearchParams(inject(ActivatedRoute).snapshot.fragment ?? "").get("token") ?? "";
    error = "";
    loading = false;
    exito = false;
    enlaceInvalido = !/^[A-Za-z0-9_-]{43}$/.test(this.token);
    form = new FormGroup({
        password: new FormControl("", {
            nonNullable: true,
            validators: [
                Validators.required,
                Validators.minLength(12),
                Validators.maxLength(72),
                (control) => new TextEncoder().encode(control.value ?? "").length <= 72
                    ? null
                    : { maxBytes: true },
            ],
        }),
        confirmacionPassword: new FormControl("", {
            nonNullable: true,
            validators: [
                Validators.required,
                Validators.minLength(12),
                Validators.maxLength(72),
                (control) => new TextEncoder().encode(control.value ?? "").length <= 72
                    ? null
                    : { maxBytes: true },
            ],
        }),
    }, {
        validators: (group) => group.get("password")?.value ===
            group.get("confirmacionPassword")?.value
            ? null
            : { noCoinciden: true },
    });
    constructor() {
        history.replaceState(history.state, "", location.pathname + location.search);
    }
    ngOnDestroy() {
        this.token = "";
        this.form.reset();
    }
    async enviar() {
        if (this.loading || this.exito || this.enlaceInvalido)
            return;
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.error =
                this.form.controls.password.hasError("maxBytes") ||
                    this.form.controls.password.hasError("maxlength")
                    ? "La contraseña es demasiado larga. Usa una más corta."
                    : "Usa al menos 12 caracteres y comprueba que ambas contraseñas coincidan.";
            return;
        }
        this.error = "";
        this.loading = true;
        try {
            const { password, confirmacionPassword } = this.form.getRawValue();
            await this.service.restablecer(this.token, password, confirmacionPassword);
            this.token = "";
            this.form.reset();
            this.auth.limpiarSesionLocal();
            this.exito = true;
        }
        catch (e) {
            if (e instanceof HttpErrorResponse && e.status === 400) {
                this.error =
                    "No se pudo restablecer. Comprueba que la contraseña sea nueva o solicita otro enlace si venció.";
            }
            else {
                this.error =
                    "No se pudo actualizar la contraseña. Inténtalo nuevamente en unos minutos.";
            }
        }
        finally {
            this.loading = false;
            this.changeDetector.markForCheck();
        }
    }
};
RestablecerPassword = __decorate([
    Component({
        standalone: true,
        imports: [ReactiveFormsModule, RouterLink],
        template: "<main class=\"recovery-shell\">\n  <section class=\"recovery-panel\" aria-labelledby=\"reset-title\">\n    <img src=\"/img/LOGO GRANDE.png\" alt=\"Karely’s\" class=\"logo\" />\n    <h1 id=\"reset-title\">Restablece tu contraseña</h1>\n    @if(exito) {\n    <div role=\"status\">\n      <h2>Contraseña actualizada</h2>\n      <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>\n    </div>\n    <a class=\"primary-link\" routerLink=\"/login\">Iniciar sesión</a>\n    } @else if(enlaceInvalido) {\n    <div role=\"alert\">\n      <h2>Este enlace ya no es válido</h2>\n      <p>\n        El enlace venció, ya fue utilizado o los datos no son válidos. Solicita\n        un enlace nuevo y elige una contraseña distinta.\n      </p>\n    </div>\n    <a class=\"primary-link\" routerLink=\"/recuperar-password\"\n      >Solicitar un nuevo enlace</a\n    >\n    <a routerLink=\"/login\">Volver a iniciar sesión</a>\n    } @else {\n    <p>Elige una contraseña nueva para tu cuenta.</p>\n    <form [formGroup]=\"form\" (ngSubmit)=\"enviar()\" [attr.aria-busy]=\"loading\">\n      <label for=\"password\">Nueva contraseña</label>\n      <input\n        id=\"password\"\n        type=\"password\"\n        formControlName=\"password\"\n        autocomplete=\"new-password\"\n        minlength=\"12\"\n        maxlength=\"72\"\n        required\n        [readOnly]=\"loading\"\n        aria-describedby=\"password-ayuda\"\n      />\n      <p id=\"password-ayuda\" class=\"help\">\n        La contraseña debe tener al menos 12 caracteres.\n      </p>\n      <label for=\"confirmacion\">Confirma tu contraseña</label>\n      <input\n        id=\"confirmacion\"\n        type=\"password\"\n        formControlName=\"confirmacionPassword\"\n        autocomplete=\"new-password\"\n        minlength=\"12\"\n        maxlength=\"72\"\n        required\n        [readOnly]=\"loading\"\n      />\n      @if(error) {\n      <p class=\"error\" role=\"alert\">{{error}}</p>\n      }\n      <button type=\"submit\" [disabled]=\"loading\">\n        {{loading ? 'Actualizando…' : 'Guardar nueva contraseña'}}\n      </button>\n    </form>\n    <a routerLink=\"/recuperar-password\">Solicitar un nuevo enlace</a>\n    <a routerLink=\"/login\">Volver a iniciar sesión</a>\n    }\n  </section>\n</main>\n",
        styles: [],
    })
], RestablecerPassword);
export { RestablecerPassword };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdGFibGVjZXItcGFzc3dvcmQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9DOi9VTklWRVJTSURBRC9MUDIvU0VNQU5BMTEva2FyZWx5X21vZGVybm8vZnJvbnRlbmQvc3JjL2FwcC9mZWF0dXJlcy9hdXRoL3BhZ2VzL3Jlc3RhYmxlY2VyLXBhc3N3b3JkLyIsInNvdXJjZXMiOlsicmVzdGFibGVjZXItcGFzc3dvcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDekQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBYSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDaEYsT0FBTyxFQUNMLFdBQVcsRUFDWCxTQUFTLEVBQ1QsbUJBQW1CLEVBQ25CLFVBQVUsR0FDWCxNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8sRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQU8zRCxJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFtQjtJQUNiLE9BQU8sR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDbEMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMzQixjQUFjLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDcEQsS0FBSyxHQUNYLElBQUksZUFBZSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FDckUsT0FBTyxDQUNSLElBQUksRUFBRSxDQUFDO0lBQ1YsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNYLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFD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QUFFLG9CQUFvQixFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuRSxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUM1QixJQUFJLENBQUMsS0FBSyxFQUNWLFFBQVEsRUFDUixvQkFBb0IsQ0FDckIsQ0FBQztZQUNGLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1gsSUFBSSxDQUFDLFlBQVksaUJBQWlCLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDdkQsSUFBSSxDQUFDLEtBQUs7b0JBQ1IsaUdBQWlHLENBQUM7WUFDdEcsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLElBQUksQ0FBQyxLQUFLO29CQUNSLDRFQUE0RSxDQUFDO1lBQ2pGLENBQUM7UUFDSCxDQUFDO2dCQUFTLENBQUM7WUFDVCxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNyQixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JDLENBQUM7SUFDSCxDQUFDO0NBQ0YsQ0FBQTtBQS9GWSxtQkFBbUI7SUFOL0IsU0FBUyxDQUFDO1FBQ1QsVUFBVSxFQUFFLElBQUk7UUFDaEIsT0FBTyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxDQUFDO1FBQzFDLFFBQVEsRUFBQyx3dUVBQXd1RTtRQUNqdkUsTUFBTSxFQUFDLEVBQUU7S0FDVixDQUFDO0dBQ1csbUJBQW1CLENBK0YvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBFcnJvclJlc3BvbnNlIH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBPbkRlc3Ryb3ksIGluamVjdCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge1xuICBGb3JtQ29udHJvbCxcbiAgRm9ybUdyb3VwLFxuICBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxuICBWYWxpZGF0b3JzLFxufSBmcm9tIFwiQGFuZ3VsYXIvZm9ybXNcIjtcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlLCBSb3V0ZXJMaW5rIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgQXV0aFNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29yZS9hdXRoL2F1dGgtc2VydmljZVwiO1xuaW1wb3J0IHsgUmVjb3ZlcnlTZXJ2aWNlIH0gZnJvbSBcIi4uLy4uL3NlcnZpY2VzL3JlY292ZXJ5LXNlcnZpY2VcIjtcbkBDb21wb25lbnQoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbUmVhY3RpdmVGb3Jtc01vZHVsZSwgUm91dGVyTGlua10sXG4gIHRlbXBsYXRlOlwiPG1haW4gY2xhc3M9XFxcInJlY292ZXJ5LXNoZWxsXFxcIj5cXG4gIDxzZWN0aW9uIGNsYXNzPVxcXCJyZWNvdmVyeS1wYW5lbFxcXCIgYXJpYS1sYWJlbGxlZGJ5PVxcXCJyZXNldC10aXRsZVxcXCI+XFxuICAgIDxpbWcgc3JjPVxcXCIvaW1nL0xPR08gR1JBTkRFLnBuZ1xcXCIgYWx0PVxcXCJLYXJlbHnigJlzXFxcIiBjbGFzcz1cXFwibG9nb1xcXCIgLz5cXG4gICAgPGgxIGlkPVxcXCJyZXNldC10aXRsZVxcXCI+UmVzdGFibGVjZSB0dSBjb250cmFzZcOxYTwvaDE+XFxuICAgIEBpZihleGl0bykge1xcbiAgICA8ZGl2IHJvbGU9XFxcInN0YXR1c1xcXCI+XFxuICAgICAgPGgyPkNvbnRyYXNlw7FhIGFjdHVhbGl6YWRhPC9oMj5cXG4gICAgICA8cD5ZYSBwdWVkZXMgaW5pY2lhciBzZXNpw7NuIGNvbiB0dSBudWV2YSBjb250cmFzZcOxYS48L3A+XFxuICAgIDwvZGl2PlxcbiAgICA8YSBjbGFzcz1cXFwicHJpbWFyeS1saW5rXFxcIiByb3V0ZXJMaW5rPVxcXCIvbG9naW5cXFwiPkluaWNpYXIgc2VzacOzbjwvYT5cXG4gICAgfSBAZWxzZSBpZihlbmxhY2VJbnZhbGlkbykge1xcbiAgICA8ZGl2IHJvbGU9XFxcImFsZXJ0XFxcIj5cXG4gICAgICA8aDI+RXN0ZSBlbmxhY2UgeWEgbm8gZXMgdsOhbGlkbzwvaDI+XFxuICAgICAgPHA+XFxuICAgICAgICBFbCBlbmxhY2UgdmVuY2nDsywgeWEgZnVlIHV0aWxpemFkbyBvIGxvcyBkYXRvcyBubyBzb24gdsOhbGlkb3MuIFNvbGljaXRhXFxuICAgICAgICB1biBlbmxhY2UgbnVldm8geSBlbGlnZSB1bmEgY29udHJhc2XDsWEgZGlzdGludGEuXFxuICAgICAgPC9wPlxcbiAgICA8L2Rpdj5cXG4gICAgPGEgY2xhc3M9XFxcInByaW1hcnktbGlua1xcXCIgcm91dGVyTGluaz1cXFwiL3JlY3VwZXJhci1wYXNzd29yZFxcXCJcXG4gICAgICA+U29saWNpdGFyIHVuIG51ZXZvIGVubGFjZTwvYVxcbiAgICA+XFxuICAgIDxhIHJvdXRlckxpbms9XFxcIi9sb2dpblxcXCI+Vm9sdmVyIGEgaW5pY2lhciBzZXNpw7NuPC9hPlxcbiAgICB9IEBlbHNlIHtcXG4gICAgPHA+RWxpZ2UgdW5hIGNvbnRyYXNlw7FhIG51ZXZhIHBhcmEgdHUgY3VlbnRhLjwvcD5cXG4gICAgPGZvcm0gW2Zvcm1Hcm91cF09XFxcImZvcm1cXFwiIChuZ1N1Ym1pdCk9XFxcImVudmlhcigpXFxcIiBbYXR0ci5hcmlhLWJ1c3ldPVxcXCJsb2FkaW5nXFxcIj5cXG4gICAgICA8bGFiZWwgZm9yPVxcXCJwYXNzd29yZFxcXCI+TnVldmEgY29udHJhc2XDsWE8L2xhYmVsPlxcbiAgICAgIDxpbnB1dFxcbiAgICAgICAgaWQ9XFxcInBhc3N3b3JkXFxcIlxcbiAgICAgICAgdHlwZT1cXFwicGFzc3dvcmRcXFwiXFxuICAgICAgICBmb3JtQ29udHJvbE5hbWU9XFxcInBhc3N3b3JkXFxcIlxcbiAgICAgICAgYXV0b2NvbXBsZXRlPVxcXCJuZXctcGFzc3dvcmRcXFwiXFxuICAgICAgICBtaW5sZW5ndGg9XFxcIjEyXFxcIlxcbiAgICAgICAgbWF4bGVuZ3RoPVxcXCI3MlxcXCJcXG4gICAgICAgIHJlcXVpcmVkXFxuICAgICAgICBbcmVhZE9ubHldPVxcXCJsb2FkaW5nXFxcIlxcbiAgICAgICAgYXJpYS1kZXNjcmliZWRieT1cXFwicGFzc3dvcmQtYXl1ZGFcXFwiXFxuICAgICAgLz5cXG4gICAgICA8cCBpZD1cXFwicGFzc3dvcmQtYXl1ZGFcXFwiIGNsYXNzPVxcXCJoZWxwXFxcIj5cXG4gICAgICAgIExhIGNvbnRyYXNlw7FhIGRlYmUgdGVuZXIgYWwgbWVub3MgMTIgY2FyYWN0ZXJlcy5cXG4gICAgICA8L3A+XFxuICAgICAgPGxhYmVsIGZvcj1cXFwiY29uZmlybWFjaW9uXFxcIj5Db25maXJtYSB0dSBjb250cmFzZcOxYTwvbGFiZWw+XFxuICAgICAgPGlucHV0XFxuICAgICAgICBpZD1cXFwiY29uZmlybWFjaW9uXFxcIlxcbiAgICAgICAgdHlwZT1cXFwicGFzc3dvcmRcXFwiXFxuICAgICAgICBmb3JtQ29udHJvbE5hbWU9XFxcImNvbmZpcm1hY2lvblBhc3N3b3JkXFxcIlxcbiAgICAgICAgYXV0b2NvbXBsZXRlPVxcXCJuZXctcGFzc3dvcmRcXFwiXFxuICAgICAgICBtaW5sZW5ndGg9XFxcIjEyXFxcIlxcbiAgICAgICAgbWF4bGVuZ3RoPVxcXCI3MlxcXCJcXG4gICAgICAgIHJlcXVpcmVkXFxuICAgICAgICBbcmVhZE9ubHldPVxcXCJsb2FkaW5nXFxcIlxcbiAgICAgIC8+XFxuICAgICAgQGlmKGVycm9yKSB7XFxuICAgICAgPHAgY2xhc3M9XFxcImVycm9yXFxcIiByb2xlPVxcXCJhbGVydFxcXCI+e3tlcnJvcn19PC9wPlxcbiAgICAgIH1cXG4gICAgICA8YnV0dG9uIHR5cGU9XFxcInN1Ym1pdFxcXCIgW2Rpc2FibGVkXT1cXFwibG9hZGluZ1xcXCI+XFxuICAgICAgICB7e2xvYWRpbmcgPyAnQWN0dWFsaXphbmRv4oCmJyA6ICdHdWFyZGFyIG51ZXZhIGNvbnRyYXNlw7FhJ319XFxuICAgICAgPC9idXR0b24+XFxuICAgIDwvZm9ybT5cXG4gICAgPGEgcm91dGVyTGluaz1cXFwiL3JlY3VwZXJhci1wYXNzd29yZFxcXCI+U29saWNpdGFyIHVuIG51ZXZvIGVubGFjZTwvYT5cXG4gICAgPGEgcm91dGVyTGluaz1cXFwiL2xvZ2luXFxcIj5Wb2x2ZXIgYSBpbmljaWFyIHNlc2nDs248L2E+XFxuICAgIH1cXG4gIDwvc2VjdGlvbj5cXG48L21haW4+XFxuXCIsXG4gIHN0eWxlczpbXSxcbn0pXG5leHBvcnQgY2xhc3MgUmVzdGFibGVjZXJQYXNzd29yZCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgc2VydmljZSA9IGluamVjdChSZWNvdmVyeVNlcnZpY2UpO1xuICBwcml2YXRlIHJlYWRvbmx5IGF1dGggPSBpbmplY3QoQXV0aFNlcnZpY2UpO1xuICBwcml2YXRlIHJlYWRvbmx5IGNoYW5nZURldGVjdG9yID0gaW5qZWN0KENoYW5nZURldGVjdG9yUmVmKTtcbiAgcHJpdmF0ZSB0b2tlbiA9XG4gICAgbmV3IFVSTFNlYXJjaFBhcmFtcyhpbmplY3QoQWN0aXZhdGVkUm91dGUpLnNuYXBzaG90LmZyYWdtZW50ID8/IFwiXCIpLmdldChcbiAgICAgIFwidG9rZW5cIixcbiAgICApID8/IFwiXCI7XG4gIGVycm9yID0gXCJcIjtcbiAgbG9hZGluZyA9IGZhbHNlO1xuICBleGl0byA9IGZhbHNlO1xuICBlbmxhY2VJbnZhbGlkbyA9ICEvXltBLVphLXowLTlfLV17NDN9JC8udGVzdCh0aGlzLnRva2VuKTtcbiAgcmVhZG9ubHkgZm9ybSA9IG5ldyBGb3JtR3JvdXAoXG4gICAge1xuICAgICAgcGFzc3dvcmQ6IG5ldyBGb3JtQ29udHJvbChcIlwiLCB7XG4gICAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgICAgICB2YWxpZGF0b3JzOiBbXG4gICAgICAgICAgVmFsaWRhdG9ycy5yZXF1aXJlZCxcbiAgICAgICAgICBWYWxpZGF0b3JzLm1pbkxlbmd0aCgxMiksXG4gICAgICAgICAgVmFsaWRhdG9ycy5tYXhMZW5ndGgoNzIpLFxuICAgICAgICAgIChjb250cm9sKSA9PlxuICAgICAgICAgICAgbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGNvbnRyb2wudmFsdWUgPz8gXCJcIikubGVuZ3RoIDw9IDcyXG4gICAgICAgICAgICAgID8gbnVsbFxuICAgICAgICAgICAgICA6IHsgbWF4Qnl0ZXM6IHRydWUgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgICAgY29uZmlybWFjaW9uUGFzc3dvcmQ6IG5ldyBGb3JtQ29udHJvbChcIlwiLCB7XG4gICAgICAgIG5vbk51bGxhYmxlOiB0cnVlLFxuICAgICAgICB2YWxpZGF0b3JzOiBbXG4gICAgICAgICAgVmFsaWRhdG9ycy5yZXF1aXJlZCxcbiAgICAgICAgICBWYWxpZGF0b3JzLm1pbkxlbmd0aCgxMiksXG4gICAgICAgICAgVmFsaWRhdG9ycy5tYXhMZW5ndGgoNzIpLFxuICAgICAgICAgIChjb250cm9sKSA9PlxuICAgICAgICAgICAgbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGNvbnRyb2wudmFsdWUgPz8gXCJcIikubGVuZ3RoIDw9IDcyXG4gICAgICAgICAgICAgID8gbnVsbFxuICAgICAgICAgICAgICA6IHsgbWF4Qnl0ZXM6IHRydWUgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgIH0sXG4gICAge1xuICAgICAgdmFsaWRhdG9yczogKGdyb3VwKSA9PlxuICAgICAgICBncm91cC5nZXQoXCJwYXNzd29yZFwiKT8udmFsdWUgPT09XG4gICAgICAgIGdyb3VwLmdldChcImNvbmZpcm1hY2lvblBhc3N3b3JkXCIpPy52YWx1ZVxuICAgICAgICAgID8gbnVsbFxuICAgICAgICAgIDogeyBub0NvaW5jaWRlbjogdHJ1ZSB9LFxuICAgIH0sXG4gICk7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKFxuICAgICAgaGlzdG9yeS5zdGF0ZSxcbiAgICAgIFwiXCIsXG4gICAgICBsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLnNlYXJjaCxcbiAgICApO1xuICB9XG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMudG9rZW4gPSBcIlwiO1xuICAgIHRoaXMuZm9ybS5yZXNldCgpO1xuICB9XG4gIGFzeW5jIGVudmlhcigpIHtcbiAgICBpZiAodGhpcy5sb2FkaW5nIHx8IHRoaXMuZXhpdG8gfHwgdGhpcy5lbmxhY2VJbnZhbGlkbykgcmV0dXJuO1xuICAgIGlmICh0aGlzLmZvcm0uaW52YWxpZCkge1xuICAgICAgdGhpcy5mb3JtLm1hcmtBbGxBc1RvdWNoZWQoKTtcbiAgICAgIHRoaXMuZXJyb3IgPVxuICAgICAgICB0aGlzLmZvcm0uY29udHJvbHMucGFzc3dvcmQuaGFzRXJyb3IoXCJtYXhCeXRlc1wiKSB8fFxuICAgICAgICB0aGlzLmZvcm0uY29udHJvbHMucGFzc3dvcmQuaGFzRXJyb3IoXCJtYXhsZW5ndGhcIilcbiAgICAgICAgICA/IFwiTGEgY29udHJhc2XDsWEgZXMgZGVtYXNpYWRvIGxhcmdhLiBVc2EgdW5hIG3DoXMgY29ydGEuXCJcbiAgICAgICAgICA6IFwiVXNhIGFsIG1lbm9zIDEyIGNhcmFjdGVyZXMgeSBjb21wcnVlYmEgcXVlIGFtYmFzIGNvbnRyYXNlw7FhcyBjb2luY2lkYW4uXCI7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZXJyb3IgPSBcIlwiO1xuICAgIHRoaXMubG9hZGluZyA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgcGFzc3dvcmQsIGNvbmZpcm1hY2lvblBhc3N3b3JkIH0gPSB0aGlzLmZvcm0uZ2V0UmF3VmFsdWUoKTtcbiAgICAgIGF3YWl0IHRoaXMuc2VydmljZS5yZXN0YWJsZWNlcihcbiAgICAgICAgdGhpcy50b2tlbixcbiAgICAgICAgcGFzc3dvcmQsXG4gICAgICAgIGNvbmZpcm1hY2lvblBhc3N3b3JkLFxuICAgICAgKTtcbiAgICAgIHRoaXMudG9rZW4gPSBcIlwiO1xuICAgICAgdGhpcy5mb3JtLnJlc2V0KCk7XG4gICAgICB0aGlzLmF1dGgubGltcGlhclNlc2lvbkxvY2FsKCk7XG4gICAgICB0aGlzLmV4aXRvID0gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEh0dHBFcnJvclJlc3BvbnNlICYmIGUuc3RhdHVzID09PSA0MDApIHtcbiAgICAgICAgdGhpcy5lcnJvciA9XG4gICAgICAgICAgXCJObyBzZSBwdWRvIHJlc3RhYmxlY2VyLiBDb21wcnVlYmEgcXVlIGxhIGNvbnRyYXNlw7FhIHNlYSBudWV2YSBvIHNvbGljaXRhIG90cm8gZW5sYWNlIHNpIHZlbmNpw7MuXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVycm9yID1cbiAgICAgICAgICBcIk5vIHNlIHB1ZG8gYWN0dWFsaXphciBsYSBjb250cmFzZcOxYS4gSW50w6ludGFsbyBudWV2YW1lbnRlIGVuIHVub3MgbWludXRvcy5cIjtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxufVxuIl19
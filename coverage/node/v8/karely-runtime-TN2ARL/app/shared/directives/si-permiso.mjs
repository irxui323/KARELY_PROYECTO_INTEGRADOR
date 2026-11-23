var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Directive, TemplateRef, ViewContainerRef, effect, inject, input, } from "@angular/core";
import { AuthService } from '../../core/auth/auth-service.mjs';
let SiPermiso = class SiPermiso {
    siPermiso = input.required();
    auth = inject(AuthService);
    template = inject((TemplateRef));
    container = inject(ViewContainerRef);
    visible = false;
    constructor() {
        effect(() => {
            const permitido = this.auth.tienePermiso(this.siPermiso());
            if (permitido === this.visible)
                return;
            this.visible = permitido;
            this.container.clear();
            if (permitido)
                this.container.createEmbeddedView(this.template);
        });
    }
};
SiPermiso = __decorate([
    Directive({ selector: "[siPermiso]", standalone: true })
], SiPermiso);
export { SiPermiso };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ktcGVybWlzby5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL3NoYXJlZC9kaXJlY3RpdmVzLyIsInNvdXJjZXMiOlsic2ktcGVybWlzby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUNULFdBQVcsRUFDWCxnQkFBZ0IsRUFDaEIsTUFBTSxFQUNOLE1BQU0sRUFDTixLQUFLLEdBQ04sTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBR3BELElBQU0sU0FBUyxHQUFmLE1BQU0sU0FBUztJQUNYLFNBQVMsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFXLENBQUM7SUFDdkMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMzQixRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUEsV0FBb0IsQ0FBQSxDQUFDLENBQUM7SUFDeEMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3JDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDeEI7UUFDRSxNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ1YsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDM0QsSUFBSSxTQUFTLEtBQUssSUFBSSxDQUFDLE9BQU87Z0JBQUUsT0FBTztZQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztZQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3ZCLElBQUksU0FBUztnQkFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRixDQUFBO0FBZlksU0FBUztJQURyQixTQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQztHQUM1QyxTQUFTLENBZXJCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgZWZmZWN0LFxuICBpbmplY3QsXG4gIGlucHV0LFxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQXV0aFNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vY29yZS9hdXRoL2F1dGgtc2VydmljZVwiO1xuaW1wb3J0IHsgUGVybWlzbyB9IGZyb20gXCIuLi8uLi9jb3JlL2F1dGgvYXV0aC5tb2RlbFwiO1xuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiBcIltzaVBlcm1pc29dXCIsIHN0YW5kYWxvbmU6IHRydWUgfSlcbmV4cG9ydCBjbGFzcyBTaVBlcm1pc28ge1xuICByZWFkb25seSBzaVBlcm1pc28gPSBpbnB1dC5yZXF1aXJlZDxQZXJtaXNvPigpO1xuICBwcml2YXRlIGF1dGggPSBpbmplY3QoQXV0aFNlcnZpY2UpO1xuICBwcml2YXRlIHRlbXBsYXRlID0gaW5qZWN0KFRlbXBsYXRlUmVmPHVua25vd24+KTtcbiAgcHJpdmF0ZSBjb250YWluZXIgPSBpbmplY3QoVmlld0NvbnRhaW5lclJlZik7XG4gIHByaXZhdGUgdmlzaWJsZSA9IGZhbHNlO1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBlZmZlY3QoKCkgPT4ge1xuICAgICAgY29uc3QgcGVybWl0aWRvID0gdGhpcy5hdXRoLnRpZW5lUGVybWlzbyh0aGlzLnNpUGVybWlzbygpKTtcbiAgICAgIGlmIChwZXJtaXRpZG8gPT09IHRoaXMudmlzaWJsZSkgcmV0dXJuO1xuICAgICAgdGhpcy52aXNpYmxlID0gcGVybWl0aWRvO1xuICAgICAgdGhpcy5jb250YWluZXIuY2xlYXIoKTtcbiAgICAgIGlmIChwZXJtaXRpZG8pIHRoaXMuY29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLnRlbXBsYXRlKTtcbiAgICB9KTtcbiAgfVxufVxuIl19
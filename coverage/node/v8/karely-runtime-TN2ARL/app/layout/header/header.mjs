var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, inject } from "@angular/core";
import { AuthService } from '../../core/auth/auth-service.mjs';
let Header = class Header {
    auth = inject(AuthService);
};
Header = __decorate([
    Component({
        selector: "app-header",
        standalone: true,
        template: "<header class=\"cabecera-superior\">\n  <div></div>\n  <div class=\"datos-usuario\">\n    <div class=\"texto-usuario\">\n      <strong>{{auth.session()?.usuario}}</strong\n      ><span>{{auth.session()?.rol}}</span>\n    </div>\n    <img src=\"/img/ICON_USER.png\" alt=\"Usuario\" class=\"icono-usuario\" /><button\n      type=\"button\"\n      class=\"btn-logout\"\n      (click)=\"auth.logout()\"\n    >\n      Cerrar sesión\n    </button>\n  </div>\n</header>\n@if (auth.porVencer()) {\n  <div class=\"aviso-sesion\" role=\"alert\">\n    Tu sesión vencerá en menos de un minuto. Guarda tu trabajo e inicia sesión nuevamente.\n  </div>\n}\n",
        styles: [],
    })
], Header);
export { Header };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vQzovVU5JVkVSU0lEQUQvTFAyL1NFTUFOQTExL2thcmVseV9tb2Rlcm5vL2Zyb250ZW5kL3NyYy9hcHAvbGF5b3V0L2hlYWRlci8iLCJzb3VyY2VzIjpbImhlYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFPcEQsSUFBTSxNQUFNLEdBQVosTUFBTSxNQUFNO0lBQ2pCLElBQUksR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDNUIsQ0FBQTtBQUZZLE1BQU07SUFObEIsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFlBQVk7UUFDdEIsVUFBVSxFQUFFLElBQUk7UUFDaEIsUUFBUSxFQUFDLG9vQkFBb29CO1FBQzdvQixNQUFNLEVBQUMsRUFBRTtLQUNWLENBQUM7R0FDVyxNQUFNLENBRWxCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBpbmplY3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQXV0aFNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vY29yZS9hdXRoL2F1dGgtc2VydmljZVwiO1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcImFwcC1oZWFkZXJcIixcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgdGVtcGxhdGU6XCI8aGVhZGVyIGNsYXNzPVxcXCJjYWJlY2VyYS1zdXBlcmlvclxcXCI+XFxuICA8ZGl2PjwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cXFwiZGF0b3MtdXN1YXJpb1xcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcInRleHRvLXVzdWFyaW9cXFwiPlxcbiAgICAgIDxzdHJvbmc+e3thdXRoLnNlc3Npb24oKT8udXN1YXJpb319PC9zdHJvbmdcXG4gICAgICA+PHNwYW4+e3thdXRoLnNlc3Npb24oKT8ucm9sfX08L3NwYW4+XFxuICAgIDwvZGl2PlxcbiAgICA8aW1nIHNyYz1cXFwiL2ltZy9JQ09OX1VTRVIucG5nXFxcIiBhbHQ9XFxcIlVzdWFyaW9cXFwiIGNsYXNzPVxcXCJpY29uby11c3VhcmlvXFxcIiAvPjxidXR0b25cXG4gICAgICB0eXBlPVxcXCJidXR0b25cXFwiXFxuICAgICAgY2xhc3M9XFxcImJ0bi1sb2dvdXRcXFwiXFxuICAgICAgKGNsaWNrKT1cXFwiYXV0aC5sb2dvdXQoKVxcXCJcXG4gICAgPlxcbiAgICAgIENlcnJhciBzZXNpw7NuXFxuICAgIDwvYnV0dG9uPlxcbiAgPC9kaXY+XFxuPC9oZWFkZXI+XFxuQGlmIChhdXRoLnBvclZlbmNlcigpKSB7XFxuICA8ZGl2IGNsYXNzPVxcXCJhdmlzby1zZXNpb25cXFwiIHJvbGU9XFxcImFsZXJ0XFxcIj5cXG4gICAgVHUgc2VzacOzbiB2ZW5jZXLDoSBlbiBtZW5vcyBkZSB1biBtaW51dG8uIEd1YXJkYSB0dSB0cmFiYWpvIGUgaW5pY2lhIHNlc2nDs24gbnVldmFtZW50ZS5cXG4gIDwvZGl2Plxcbn1cXG5cIixcbiAgc3R5bGVzOltdLFxufSlcbmV4cG9ydCBjbGFzcyBIZWFkZXIge1xuICBhdXRoID0gaW5qZWN0KEF1dGhTZXJ2aWNlKTtcbn1cbiJdfQ==
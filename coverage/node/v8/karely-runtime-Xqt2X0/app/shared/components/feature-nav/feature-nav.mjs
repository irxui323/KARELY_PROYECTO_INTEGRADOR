var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Input, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../../core/auth/auth-service.mjs';
import { FEATURE_NAVIGATION } from '../../../core/config/feature-navigation.mjs';
let FeatureNav = class FeatureNav {
    feature = "";
    auth = inject(AuthService);
    get links() {
        return (FEATURE_NAVIGATION[this.feature] || [])
            .filter((link) => this.auth.tienePermiso(link.permiso))
            .map((link) => this.feature === "atencion" &&
            this.auth.session()?.rol === "ADMINISTRADORA"
            ? {
                ...link,
                label: link.path === "/doctor" ? "Agenda general" : link.label,
                path: link.path === "/doctor/horarios"
                    ? "/doctores/horarios"
                    : link.path,
            }
            : link);
    }
};
__decorate([
    Input()
], FeatureNav.prototype, "feature", void 0);
FeatureNav = __decorate([
    Component({
        selector: "app-feature-nav",
        standalone: true,
        imports: [RouterLink, RouterLinkActive],
        template: "<nav class=\"k-tabs\" aria-label=\"Operaciones del módulo\">\n  @for(link of links;track link.path){<a\n    class=\"k-tab\"\n    [routerLink]=\"link.path\"\n    routerLinkActive=\"active\"\n    [routerLinkActiveOptions]=\"{exact:true}\"\n    >{{link.label}}</a\n  >}\n</nav>\n",
    })
], FeatureNav);
export { FeatureNav };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmVhdHVyZS1uYXYuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9DOi9VTklWRVJTSURBRC9MUDIvU0VNQU5BMTEva2FyZWx5X21vZGVybm8vZnJvbnRlbmQvc3JjL2FwcC9zaGFyZWQvY29tcG9uZW50cy9mZWF0dXJlLW5hdi8iLCJzb3VyY2VzIjpbImZlYXR1cmUtbmF2LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6RCxPQUFPLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQzlELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBT3RFLElBQU0sVUFBVSxHQUFoQixNQUFNLFVBQVU7SUFDWixPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ0wsSUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM1QyxJQUFJLEtBQUs7UUFDUCxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUM1QyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN0RCxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUNaLElBQUksQ0FBQyxPQUFPLEtBQUssVUFBVTtZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsS0FBSyxnQkFBZ0I7WUFDM0MsQ0FBQyxDQUFDO2dCQUNFLEdBQUcsSUFBSTtnQkFDUCxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSztnQkFDOUQsSUFBSSxFQUNGLElBQUksQ0FBQyxJQUFJLEtBQUssa0JBQWtCO29CQUM5QixDQUFDLENBQUMsb0JBQW9CO29CQUN0QixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUk7YUFDaEI7WUFDSCxDQUFDLENBQUMsSUFBSSxDQUNULENBQUM7SUFDTixDQUFDO0NBQ0YsQ0FBQTtBQW5CVTtJQUFSLEtBQUssRUFBRTsyQ0FBYztBQURYLFVBQVU7SUFOdEIsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGlCQUFpQjtRQUMzQixVQUFVLEVBQUUsSUFBSTtRQUNoQixPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLENBQUM7UUFDdkMsUUFBUSxFQUFDLHNSQUFzUjtLQUNoUyxDQUFDO0dBQ1csVUFBVSxDQW9CdEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBpbmplY3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgUm91dGVyTGluaywgUm91dGVyTGlua0FjdGl2ZSB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcbmltcG9ydCB7IEF1dGhTZXJ2aWNlIH0gZnJvbSBcIi4uLy4uLy4uL2NvcmUvYXV0aC9hdXRoLXNlcnZpY2VcIjtcbmltcG9ydCB7IEZFQVRVUkVfTkFWSUdBVElPTiB9IGZyb20gXCIuLi8uLi8uLi9jb3JlL2NvbmZpZy9mZWF0dXJlLW5hdmlnYXRpb25cIjtcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogXCJhcHAtZmVhdHVyZS1uYXZcIixcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW1JvdXRlckxpbmssIFJvdXRlckxpbmtBY3RpdmVdLFxuICB0ZW1wbGF0ZTpcIjxuYXYgY2xhc3M9XFxcImstdGFic1xcXCIgYXJpYS1sYWJlbD1cXFwiT3BlcmFjaW9uZXMgZGVsIG3Ds2R1bG9cXFwiPlxcbiAgQGZvcihsaW5rIG9mIGxpbmtzO3RyYWNrIGxpbmsucGF0aCl7PGFcXG4gICAgY2xhc3M9XFxcImstdGFiXFxcIlxcbiAgICBbcm91dGVyTGlua109XFxcImxpbmsucGF0aFxcXCJcXG4gICAgcm91dGVyTGlua0FjdGl2ZT1cXFwiYWN0aXZlXFxcIlxcbiAgICBbcm91dGVyTGlua0FjdGl2ZU9wdGlvbnNdPVxcXCJ7ZXhhY3Q6dHJ1ZX1cXFwiXFxuICAgID57e2xpbmsubGFiZWx9fTwvYVxcbiAgPn1cXG48L25hdj5cXG5cIixcbn0pXG5leHBvcnQgY2xhc3MgRmVhdHVyZU5hdiB7XG4gIEBJbnB1dCgpIGZlYXR1cmUgPSBcIlwiO1xuICBwcml2YXRlIHJlYWRvbmx5IGF1dGggPSBpbmplY3QoQXV0aFNlcnZpY2UpO1xuICBnZXQgbGlua3MoKSB7XG4gICAgcmV0dXJuIChGRUFUVVJFX05BVklHQVRJT05bdGhpcy5mZWF0dXJlXSB8fCBbXSlcbiAgICAgIC5maWx0ZXIoKGxpbmspID0+IHRoaXMuYXV0aC50aWVuZVBlcm1pc28obGluay5wZXJtaXNvKSlcbiAgICAgIC5tYXAoKGxpbmspID0+XG4gICAgICAgIHRoaXMuZmVhdHVyZSA9PT0gXCJhdGVuY2lvblwiICYmXG4gICAgICAgIHRoaXMuYXV0aC5zZXNzaW9uKCk/LnJvbCA9PT0gXCJBRE1JTklTVFJBRE9SQVwiXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIC4uLmxpbmssXG4gICAgICAgICAgICAgIGxhYmVsOiBsaW5rLnBhdGggPT09IFwiL2RvY3RvclwiID8gXCJBZ2VuZGEgZ2VuZXJhbFwiIDogbGluay5sYWJlbCxcbiAgICAgICAgICAgICAgcGF0aDpcbiAgICAgICAgICAgICAgICBsaW5rLnBhdGggPT09IFwiL2RvY3Rvci9ob3Jhcmlvc1wiXG4gICAgICAgICAgICAgICAgICA/IFwiL2RvY3RvcmVzL2hvcmFyaW9zXCJcbiAgICAgICAgICAgICAgICAgIDogbGluay5wYXRoLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDogbGluayxcbiAgICAgICk7XG4gIH1cbn1cbiJdfQ==
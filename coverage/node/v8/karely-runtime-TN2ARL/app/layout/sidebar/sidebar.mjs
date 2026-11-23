var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../core/auth/auth-service.mjs';
import { MENU } from '../../core/config/menu.mjs';
import { FEATURE_NAVIGATION } from '../../core/config/feature-navigation.mjs';
let Sidebar = class Sidebar {
    auth = inject(AuthService);
    get tituloPanel() {
        const rol = this.auth.session()?.rol;
        return rol === "DOCTOR"
            ? "PANEL MÉDICO"
            : rol === "RECEPCIONISTA"
                ? "RECEPCIÓN"
                : rol === "CAJERA"
                    ? "CAJA"
                    : rol === "TESORERA"
                        ? "TESORERÍA"
                        : "PANEL DE ADMINISTRACIÓN";
    }
    get esDoctor() {
        return this.auth.session()?.rol === "DOCTOR";
    }
    get menu() {
        const autenticado = this.auth.estaAutenticado();
        if (autenticado && this.esDoctor) {
            return FEATURE_NAVIGATION.atencion
                .filter((link) => this.auth.tienePermiso(link.permiso))
                .map((link) => ({
                ...link,
                icon: link.path === "/doctor" ? "ICON_MENU.png" : "ICON_DOCTORES.png",
            }));
        }
        return MENU.filter((item) => autenticado && (!item.permiso || this.auth.tienePermiso(item.permiso))).map((item) => this.auth.session()?.rol === "CAJERA" && item.path === "/citas"
            ? { ...item, label: "Cobros y citas" }
            : item);
    }
};
Sidebar = __decorate([
    Component({
        selector: "app-sidebar",
        standalone: true,
        imports: [RouterLink, RouterLinkActive],
        template: "<aside class=\"barra-lateral\">\n  <div class=\"zona-logo\">\n    <img src=\"/img/LOGO GRANDE.png\" alt=\"Karely's\" class=\"logo-empresa\" />\n  </div>\n  <div class=\"titulo-panel\">{{ tituloPanel }}</div>\n  <nav class=\"menu-lateral\">\n    @for(item of menu;track item.path){<a\n      [routerLink]=\"item.path\"\n      routerLinkActive=\"activa\"\n      [routerLinkActiveOptions]=\"{paths: item.path === '/doctor' ? 'exact' : 'subset', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored'}\"\n      ariaCurrentWhenActive=\"page\"\n      class=\"opcion-menu\"\n      ><img [src]=\"'/img/'+item.icon\" alt=\"\" /><span>{{item.label}}</span></a\n    >}\n  </nav>\n</aside>\n",
        styles: [],
    })
], Sidebar);
export { Sidebar };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL2xheW91dC9zaWRlYmFyLyIsInNvdXJjZXMiOlsic2lkZWJhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRCxPQUFPLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzNELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQVFuRSxJQUFNLE9BQU8sR0FBYixNQUFNLE9BQU87SUFDbEIsSUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMzQixJQUFJLFdBQVc7UUFDYixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsQ0FBQztRQUNyQyxPQUFPLEdBQUcsS0FBSyxRQUFRO1lBQ3JCLENBQUMsQ0FBQyxjQUFjO1lBQ2hCLENBQUMsQ0FBQyxHQUFHLEtBQUssZUFBZTtnQkFDdkIsQ0FBQyxDQUFDLFdBQVc7Z0JBQ2IsQ0FBQyxDQUFDLEdBQUcsS0FBSyxRQUFRO29CQUNoQixDQUFDLENBQUMsTUFBTTtvQkFDUixDQUFDLENBQUMsR0FBRyxLQUFLLFVBQVU7d0JBQ2xCLENBQUMsQ0FBQyxXQUFXO3dCQUNiLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQztJQUN0QyxDQUFDO0lBQ0QsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsS0FBSyxRQUFRLENBQUM7SUFDL0MsQ0FBQztJQUNELElBQUksSUFBSTtRQUNOLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDaEQsSUFBSSxXQUFXLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pDLE9BQU8sa0JBQWtCLENBQUMsUUFBUTtpQkFDL0IsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ3RELEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDZCxHQUFHLElBQUk7Z0JBQ1AsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLG1CQUFtQjthQUN0RSxDQUFDLENBQUMsQ0FBQztRQUNSLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQ2hCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FDUCxXQUFXLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQ3pFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FDYixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRO1lBQzdELENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBRTtZQUN0QyxDQUFDLENBQUMsSUFBSSxDQUNULENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQTtBQXBDWSxPQUFPO0lBUG5CLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQztRQUN2QyxRQUFRLEVBQUMsc3JCQUFzckI7UUFDL3JCLE1BQU0sRUFBQyxFQUFFO0tBQ1YsQ0FBQztHQUNXLE9BQU8sQ0FvQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBpbmplY3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgUm91dGVyTGluaywgUm91dGVyTGlua0FjdGl2ZSB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcbmltcG9ydCB7IEF1dGhTZXJ2aWNlIH0gZnJvbSBcIi4uLy4uL2NvcmUvYXV0aC9hdXRoLXNlcnZpY2VcIjtcbmltcG9ydCB7IE1FTlUgfSBmcm9tIFwiLi4vLi4vY29yZS9jb25maWcvbWVudVwiO1xuaW1wb3J0IHsgRkVBVFVSRV9OQVZJR0FUSU9OIH0gZnJvbSBcIi4uLy4uL2NvcmUvY29uZmlnL2ZlYXR1cmUtbmF2aWdhdGlvblwiO1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcImFwcC1zaWRlYmFyXCIsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtSb3V0ZXJMaW5rLCBSb3V0ZXJMaW5rQWN0aXZlXSxcbiAgdGVtcGxhdGU6XCI8YXNpZGUgY2xhc3M9XFxcImJhcnJhLWxhdGVyYWxcXFwiPlxcbiAgPGRpdiBjbGFzcz1cXFwiem9uYS1sb2dvXFxcIj5cXG4gICAgPGltZyBzcmM9XFxcIi9pbWcvTE9HTyBHUkFOREUucG5nXFxcIiBhbHQ9XFxcIkthcmVseSdzXFxcIiBjbGFzcz1cXFwibG9nby1lbXByZXNhXFxcIiAvPlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVxcXCJ0aXR1bG8tcGFuZWxcXFwiPnt7IHRpdHVsb1BhbmVsIH19PC9kaXY+XFxuICA8bmF2IGNsYXNzPVxcXCJtZW51LWxhdGVyYWxcXFwiPlxcbiAgICBAZm9yKGl0ZW0gb2YgbWVudTt0cmFjayBpdGVtLnBhdGgpezxhXFxuICAgICAgW3JvdXRlckxpbmtdPVxcXCJpdGVtLnBhdGhcXFwiXFxuICAgICAgcm91dGVyTGlua0FjdGl2ZT1cXFwiYWN0aXZhXFxcIlxcbiAgICAgIFtyb3V0ZXJMaW5rQWN0aXZlT3B0aW9uc109XFxcIntwYXRoczogaXRlbS5wYXRoID09PSAnL2RvY3RvcicgPyAnZXhhY3QnIDogJ3N1YnNldCcsIHF1ZXJ5UGFyYW1zOiAnaWdub3JlZCcsIG1hdHJpeFBhcmFtczogJ2lnbm9yZWQnLCBmcmFnbWVudDogJ2lnbm9yZWQnfVxcXCJcXG4gICAgICBhcmlhQ3VycmVudFdoZW5BY3RpdmU9XFxcInBhZ2VcXFwiXFxuICAgICAgY2xhc3M9XFxcIm9wY2lvbi1tZW51XFxcIlxcbiAgICAgID48aW1nIFtzcmNdPVxcXCInL2ltZy8nK2l0ZW0uaWNvblxcXCIgYWx0PVxcXCJcXFwiIC8+PHNwYW4+e3tpdGVtLmxhYmVsfX08L3NwYW4+PC9hXFxuICAgID59XFxuICA8L25hdj5cXG48L2FzaWRlPlxcblwiLFxuICBzdHlsZXM6W10sXG59KVxuZXhwb3J0IGNsYXNzIFNpZGViYXIge1xuICBhdXRoID0gaW5qZWN0KEF1dGhTZXJ2aWNlKTtcbiAgZ2V0IHRpdHVsb1BhbmVsKCk6IHN0cmluZyB7XG4gICAgY29uc3Qgcm9sID0gdGhpcy5hdXRoLnNlc3Npb24oKT8ucm9sO1xuICAgIHJldHVybiByb2wgPT09IFwiRE9DVE9SXCJcbiAgICAgID8gXCJQQU5FTCBNw4lESUNPXCJcbiAgICAgIDogcm9sID09PSBcIlJFQ0VQQ0lPTklTVEFcIlxuICAgICAgICA/IFwiUkVDRVBDScOTTlwiXG4gICAgICAgIDogcm9sID09PSBcIkNBSkVSQVwiXG4gICAgICAgICAgPyBcIkNBSkFcIlxuICAgICAgICAgIDogcm9sID09PSBcIlRFU09SRVJBXCJcbiAgICAgICAgICAgID8gXCJURVNPUkVSw41BXCJcbiAgICAgICAgICAgIDogXCJQQU5FTCBERSBBRE1JTklTVFJBQ0nDk05cIjtcbiAgfVxuICBnZXQgZXNEb2N0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXV0aC5zZXNzaW9uKCk/LnJvbCA9PT0gXCJET0NUT1JcIjtcbiAgfVxuICBnZXQgbWVudSgpIHtcbiAgICBjb25zdCBhdXRlbnRpY2FkbyA9IHRoaXMuYXV0aC5lc3RhQXV0ZW50aWNhZG8oKTtcbiAgICBpZiAoYXV0ZW50aWNhZG8gJiYgdGhpcy5lc0RvY3Rvcikge1xuICAgICAgcmV0dXJuIEZFQVRVUkVfTkFWSUdBVElPTi5hdGVuY2lvblxuICAgICAgICAuZmlsdGVyKChsaW5rKSA9PiB0aGlzLmF1dGgudGllbmVQZXJtaXNvKGxpbmsucGVybWlzbykpXG4gICAgICAgIC5tYXAoKGxpbmspID0+ICh7XG4gICAgICAgICAgLi4ubGluayxcbiAgICAgICAgICBpY29uOiBsaW5rLnBhdGggPT09IFwiL2RvY3RvclwiID8gXCJJQ09OX01FTlUucG5nXCIgOiBcIklDT05fRE9DVE9SRVMucG5nXCIsXG4gICAgICAgIH0pKTtcbiAgICB9XG4gICAgcmV0dXJuIE1FTlUuZmlsdGVyKFxuICAgICAgKGl0ZW0pID0+XG4gICAgICAgIGF1dGVudGljYWRvICYmICghaXRlbS5wZXJtaXNvIHx8IHRoaXMuYXV0aC50aWVuZVBlcm1pc28oaXRlbS5wZXJtaXNvKSksXG4gICAgKS5tYXAoKGl0ZW0pID0+XG4gICAgICB0aGlzLmF1dGguc2Vzc2lvbigpPy5yb2wgPT09IFwiQ0FKRVJBXCIgJiYgaXRlbS5wYXRoID09PSBcIi9jaXRhc1wiXG4gICAgICAgID8geyAuLi5pdGVtLCBsYWJlbDogXCJDb2Jyb3MgeSBjaXRhc1wiIH1cbiAgICAgICAgOiBpdGVtLFxuICAgICk7XG4gIH1cbn1cbiJdfQ==
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, EventEmitter, Input, Output } from "@angular/core";
let CalendarioDisponibilidad = class CalendarioDisponibilidad {
    mes = "";
    minima = "";
    seleccionada = "";
    cantidades = {};
    cargando = false;
    error = "";
    fechaChange = new EventEmitter();
    mesChange = new EventEmitter();
    semana = ["L", "M", "X", "J", "V", "S", "D"];
    get titulo() {
        return new Intl.DateTimeFormat("es", {
            month: "long",
            year: "numeric",
        }).format(new Date(this.mes + "-01T12:00:00"));
    }
    get celdas() {
        const [year, month] = this.mes.split("-").map(Number);
        if (!year || !month)
            return [];
        const inicio = (new Date(year, month - 1, 1).getDay() + 6) % 7;
        const dias = new Date(year, month, 0).getDate();
        const total = Math.ceil((inicio + dias) / 7) * 7;
        return Array.from({ length: total }, (_, i) => i < inicio || i >= inicio + dias
            ? ""
            : `${this.mes}-${String(i - inicio + 1).padStart(2, "0")}`);
    }
    estado(fecha) {
        const n = this.cantidades[fecha] ?? 0;
        return n === 0 ? "sin-turnos" : n <= 3 ? "pocos" : "disponible";
    }
    bloqueado(fecha) {
        return (!fecha ||
            fecha < this.minima ||
            !this.cantidades[fecha] ||
            this.cargando ||
            !!this.error);
    }
    elegir(fecha) {
        if (!this.bloqueado(fecha))
            this.fechaChange.emit(fecha);
    }
    cambiarMes(delta) {
        const [year, month] = this.mes.split("-").map(Number);
        const fecha = new Date(year, month - 1 + delta, 1, 12);
        const nuevo = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
        if (nuevo >= this.minima.slice(0, 7))
            this.mesChange.emit(nuevo);
    }
    etiqueta(fecha) {
        const n = this.cantidades[fecha] ?? 0;
        return `${fecha}: ${n} ${n === 1 ? "turno disponible" : "turnos disponibles"}`;
    }
};
__decorate([
    Input()
], CalendarioDisponibilidad.prototype, "mes", void 0);
__decorate([
    Input()
], CalendarioDisponibilidad.prototype, "minima", void 0);
__decorate([
    Input()
], CalendarioDisponibilidad.prototype, "seleccionada", void 0);
__decorate([
    Input()
], CalendarioDisponibilidad.prototype, "cantidades", void 0);
__decorate([
    Input()
], CalendarioDisponibilidad.prototype, "cargando", void 0);
__decorate([
    Input()
], CalendarioDisponibilidad.prototype, "error", void 0);
__decorate([
    Output()
], CalendarioDisponibilidad.prototype, "fechaChange", void 0);
__decorate([
    Output()
], CalendarioDisponibilidad.prototype, "mesChange", void 0);
CalendarioDisponibilidad = __decorate([
    Component({
        selector: "app-calendario-disponibilidad",
        standalone: true,
        template: "<section\n  class=\"calendario\"\n  aria-label=\"Calendario de turnos disponibles\"\n  [attr.aria-busy]=\"cargando\"\n>\n  <header>\n    <button\n      type=\"button\"\n      aria-label=\"Mes anterior\"\n      [disabled]=\"mes<=minima.slice(0,7) || cargando\"\n      (click)=\"cambiarMes(-1)\"\n    >\n      ‹\n    </button>\n    <strong aria-live=\"polite\">{{titulo}}</strong>\n    <button\n      type=\"button\"\n      aria-label=\"Mes siguiente\"\n      [disabled]=\"cargando\"\n      (click)=\"cambiarMes(1)\"\n    >\n      ›\n    </button>\n  </header>\n  @if(cargando){\n  <p class=\"mensaje\" role=\"status\">Consultando disponibilidad…</p>\n  } @if(error){\n  <p class=\"mensaje\" role=\"alert\">{{error}}</p>\n  }\n  <div class=\"semana\" aria-hidden=\"true\">\n    @for(dia of semana;track $index){<span>{{dia}}</span>}\n  </div>\n  <div class=\"dias\">\n    @for(fecha of celdas;track $index){ @if(fecha){\n    <button\n      type=\"button\"\n      class=\"dia\"\n      [class]=\"'dia '+estado(fecha)\"\n      [class.seleccionado]=\"fecha===seleccionada\"\n      [class.pasado]=\"fecha<minima\"\n      [disabled]=\"bloqueado(fecha)\"\n      [attr.aria-label]=\"etiqueta(fecha)\"\n      [attr.aria-pressed]=\"fecha===seleccionada\"\n      [title]=\"etiqueta(fecha)\"\n      (click)=\"elegir(fecha)\"\n    >\n      <span>{{+fecha.slice(-2)}}</span\n      ><small>{{ fecha < minima ? '—' : (cantidades[fecha] || 0) }}</small>\n    </button>\n    }@else{<span class=\"hueco\" aria-hidden=\"true\"></span>} }\n  </div>\n  <div class=\"leyenda\">\n    <span><i class=\"verde\"></i>4 o más</span\n    ><span><i class=\"amarillo\"></i>1–3 turnos</span\n    ><span><i class=\"gris\"></i>Sin turnos</span>\n  </div>\n  <p class=\"nota\">Cada día muestra el número de turnos libres.</p>\n</section>\n",
        styles: [],
    })
], CalendarioDisponibilidad);
export { CalendarioDisponibilidad };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXJpby1kaXNwb25pYmlsaWRhZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL3NoYXJlZC9jb21wb25lbnRzL2NhbGVuZGFyaW8tZGlzcG9uaWJpbGlkYWQvIiwic291cmNlcyI6WyJjYWxlbmRhcmlvLWRpc3BvbmliaWxpZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFRaEUsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBd0I7SUFDMUIsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNULE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDWixZQUFZLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLFVBQVUsR0FBMkIsRUFBRSxDQUFDO0lBQ3hDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDakIsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNWLFdBQVcsR0FBRyxJQUFJLFlBQVksRUFBVSxDQUFDO0lBQ3pDLFNBQVMsR0FBRyxJQUFJLFlBQVksRUFBVSxDQUFDO0lBQ3hDLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3RELElBQUksTUFBTTtRQUNSLE9BQU8sSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRTtZQUNuQyxLQUFLLEVBQUUsTUFBTTtZQUNiLElBQUksRUFBRSxTQUFTO1NBQ2hCLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFDRCxJQUFJLE1BQU07UUFDUixNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSztZQUFFLE9BQU8sRUFBRSxDQUFDO1FBQy9CLE1BQU0sTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakQsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQzVDLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLE1BQU0sR0FBRyxJQUFJO1lBQzlCLENBQUMsQ0FBQyxFQUFFO1lBQ0osQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQzdELENBQUM7SUFDSixDQUFDO0lBQ0QsTUFBTSxDQUFDLEtBQWE7UUFDbEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO0lBQ2xFLENBQUM7SUFDRCxTQUFTLENBQUMsS0FBYTtRQUNyQixPQUFPLENBQ0wsQ0FBQyxLQUFLO1lBQ04sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNO1lBQ25CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFDdkIsSUFBSSxDQUFDLFFBQVE7WUFDYixDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FDYixDQUFDO0lBQ0osQ0FBQztJQUNELE1BQU0sQ0FBQyxLQUFhO1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFDRCxVQUFVLENBQUMsS0FBYTtRQUN0QixNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RCxNQUFNLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxHQUFHLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sS0FBSyxHQUFHLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3hGLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBQ0QsUUFBUSxDQUFDLEtBQWE7UUFDcEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsT0FBTyxHQUFHLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLENBQUM7SUFDakYsQ0FBQztDQUNGLENBQUE7QUFyRFU7SUFBUixLQUFLLEVBQUU7cURBQVU7QUFDVDtJQUFSLEtBQUssRUFBRTt3REFBYTtBQUNaO0lBQVIsS0FBSyxFQUFFOzhEQUFtQjtBQUNsQjtJQUFSLEtBQUssRUFBRTs0REFBeUM7QUFDeEM7SUFBUixLQUFLLEVBQUU7MERBQWtCO0FBQ2pCO0lBQVIsS0FBSyxFQUFFO3VEQUFZO0FBQ1Y7SUFBVCxNQUFNLEVBQUU7NkRBQTBDO0FBQ3pDO0lBQVQsTUFBTSxFQUFFOzJEQUF3QztBQVJ0Qyx3QkFBd0I7SUFOcEMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLCtCQUErQjtRQUN6QyxVQUFVLEVBQUUsSUFBSTtRQUNoQixRQUFRLEVBQUMsMndEQUEyd0Q7UUFDcHhELE1BQU0sRUFBQyxFQUFFO0tBQ1YsQ0FBQztHQUNXLHdCQUF3QixDQXNEcEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE91dHB1dCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogXCJhcHAtY2FsZW5kYXJpby1kaXNwb25pYmlsaWRhZFwiLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICB0ZW1wbGF0ZTpcIjxzZWN0aW9uXFxuICBjbGFzcz1cXFwiY2FsZW5kYXJpb1xcXCJcXG4gIGFyaWEtbGFiZWw9XFxcIkNhbGVuZGFyaW8gZGUgdHVybm9zIGRpc3BvbmlibGVzXFxcIlxcbiAgW2F0dHIuYXJpYS1idXN5XT1cXFwiY2FyZ2FuZG9cXFwiXFxuPlxcbiAgPGhlYWRlcj5cXG4gICAgPGJ1dHRvblxcbiAgICAgIHR5cGU9XFxcImJ1dHRvblxcXCJcXG4gICAgICBhcmlhLWxhYmVsPVxcXCJNZXMgYW50ZXJpb3JcXFwiXFxuICAgICAgW2Rpc2FibGVkXT1cXFwibWVzPD1taW5pbWEuc2xpY2UoMCw3KSB8fCBjYXJnYW5kb1xcXCJcXG4gICAgICAoY2xpY2spPVxcXCJjYW1iaWFyTWVzKC0xKVxcXCJcXG4gICAgPlxcbiAgICAgIOKAuVxcbiAgICA8L2J1dHRvbj5cXG4gICAgPHN0cm9uZyBhcmlhLWxpdmU9XFxcInBvbGl0ZVxcXCI+e3t0aXR1bG99fTwvc3Ryb25nPlxcbiAgICA8YnV0dG9uXFxuICAgICAgdHlwZT1cXFwiYnV0dG9uXFxcIlxcbiAgICAgIGFyaWEtbGFiZWw9XFxcIk1lcyBzaWd1aWVudGVcXFwiXFxuICAgICAgW2Rpc2FibGVkXT1cXFwiY2FyZ2FuZG9cXFwiXFxuICAgICAgKGNsaWNrKT1cXFwiY2FtYmlhck1lcygxKVxcXCJcXG4gICAgPlxcbiAgICAgIOKAulxcbiAgICA8L2J1dHRvbj5cXG4gIDwvaGVhZGVyPlxcbiAgQGlmKGNhcmdhbmRvKXtcXG4gIDxwIGNsYXNzPVxcXCJtZW5zYWplXFxcIiByb2xlPVxcXCJzdGF0dXNcXFwiPkNvbnN1bHRhbmRvIGRpc3BvbmliaWxpZGFk4oCmPC9wPlxcbiAgfSBAaWYoZXJyb3Ipe1xcbiAgPHAgY2xhc3M9XFxcIm1lbnNhamVcXFwiIHJvbGU9XFxcImFsZXJ0XFxcIj57e2Vycm9yfX08L3A+XFxuICB9XFxuICA8ZGl2IGNsYXNzPVxcXCJzZW1hbmFcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj5cXG4gICAgQGZvcihkaWEgb2Ygc2VtYW5hO3RyYWNrICRpbmRleCl7PHNwYW4+e3tkaWF9fTwvc3Bhbj59XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XFxcImRpYXNcXFwiPlxcbiAgICBAZm9yKGZlY2hhIG9mIGNlbGRhczt0cmFjayAkaW5kZXgpeyBAaWYoZmVjaGEpe1xcbiAgICA8YnV0dG9uXFxuICAgICAgdHlwZT1cXFwiYnV0dG9uXFxcIlxcbiAgICAgIGNsYXNzPVxcXCJkaWFcXFwiXFxuICAgICAgW2NsYXNzXT1cXFwiJ2RpYSAnK2VzdGFkbyhmZWNoYSlcXFwiXFxuICAgICAgW2NsYXNzLnNlbGVjY2lvbmFkb109XFxcImZlY2hhPT09c2VsZWNjaW9uYWRhXFxcIlxcbiAgICAgIFtjbGFzcy5wYXNhZG9dPVxcXCJmZWNoYTxtaW5pbWFcXFwiXFxuICAgICAgW2Rpc2FibGVkXT1cXFwiYmxvcXVlYWRvKGZlY2hhKVxcXCJcXG4gICAgICBbYXR0ci5hcmlhLWxhYmVsXT1cXFwiZXRpcXVldGEoZmVjaGEpXFxcIlxcbiAgICAgIFthdHRyLmFyaWEtcHJlc3NlZF09XFxcImZlY2hhPT09c2VsZWNjaW9uYWRhXFxcIlxcbiAgICAgIFt0aXRsZV09XFxcImV0aXF1ZXRhKGZlY2hhKVxcXCJcXG4gICAgICAoY2xpY2spPVxcXCJlbGVnaXIoZmVjaGEpXFxcIlxcbiAgICA+XFxuICAgICAgPHNwYW4+e3srZmVjaGEuc2xpY2UoLTIpfX08L3NwYW5cXG4gICAgICA+PHNtYWxsPnt7IGZlY2hhIDwgbWluaW1hID8gJ+KAlCcgOiAoY2FudGlkYWRlc1tmZWNoYV0gfHwgMCkgfX08L3NtYWxsPlxcbiAgICA8L2J1dHRvbj5cXG4gICAgfUBlbHNlezxzcGFuIGNsYXNzPVxcXCJodWVjb1xcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj59IH1cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cXFwibGV5ZW5kYVxcXCI+XFxuICAgIDxzcGFuPjxpIGNsYXNzPVxcXCJ2ZXJkZVxcXCI+PC9pPjQgbyBtw6FzPC9zcGFuXFxuICAgID48c3Bhbj48aSBjbGFzcz1cXFwiYW1hcmlsbG9cXFwiPjwvaT4x4oCTMyB0dXJub3M8L3NwYW5cXG4gICAgPjxzcGFuPjxpIGNsYXNzPVxcXCJncmlzXFxcIj48L2k+U2luIHR1cm5vczwvc3Bhbj5cXG4gIDwvZGl2PlxcbiAgPHAgY2xhc3M9XFxcIm5vdGFcXFwiPkNhZGEgZMOtYSBtdWVzdHJhIGVsIG7Dum1lcm8gZGUgdHVybm9zIGxpYnJlcy48L3A+XFxuPC9zZWN0aW9uPlxcblwiLFxuICBzdHlsZXM6W10sXG59KVxuZXhwb3J0IGNsYXNzIENhbGVuZGFyaW9EaXNwb25pYmlsaWRhZCB7XG4gIEBJbnB1dCgpIG1lcyA9IFwiXCI7XG4gIEBJbnB1dCgpIG1pbmltYSA9IFwiXCI7XG4gIEBJbnB1dCgpIHNlbGVjY2lvbmFkYSA9IFwiXCI7XG4gIEBJbnB1dCgpIGNhbnRpZGFkZXM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcbiAgQElucHV0KCkgY2FyZ2FuZG8gPSBmYWxzZTtcbiAgQElucHV0KCkgZXJyb3IgPSBcIlwiO1xuICBAT3V0cHV0KCkgZmVjaGFDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPHN0cmluZz4oKTtcbiAgQE91dHB1dCgpIG1lc0NoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPigpO1xuICByZWFkb25seSBzZW1hbmEgPSBbXCJMXCIsIFwiTVwiLCBcIlhcIiwgXCJKXCIsIFwiVlwiLCBcIlNcIiwgXCJEXCJdO1xuICBnZXQgdGl0dWxvKCkge1xuICAgIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChcImVzXCIsIHtcbiAgICAgIG1vbnRoOiBcImxvbmdcIixcbiAgICAgIHllYXI6IFwibnVtZXJpY1wiLFxuICAgIH0pLmZvcm1hdChuZXcgRGF0ZSh0aGlzLm1lcyArIFwiLTAxVDEyOjAwOjAwXCIpKTtcbiAgfVxuICBnZXQgY2VsZGFzKCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBbeWVhciwgbW9udGhdID0gdGhpcy5tZXMuc3BsaXQoXCItXCIpLm1hcChOdW1iZXIpO1xuICAgIGlmICgheWVhciB8fCAhbW9udGgpIHJldHVybiBbXTtcbiAgICBjb25zdCBpbmljaW8gPSAobmV3IERhdGUoeWVhciwgbW9udGggLSAxLCAxKS5nZXREYXkoKSArIDYpICUgNztcbiAgICBjb25zdCBkaWFzID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDApLmdldERhdGUoKTtcbiAgICBjb25zdCB0b3RhbCA9IE1hdGguY2VpbCgoaW5pY2lvICsgZGlhcykgLyA3KSAqIDc7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oeyBsZW5ndGg6IHRvdGFsIH0sIChfLCBpKSA9PlxuICAgICAgaSA8IGluaWNpbyB8fCBpID49IGluaWNpbyArIGRpYXNcbiAgICAgICAgPyBcIlwiXG4gICAgICAgIDogYCR7dGhpcy5tZXN9LSR7U3RyaW5nKGkgLSBpbmljaW8gKyAxKS5wYWRTdGFydCgyLCBcIjBcIil9YCxcbiAgICApO1xuICB9XG4gIGVzdGFkbyhmZWNoYTogc3RyaW5nKSB7XG4gICAgY29uc3QgbiA9IHRoaXMuY2FudGlkYWRlc1tmZWNoYV0gPz8gMDtcbiAgICByZXR1cm4gbiA9PT0gMCA/IFwic2luLXR1cm5vc1wiIDogbiA8PSAzID8gXCJwb2Nvc1wiIDogXCJkaXNwb25pYmxlXCI7XG4gIH1cbiAgYmxvcXVlYWRvKGZlY2hhOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgIWZlY2hhIHx8XG4gICAgICBmZWNoYSA8IHRoaXMubWluaW1hIHx8XG4gICAgICAhdGhpcy5jYW50aWRhZGVzW2ZlY2hhXSB8fFxuICAgICAgdGhpcy5jYXJnYW5kbyB8fFxuICAgICAgISF0aGlzLmVycm9yXG4gICAgKTtcbiAgfVxuICBlbGVnaXIoZmVjaGE6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5ibG9xdWVhZG8oZmVjaGEpKSB0aGlzLmZlY2hhQ2hhbmdlLmVtaXQoZmVjaGEpO1xuICB9XG4gIGNhbWJpYXJNZXMoZGVsdGE6IG51bWJlcikge1xuICAgIGNvbnN0IFt5ZWFyLCBtb250aF0gPSB0aGlzLm1lcy5zcGxpdChcIi1cIikubWFwKE51bWJlcik7XG4gICAgY29uc3QgZmVjaGEgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEgKyBkZWx0YSwgMSwgMTIpO1xuICAgIGNvbnN0IG51ZXZvID0gYCR7ZmVjaGEuZ2V0RnVsbFllYXIoKX0tJHtTdHJpbmcoZmVjaGEuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsIFwiMFwiKX1gO1xuICAgIGlmIChudWV2byA+PSB0aGlzLm1pbmltYS5zbGljZSgwLCA3KSkgdGhpcy5tZXNDaGFuZ2UuZW1pdChudWV2byk7XG4gIH1cbiAgZXRpcXVldGEoZmVjaGE6IHN0cmluZykge1xuICAgIGNvbnN0IG4gPSB0aGlzLmNhbnRpZGFkZXNbZmVjaGFdID8/IDA7XG4gICAgcmV0dXJuIGAke2ZlY2hhfTogJHtufSAke24gPT09IDEgPyBcInR1cm5vIGRpc3BvbmlibGVcIiA6IFwidHVybm9zIGRpc3BvbmlibGVzXCJ9YDtcbiAgfVxufVxuIl19
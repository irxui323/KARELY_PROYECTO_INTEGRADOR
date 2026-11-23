var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, EventEmitter, Input, Output } from "@angular/core";
let ModuleHeader = class ModuleHeader {
    contexto = "";
    titulo = "";
    descripcion = "";
    textoActualizar = "";
    actualizacionDeshabilitada = false;
    actualizar = new EventEmitter();
};
__decorate([
    Input({ required: true })
], ModuleHeader.prototype, "contexto", void 0);
__decorate([
    Input({ required: true })
], ModuleHeader.prototype, "titulo", void 0);
__decorate([
    Input({ required: true })
], ModuleHeader.prototype, "descripcion", void 0);
__decorate([
    Input()
], ModuleHeader.prototype, "textoActualizar", void 0);
__decorate([
    Input()
], ModuleHeader.prototype, "actualizacionDeshabilitada", void 0);
__decorate([
    Output()
], ModuleHeader.prototype, "actualizar", void 0);
ModuleHeader = __decorate([
    Component({
        selector: "header[appModuleHeader]",
        standalone: true,
        template: "<div>\n  <span class=\"k-eyebrow\">{{ contexto }}</span>\n  <h1 class=\"k-title\">{{ titulo }}</h1>\n  <p class=\"k-subtitle\">{{ descripcion }}</p>\n  <ng-content select=\"[moduleHeaderDetail]\" />\n</div>\n<div class=\"k-header-actions\">\n  <ng-content select=\"[moduleHeaderAction]\" />\n  @if (textoActualizar) {\n    <button\n      type=\"button\"\n      class=\"k-button k-button-secondary\"\n      [disabled]=\"actualizacionDeshabilitada\"\n      (click)=\"actualizar.emit()\"\n    >\n      {{ textoActualizar }}\n    </button>\n  }\n</div>\n",
        styles: [],
    })
], ModuleHeader);
export { ModuleHeader };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLWhlYWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL3NoYXJlZC9jb21wb25lbnRzL21vZHVsZS1oZWFkZXIvIiwic291cmNlcyI6WyJtb2R1bGUtaGVhZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFRaEUsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBWTtJQUNJLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDZCxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ1osV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUNuQyxlQUFlLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLDBCQUEwQixHQUFHLEtBQUssQ0FBQztJQUN6QixVQUFVLEdBQUcsSUFBSSxZQUFZLEVBQVEsQ0FBQztDQUMxRCxDQUFBO0FBTjRCO0lBQTFCLEtBQUssQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs4Q0FBZTtBQUNkO0lBQTFCLEtBQUssQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs0Q0FBYTtBQUNaO0lBQTFCLEtBQUssQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQztpREFBa0I7QUFDbkM7SUFBUixLQUFLLEVBQUU7cURBQXNCO0FBQ3JCO0lBQVIsS0FBSyxFQUFFO2dFQUFvQztBQUN6QjtJQUFsQixNQUFNLEVBQUU7Z0RBQWdEO0FBTjlDLFlBQVk7SUFOeEIsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLHlCQUF5QjtRQUNuQyxVQUFVLEVBQUUsSUFBSTtRQUNoQixRQUFRLEVBQUMsd2lCQUF3aUI7UUFDampCLE1BQU0sRUFBQyxFQUFFO0tBQ1YsQ0FBQztHQUNXLFlBQVksQ0FPeEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE91dHB1dCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogXCJoZWFkZXJbYXBwTW9kdWxlSGVhZGVyXVwiLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICB0ZW1wbGF0ZTpcIjxkaXY+XFxuICA8c3BhbiBjbGFzcz1cXFwiay1leWVicm93XFxcIj57eyBjb250ZXh0byB9fTwvc3Bhbj5cXG4gIDxoMSBjbGFzcz1cXFwiay10aXRsZVxcXCI+e3sgdGl0dWxvIH19PC9oMT5cXG4gIDxwIGNsYXNzPVxcXCJrLXN1YnRpdGxlXFxcIj57eyBkZXNjcmlwY2lvbiB9fTwvcD5cXG4gIDxuZy1jb250ZW50IHNlbGVjdD1cXFwiW21vZHVsZUhlYWRlckRldGFpbF1cXFwiIC8+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwiay1oZWFkZXItYWN0aW9uc1xcXCI+XFxuICA8bmctY29udGVudCBzZWxlY3Q9XFxcIlttb2R1bGVIZWFkZXJBY3Rpb25dXFxcIiAvPlxcbiAgQGlmICh0ZXh0b0FjdHVhbGl6YXIpIHtcXG4gICAgPGJ1dHRvblxcbiAgICAgIHR5cGU9XFxcImJ1dHRvblxcXCJcXG4gICAgICBjbGFzcz1cXFwiay1idXR0b24gay1idXR0b24tc2Vjb25kYXJ5XFxcIlxcbiAgICAgIFtkaXNhYmxlZF09XFxcImFjdHVhbGl6YWNpb25EZXNoYWJpbGl0YWRhXFxcIlxcbiAgICAgIChjbGljayk9XFxcImFjdHVhbGl6YXIuZW1pdCgpXFxcIlxcbiAgICA+XFxuICAgICAge3sgdGV4dG9BY3R1YWxpemFyIH19XFxuICAgIDwvYnV0dG9uPlxcbiAgfVxcbjwvZGl2PlxcblwiLFxuICBzdHlsZXM6W10sXG59KVxuZXhwb3J0IGNsYXNzIE1vZHVsZUhlYWRlciB7XG4gIEBJbnB1dCh7IHJlcXVpcmVkOiB0cnVlIH0pIGNvbnRleHRvID0gXCJcIjtcbiAgQElucHV0KHsgcmVxdWlyZWQ6IHRydWUgfSkgdGl0dWxvID0gXCJcIjtcbiAgQElucHV0KHsgcmVxdWlyZWQ6IHRydWUgfSkgZGVzY3JpcGNpb24gPSBcIlwiO1xuICBASW5wdXQoKSB0ZXh0b0FjdHVhbGl6YXIgPSBcIlwiO1xuICBASW5wdXQoKSBhY3R1YWxpemFjaW9uRGVzaGFiaWxpdGFkYSA9IGZhbHNlO1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgYWN0dWFsaXphciA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbn1cbiJdfQ==
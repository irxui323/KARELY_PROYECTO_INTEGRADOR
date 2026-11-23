var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Header } from '../header/header.mjs';
import { Sidebar } from '../sidebar/sidebar.mjs';
let MainLayout = class MainLayout {
};
MainLayout = __decorate([
    Component({
        standalone: true,
        imports: [RouterOutlet, Header, Sidebar],
        template: "<div class=\"pagina-home\">\n  <app-sidebar />\n  <main class=\"contenido-principal\">\n    <app-header />\n    <div class=\"karely-page\"><router-outlet /></div>\n  </main>\n</div>\n",
        styles: [],
    })
], MainLayout);
export { MainLayout };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1sYXlvdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9DOi9VTklWRVJTSURBRC9MUDIvU0VNQU5BMTEva2FyZWx5X21vZGVybm8vZnJvbnRlbmQvc3JjL2FwcC9sYXlvdXQvbWFpbi1sYXlvdXQvIiwic291cmNlcyI6WyJtYWluLWxheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDMUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBT3RDLElBQU0sVUFBVSxHQUFoQixNQUFNLFVBQVU7Q0FBRyxDQUFBO0FBQWIsVUFBVTtJQU50QixTQUFTLENBQUM7UUFDVCxVQUFVLEVBQUUsSUFBSTtRQUNoQixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQztRQUN4QyxRQUFRLEVBQUMseUxBQXlMO1FBQ2xNLE1BQU0sRUFBQyxFQUFFO0tBQ1YsQ0FBQztHQUNXLFVBQVUsQ0FBRyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBSb3V0ZXJPdXRsZXQgfSBmcm9tIFwiQGFuZ3VsYXIvcm91dGVyXCI7XG5pbXBvcnQgeyBIZWFkZXIgfSBmcm9tIFwiLi4vaGVhZGVyL2hlYWRlclwiO1xuaW1wb3J0IHsgU2lkZWJhciB9IGZyb20gXCIuLi9zaWRlYmFyL3NpZGViYXJcIjtcbkBDb21wb25lbnQoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbUm91dGVyT3V0bGV0LCBIZWFkZXIsIFNpZGViYXJdLFxuICB0ZW1wbGF0ZTpcIjxkaXYgY2xhc3M9XFxcInBhZ2luYS1ob21lXFxcIj5cXG4gIDxhcHAtc2lkZWJhciAvPlxcbiAgPG1haW4gY2xhc3M9XFxcImNvbnRlbmlkby1wcmluY2lwYWxcXFwiPlxcbiAgICA8YXBwLWhlYWRlciAvPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJrYXJlbHktcGFnZVxcXCI+PHJvdXRlci1vdXRsZXQgLz48L2Rpdj5cXG4gIDwvbWFpbj5cXG48L2Rpdj5cXG5cIixcbiAgc3R5bGVzOltdLFxufSlcbmV4cG9ydCBjbGFzcyBNYWluTGF5b3V0IHt9XG4iXX0=
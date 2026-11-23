var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from '../../../../environments/environment.mjs';
let CatalogoService = class CatalogoService {
    http = inject(HttpClient);
    url = environment.apiUrl;
    especialidades() {
        return this.http.get(this.url + "/especialidades");
    }
    franjas() {
        return this.http.get(this.url + "/franjas");
    }
    consultorios() {
        return this.http.get(this.url + "/consultorios");
    }
    consultarDni(dni) {
        return this.http.get(this.url + "/catalogos/dni/" + dni);
    }
};
CatalogoService = __decorate([
    Injectable({ providedIn: "root" })
], CatalogoService);
export { CatalogoService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0YWxvZ29zLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9DOi9VTklWRVJTSURBRC9MUDIvU0VNQU5BMTEva2FyZWx5X21vZGVybm8vZnJvbnRlbmQvc3JjL2FwcC9mZWF0dXJlcy9jYXRhbG9nb3Mvc2VydmljZXMvIiwic291cmNlcyI6WyJjYXRhbG9nb3Mtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBUTVELElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWU7SUFDVCxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFCLEdBQUcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO0lBQzFDLGNBQWM7UUFDWixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFpQixJQUFJLENBQUMsR0FBRyxHQUFHLGlCQUFpQixDQUFDLENBQUM7SUFDckUsQ0FBQztJQUNELE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUNELFlBQVk7UUFDVixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFnQixJQUFJLENBQUMsR0FBRyxHQUFHLGVBQWUsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFDRCxZQUFZLENBQUMsR0FBVztRQUN0QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFjLElBQUksQ0FBQyxHQUFHLEdBQUcsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDeEUsQ0FBQztDQUNGLENBQUE7QUFmWSxlQUFlO0lBRDNCLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQztHQUN0QixlQUFlLENBZTNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSwgaW5qZWN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGVudmlyb25tZW50IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2Vudmlyb25tZW50cy9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtcbiAgQ29uc3VsdGFEbmksXG4gIENvbnN1bHRvcmlvLFxuICBFc3BlY2lhbGlkYWQsXG4gIEZyYW5qYSxcbn0gZnJvbSBcIi4uL21vZGVscy9jYXRhbG9nb3MubW9kZWxcIjtcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogXCJyb290XCIgfSlcbmV4cG9ydCBjbGFzcyBDYXRhbG9nb1NlcnZpY2Uge1xuICBwcml2YXRlIHJlYWRvbmx5IGh0dHAgPSBpbmplY3QoSHR0cENsaWVudCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgdXJsID0gZW52aXJvbm1lbnQuYXBpVXJsO1xuICBlc3BlY2lhbGlkYWRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldDxFc3BlY2lhbGlkYWRbXT4odGhpcy51cmwgKyBcIi9lc3BlY2lhbGlkYWRlc1wiKTtcbiAgfVxuICBmcmFuamFzKCkge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PEZyYW5qYVtdPih0aGlzLnVybCArIFwiL2ZyYW5qYXNcIik7XG4gIH1cbiAgY29uc3VsdG9yaW9zKCkge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PENvbnN1bHRvcmlvW10+KHRoaXMudXJsICsgXCIvY29uc3VsdG9yaW9zXCIpO1xuICB9XG4gIGNvbnN1bHRhckRuaShkbmk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PENvbnN1bHRhRG5pPih0aGlzLnVybCArIFwiL2NhdGFsb2dvcy9kbmkvXCIgKyBkbmkpO1xuICB9XG59XG4iXX0=
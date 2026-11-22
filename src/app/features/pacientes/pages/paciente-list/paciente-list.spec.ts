import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { PacienteList } from "./paciente-list";

describe("PacienteList renderizado zoneless", () => {
  it("muestra la respuesta HTTP sin forzar detectChanges después de recibirla", async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PacienteList);
    fixture.detectChanges();
    http.expectOne("/api/v1/pacientes").flush([
      {
        idPaciente: 19,
        tipoDocumento: "DNI",
        numeroDocumento: "76543210",
        nombres: "Elena",
        apellidos: "Diaz",
        estado: "ACTIVO",
      },
    ]);
    await Promise.resolve();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("tbody").textContent).toContain(
      "Elena Diaz",
    );
    http.verify();
  });
});

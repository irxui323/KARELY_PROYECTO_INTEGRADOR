import { TestBed } from "@angular/core/testing";
import { ChangeDetectorRef } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { DoctorList } from "./doctor-list";

describe("DoctorList", () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it("carga registros reales del servicio y filtra nombres sin distinguir mayúsculas", async () => {
    const page = TestBed.runInInjectionContext(() => new DoctorList());
    const loading = page.cargar();
    http.expectOne("/api/v1/doctores").flush([
      {
        idDoctor: 42,
        nombres: "Ana",
        apellidos: "Rojas",
        numeroDocumento: "87654321",
      },
      {
        idDoctor: 7,
        nombres: "Luis",
        apellidos: "Perez",
        numeroDocumento: "12345678",
      },
    ]);
    await loading;
    expect(page.doctores).toHaveLength(2);
    page.buscar = "ANA";
    expect(page.filtrados().map((doctor) => doctor.idDoctor)).toEqual([42]);
    page.buscar = "12345678";
    expect(page.filtrados().map((doctor) => doctor.idDoctor)).toEqual([7]);
  });
  it("muestra el mensaje del servidor cuando el listado falla", async () => {
    const page = TestBed.runInInjectionContext(() => new DoctorList());
    const loading = page.cargar();
    http
      .expectOne("/api/v1/doctores")
      .flush(
        { error: "Servicio no disponible" },
        { status: 503, statusText: "Unavailable" },
      );
    await loading;
    expect(page.error).toBe("Servicio no disponible");
    expect(page.doctores).toEqual([]);
  });
});

import { TestBed } from "@angular/core/testing";
import { ChangeDetectorRef } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from "@angular/router";
import { DoctorForm } from "./doctor-form";

describe("DoctorForm editar", () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: "doctores", component: DoctorForm }]),
        { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: "42" }) } },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it("no crea un doctor cuando la edición solicitada no encuentra su registro", async () => {
    const page = TestBed.runInInjectionContext(() => new DoctorForm());
    const loading = page.cargar();
    http.expectOne("/api/v1/doctores").flush([]);
    await loading;
    page.doctorForm = {
      tipoDocumento: "DNI",
      numeroDocumento: "12345678",
      nombres: "Ana",
      apellidos: "Rojas",
      estado: "ACTIVO",
    };
    expect(page.doctorFormGroup.valid).toBe(true);
    const saving = page.guardarDoctor();
    http.expectNone((request) => request.method !== "GET");
    await saving;
    expect(page.error).not.toBe("");
  });
  it("no duplica un guardado mientras la primera solicitud está pendiente", async () => {
    const page = TestBed.runInInjectionContext(() => new DoctorForm());
    page.doctorForm = {
      idDoctor: 42,
      tipoDocumento: "DNI",
      numeroDocumento: "12345678",
      nombres: "Ana",
      apellidos: "Rojas",
    };
    const first = page.guardarDoctor();
    const second = page.guardarDoctor();
    const requests = http.match((request) => request.method !== "GET");
    expect(requests).toHaveLength(1);
    requests[0].flush({ mensaje: "Guardado" });
    await Promise.resolve();
    http.expectOne("/api/v1/doctores").flush([
      {
        idDoctor: 42,
        tipoDocumento: "DNI",
        numeroDocumento: "12345678",
        nombres: "Ana",
        apellidos: "Rojas",
        estado: "ACTIVO",
      },
    ]);
    await Promise.all([first, second]);
    expect(page.guardando).toBe(false);
  });
  it("rechaza guardar un formulario vacío antes de enviar HTTP", async () => {
    const page = TestBed.runInInjectionContext(() => new DoctorForm());
    const saving = page.guardarDoctor();
    http.expectNone((request) => request.method !== "GET");
    await saving;
    expect(page.error).not.toBe("");
    expect(page.doctorFormGroup.touched).toBe(true);
  });
  it("carga el ID de la ruta y selecciona el doctor correcto del listado HTTP", async () => {
    const page = TestBed.runInInjectionContext(() => new DoctorForm());
    const loading = page.cargar();
    const request = http.expectOne("/api/v1/doctores");
    expect(request.request.method).toBe("GET");
    request.flush([
      { idDoctor: 7, nombres: "Otro", apellidos: "Doctor" },
      {
        idDoctor: 42,
        tipoDocumento: "DNI",
        numeroDocumento: "87654321",
        nombres: "Ana",
        apellidos: "Rojas",
        estado: "ACTIVO",
      },
    ]);
    await loading;
    expect(page.doctorForm.idDoctor).toBe(42);
    expect(page.doctorForm.nombres).toBe("Ana");
    expect(page.doctorForm.numeroDocumento).toBe("87654321");
    expect(page.doctorFormGroup.valid).toBe(true);
  });
  it("presenta un error si el ID no está en la respuesta", async () => {
    const page = TestBed.runInInjectionContext(() => new DoctorForm());
    const loading = page.cargar();
    http.expectOne("/api/v1/doctores").flush([]);
    await loading;
    expect(page.error).toBe("Doctor no encontrado");
    expect(page.doctorForm.idDoctor).toBeNull();
  });
});

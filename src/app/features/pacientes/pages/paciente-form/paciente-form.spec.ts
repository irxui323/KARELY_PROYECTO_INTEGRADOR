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
import { PacienteForm } from "./paciente-form";

describe("PacienteForm", () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: "19" }) } },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it("no crea un paciente cuando la edición solicitada no encuentra su registro", async () => {
    const page = TestBed.runInInjectionContext(() => new PacienteForm());
    const loading = page.cargar();
    http.expectOne("/api/v1/pacientes").flush([]);
    await loading;
    page.form = {
      tipoDocumento: "DNI",
      numeroDocumento: "12345678",
      nombres: "Ana",
      apellidos: "Rojas",
      estado: "ACTIVO",
    };
    expect(page.formGroup.valid).toBe(true);
    const saving = page.guardar();
    http.expectNone((request) => request.method !== "GET");
    await saving;
    expect(page.error).not.toBe("");
  });
  it("rechaza guardar un formulario vacío antes de enviar HTTP", async () => {
    const page = TestBed.runInInjectionContext(() => new PacienteForm());
    const saving = page.guardar();
    http.expectNone((request) => request.method !== "GET");
    await saving;
    expect(page.error).not.toBe("");
    expect(page.formGroup.touched).toBe(true);
  });
  it("carga el paciente solicitado en la ruta en lugar del primer registro", async () => {
    const page = TestBed.runInInjectionContext(() => new PacienteForm());
    const loading = page.cargar();
    http.expectOne("/api/v1/pacientes").flush([
      { idPaciente: 3, nombres: "Otro" },
      {
        idPaciente: 19,
        tipoDocumento: "DNI",
        numeroDocumento: "76543210",
        nombres: "Elena",
        apellidos: "Diaz",
        estado: "ACTIVO",
      },
    ]);
    await loading;
    expect(page.form.idPaciente).toBe(19);
    expect(page.form.nombres).toBe("Elena");
    expect(page.formGroup.valid).toBe(true);
  });
});

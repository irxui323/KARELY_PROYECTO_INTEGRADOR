import { TestBed } from "@angular/core/testing";
import { ChangeDetectorRef } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { DoctorEspecialidades } from "./doctor-especialidades";

describe("DoctorEspecialidades validación", () => {
  function preparar() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
      ],
    });
    return {
      http: TestBed.inject(HttpTestingController),
      page: TestBed.runInInjectionContext(() => new DoctorEspecialidades()),
    };
  }
  it("solicita confirmación antes de quitar y refresca las asignadas", async () => {
    const { http, page } = preparar();
    const especialidad = {
      idEspecialidad: 2,
      nombre: "Dermatología",
      precioConsulta: 100,
      estado: "ACTIVO",
    };
    page.especialidadFormGroup.controls.idDoctor.setValue(1);
    page.asignadas = [especialidad];
    page.confirmarQuitar(especialidad);
    http.expectNone((r) => r.method === "DELETE");
    const pending = page.quitarEspecialidad();
    http.expectOne("/api/v1/doctores/1/especialidades/2").flush({});
    await Promise.resolve();
    http.expectOne("/api/v1/doctores/1/especialidades").flush([]);
    await pending;
    expect(page.asignadas).toEqual([]);
    expect(page.exito).toContain("retirada");
    http.verify();
  });
  it("conserva la asignación y muestra el rechazo por citas pendientes", async () => {
    const { http, page } = preparar();
    const especialidad = {
      idEspecialidad: 2,
      nombre: "Dermatología",
      precioConsulta: 100,
      estado: "ACTIVO",
    };
    page.especialidadFormGroup.controls.idDoctor.setValue(1);
    page.asignadas = [especialidad];
    page.confirmarQuitar(especialidad);
    const pending = page.quitarEspecialidad();
    http
      .expectOne("/api/v1/doctores/1/especialidades/2")
      .flush(
        { message: "Hay citas pendientes" },
        { status: 409, statusText: "Conflict" },
      );
    await pending;
    expect(page.asignadas).toEqual([especialidad]);
    expect(page.error).toContain("citas pendientes");
    http.verify();
  });
  it("descarta una respuesta del doctor seleccionado anteriormente", async () => {
    const { http, page } = preparar();
    page.especialidadFormGroup.controls.idDoctor.setValue(1);
    const primera = page.cargarAsignadas();
    const request1 = http.expectOne("/api/v1/doctores/1/especialidades");
    page.especialidadFormGroup.controls.idDoctor.setValue(2);
    const segunda = page.cargarAsignadas();
    http.expectOne("/api/v1/doctores/2/especialidades").flush([]);
    await segunda;
    request1.flush([{ idEspecialidad: 99, nombre: "Anterior" }]);
    await primera;
    expect(page.asignadas).toEqual([]);
    http.verify();
  });
  it("rechaza controles inválidos antes de enviar HTTP", async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const page = TestBed.runInInjectionContext(
      () => new DoctorEspecialidades(),
    );
    expect(page.especialidadFormGroup.invalid).toBe(true);
    const saving = page.asignarEspecialidad();
    http.expectNone((request) => request.method === "POST");
    await saving;
    expect(page.error).not.toBe("");
    expect(page.especialidadFormGroup.touched).toBe(true);
    http.verify();
  });
});

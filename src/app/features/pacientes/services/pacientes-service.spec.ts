import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { firstValueFrom } from "rxjs";
import { PacienteService } from "./pacientes-service";

describe("PacienteService", () => {
  let service: PacienteService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PacienteService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it("crea pacientes sin ID usando la operación de alta", async () => {
    const payload = {
      nombres: "Ana",
      apellidos: "Rojas",
      numeroDocumento: "12345678",
    };
    const result = firstValueFrom(service.guardar(payload));
    const request = http.expectOne("/api/v1/pacientes");
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 23 });
    expect(await result).toEqual({ id: 23 });
  });
  it("consulta el recurso del módulo mediante GET y entrega la respuesta", async () => {
    const result = firstValueFrom(service.listar());
    const request = http.expectOne("/api/v1/pacientes");
    expect(request.request.method).toBe("GET");
    expect(request.request.body).toBeNull();
    request.flush([]);
    expect(await result).toEqual([]);
  });
  it("envía la operación con su payload y devuelve el resultado", async () => {
    const payload = { idPaciente: 12, nombres: "Ana" };
    const result = firstValueFrom(service.guardar(payload));
    const request = http.expectOne("/api/v1/pacientes/12");
    expect(request.request.method).toBe("PUT");
    expect(request.request.body).toEqual({ nombres: "Ana" });
    request.flush({ mensaje: "Guardado", id: 12 });
    expect(await result).toEqual({ mensaje: "Guardado", id: 12 });
  });
  it("propaga el error HTTP sin convertirlo en un resultado exitoso", async () => {
    const result = firstValueFrom(service.listar());
    const assertion = expect(result).rejects.toMatchObject({
      status: 403,
      error: { error: "Sin permiso" },
    });
    http
      .expectOne("/api/v1/pacientes")
      .flush(
        { error: "Sin permiso" },
        { status: 403, statusText: "Forbidden" },
      );
    await assertion;
  });
});

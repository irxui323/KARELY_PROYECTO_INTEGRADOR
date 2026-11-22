import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { firstValueFrom } from "rxjs";
import { CitaService } from "./citas-service";

describe("CitaService", () => {
  let service: CitaService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CitaService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it("consulta el recurso del módulo mediante GET y entrega la respuesta", async () => {
    const result = firstValueFrom(service.listar());
    const request = http.expectOne("/api/v1/citas");
    expect(request.request.method).toBe("GET");
    expect(request.request.body).toBeNull();
    request.flush([]);
    expect(await result).toEqual([]);
  });
  it("envía la operación con su payload y devuelve el resultado", async () => {
    const payload = { idCita: 12, fechaNueva: "2026-12-01" };
    const result = firstValueFrom(
      service.ejecutar("cita-reprogramar", payload),
    );
    const request = http.expectOne("/api/v1/citas/12/reprogramar");
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual({ fechaNueva: "2026-12-01" });
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
      .expectOne("/api/v1/citas")
      .flush(
        { error: "Sin permiso" },
        { status: 403, statusText: "Forbidden" },
      );
    await assertion;
  });
});

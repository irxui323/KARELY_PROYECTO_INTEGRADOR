import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { firstValueFrom } from "rxjs";
import { FinanzasService } from "./finanzas-service";

describe("FinanzasService", () => {
  let service: FinanzasService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FinanzasService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it("consulta el recurso del módulo mediante GET y entrega la respuesta", async () => {
    const result = firstValueFrom(service.liquidaciones());
    const request = http.expectOne("/api/v1/liquidaciones");
    expect(request.request.method).toBe("GET");
    expect(request.request.body).toBeNull();
    request.flush([]);
    expect(await result).toEqual([]);
  });
  it("envía la operación con su payload y devuelve el resultado", async () => {
    const payload = {
      idDoctor: 12,
      fechaInicio: "2026-11-01",
      fechaFin: "2026-11-15",
      monto: 85,
      metodoPago: "EFECTIVO",
      numeroOperacion: "OP-12",
      numeroBoleta: "B-12",
    };
    const result = firstValueFrom(service.pagar(payload));
    const request = http.expectOne("/api/v1/liquidaciones");
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual(payload);
    request.flush({ mensaje: "Guardado", id: 12 });
    expect(await result).toEqual({ mensaje: "Guardado", id: 12 });
  });
  it("propaga el error HTTP sin convertirlo en un resultado exitoso", async () => {
    const result = firstValueFrom(service.liquidaciones());
    const assertion = expect(result).rejects.toMatchObject({
      status: 403,
      error: { error: "Sin permiso" },
    });
    http
      .expectOne("/api/v1/liquidaciones")
      .flush(
        { error: "Sin permiso" },
        { status: 403, statusText: "Forbidden" },
      );
    await assertion;
  });
});

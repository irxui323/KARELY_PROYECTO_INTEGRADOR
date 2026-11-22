import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { firstValueFrom } from "rxjs";
import { AdministracionService } from "./administracion-service";

describe("AdministracionService", () => {
  let service: AdministracionService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdministracionService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it("consulta el recurso del módulo mediante GET y entrega la respuesta", async () => {
    const result = firstValueFrom(service.usuarios());
    const request = http.expectOne("/api/v1/usuarios");
    expect(request.request.method).toBe("GET");
    expect(request.request.body).toBeNull();
    request.flush([]);
    expect(await result).toEqual([]);
  });
  it("envía la operación con su payload y devuelve el resultado", async () => {
    const payload = { idUsuario: 12, idRol: 2 };
    const result = firstValueFrom(service.ejecutar("usuario-rol", payload));
    const request = http.expectOne("/api/v1/usuarios/12/rol");
    expect(request.request.method).toBe("PATCH");
    expect(request.request.body).toEqual({ idRol: 2 });
    request.flush({ mensaje: "Guardado", id: 12 });
    expect(await result).toEqual({ mensaje: "Guardado", id: 12 });
  });
  it("propaga el error HTTP sin convertirlo en un resultado exitoso", async () => {
    const result = firstValueFrom(service.usuarios());
    const assertion = expect(result).rejects.toMatchObject({
      status: 403,
      error: { error: "Sin permiso" },
    });
    http
      .expectOne("/api/v1/usuarios")
      .flush(
        { error: "Sin permiso" },
        { status: 403, statusText: "Forbidden" },
      );
    await assertion;
  });
});

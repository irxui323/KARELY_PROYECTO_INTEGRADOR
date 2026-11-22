import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { firstValueFrom } from "rxjs";
import { DoctorService } from "./doctores-service";

describe("DoctorService", () => {
  let service: DoctorService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DoctorService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it("excluye el usuario médico al registrar un doctor", async () => {
    const result = firstValueFrom(
      service.ejecutar("doctor-crear", { nombres: "Ana", idUsuario: 9 }),
    );
    const request = http.expectOne("/api/v1/doctores");
    const body = request.request.body;
    request.flush({ id: 1, mensaje: "Guardado" });
    await result;
    expect(body.idUsuario).toBeUndefined();
  });
  it("sube documentos como multipart con el doctor en la ruta y tipo y archivo en el cuerpo", async () => {
    const archivo = new File(["titulo"], "titulo.pdf", {
      type: "application/pdf",
    });
    const result = firstValueFrom(service.subir(12, "TITULO", archivo));
    const request = http.expectOne("/api/v1/doctores/12/documentos");
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toBeInstanceOf(FormData);
    expect(request.request.body.get("idDoctor")).toBeNull();
    expect(request.request.body.get("tipo")).toBe("TITULO");
    expect(request.request.body.get("archivo").name).toBe("titulo.pdf");
    request.flush({ mensaje: "Adjunto registrado" });
    expect(await result).toEqual({ mensaje: "Adjunto registrado" });
  });
  it("consulta el recurso del módulo mediante GET y entrega la respuesta", async () => {
    const result = firstValueFrom(service.listar());
    const request = http.expectOne("/api/v1/doctores");
    expect(request.request.method).toBe("GET");
    expect(request.request.body).toBeNull();
    request.flush([]);
    expect(await result).toEqual([]);
  });
  it("envía la operación con su payload y devuelve el resultado", async () => {
    const payload = { idDoctor: 12, nombres: "Ana" };
    const result = firstValueFrom(service.ejecutar("doctor-editar", payload));
    const request = http.expectOne("/api/v1/doctores/12");
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
      .expectOne("/api/v1/doctores")
      .flush(
        { error: "Sin permiso" },
        { status: 403, statusText: "Forbidden" },
      );
    await assertion;
  });
});

import { TestBed } from "@angular/core/testing";
import { ChangeDetectorRef } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { CitaConfirmacion } from "./cita-confirmacion";

describe("Cobro automático", () => {
  it("confirma sin referencia escrita y muestra el código generado", async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
      ],
    });
    const page = TestBed.runInInjectionContext(() => new CitaConfirmacion());
    const http = TestBed.inject(HttpTestingController);
    page.pago = { idPreReserva: 14, metodoPago: "TARJETA" };
    const guardado = page.confirmarPago();
    const request = http.expectOne("/api/v1/citas/confirmar");
    expect(request.request.body).toEqual({
      idPreReserva: 14,
      metodoPago: "TARJETA",
    });
    request.flush({
      id: 31,
      accion: "SP_CONFIRMAR_CITA_PAGADA",
      mensaje: "Cobro COBRO-000014 registrado. Cita #31 confirmada.",
    });
    await Promise.resolve();
    http.expectOne("/api/v1/citas/reservas").flush([]);
    await guardado;
    expect(page.exito).toContain("COBRO-000014");
    expect(page.pago.idPreReserva).toBeNull();
    http.verify();
  });
});

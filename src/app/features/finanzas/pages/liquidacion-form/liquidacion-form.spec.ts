import { TestBed } from "@angular/core/testing";
import { ChangeDetectorRef } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { LiquidacionForm } from "./liquidacion-form";

describe("LiquidacionForm validación", () => {
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
    const page = TestBed.runInInjectionContext(() => new LiquidacionForm());
    expect(page.liqGroup.invalid).toBe(true);
    const saving = page.registrarPago();
    http.expectNone((request) => request.method === "POST");
    await saving;
    expect(page.error).not.toBe("");
    expect(page.liqGroup.touched).toBe(true);
    http.verify();
    page.liqGroup.patchValue({
      idDoctor: 12,
      fechaInicio: "2026-11-01",
      fechaFin: "2026-11-15",
    });
    await page.registrarPago();
    http.expectNone((request) => request.method === "POST");
    expect(page.liqGroup.invalid).toBe(true);
  });
});

describe("Referencias de pago automáticas", () => {
  it("envía un pago válido sin pedir números de operación ni boleta", async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const page = TestBed.runInInjectionContext(() => new LiquidacionForm());
    page.liqGroup.patchValue({
      idDoctor: 1,
      fechaInicio: "2026-11-01",
      fechaFin: "2026-11-15",
      monto: 30,
      metodoPago: "EFECTIVO",
    });
    expect(page.liqGroup.valid).toBe(true);
    const promesa = page.registrarPago();
    const req = http.expectOne("/api/v1/liquidaciones");
    expect(req.request.body.numeroOperacion).toBeUndefined();
    expect(req.request.body.numeroBoleta).toBeUndefined();
    req.flush({
      id: 20,
      mensaje: "Pago registrado. Operación OP-20. Boleta BOL-20.",
    });
    await promesa;
    expect(page.exito).toContain("BOL-20");
    http.verify();
  });
});

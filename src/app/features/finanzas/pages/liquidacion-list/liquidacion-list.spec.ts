import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { LiquidacionList } from "./liquidacion-list";

describe("LiquidacionList", () => {
  it("muestra pagos, permite consultar saldo y representa una lista vacía", async () => {
    TestBed.configureTestingModule({
      imports: [LiquidacionList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    const fixture = TestBed.createComponent(LiquidacionList);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne("/api/v1/liquidaciones").flush([
      {
        idLiquidacion: 3,
        idDoctor: 12,
        nombreDoctor: "Ana Rojas",
        periodoInicio: "2026-11-01",
        periodoFin: "2026-11-15",
        montoPagado: 85,
        saldoPendiente: 40,
        metodoPago: "EFECTIVO",
        numeroOperacion: "OP-12",
        numeroBoleta: "B-12",
        fechaPago: "2026-11-16T09:30:00",
      },
    ]);
    http.expectOne("/api/v1/reportes/ingresos").flush([]);
    http
      .expectOne("/api/v1/doctores")
      .flush([{ idDoctor: 12, nombres: "Ana", apellidos: "Rojas" }]);
    await Promise.resolve();
    await Promise.resolve();
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain("Ana Rojas");
    expect(page.textContent).toContain("OP-12");
    expect(page.textContent).toContain("S/ 85");

    const doctor = page.querySelector("select")!;
    doctor.selectedIndex = 1;
    doctor.dispatchEvent(new Event("change"));
    const corte = page.querySelector<HTMLInputElement>('input[type="date"]')!;
    corte.value = "2026-11-15";
    corte.dispatchEvent(new Event("input"));
    await fixture.whenStable();
    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    const consulta = http.expectOne(
      "/api/v1/liquidaciones/saldo?idDoctor=12&fechaCorte=2026-11-15",
    );
    expect(consulta.request.method).toBe("GET");
    consulta.flush({
      idDoctor: 12,
      fechaCorte: "2026-11-15",
      saldoPendiente: 0,
    });
    await Promise.resolve();
    await fixture.whenStable();
    expect(page.textContent).toContain("S/ 0");

    const cargar = fixture.componentInstance.cargar();
    http.expectOne("/api/v1/liquidaciones").flush([]);
    http.expectOne("/api/v1/reportes/ingresos").flush([]);
    http.expectOne("/api/v1/doctores").flush([]);
    await cargar;
    await fixture.whenStable();
    expect(page.textContent).toContain(
      "Todavía no hay liquidaciones registradas",
    );
    http.verify();
  });
});

import { CalendarioDisponibilidad } from "./calendario-disponibilidad";
import { TestBed } from "@angular/core/testing";

describe("Calendario de disponibilidad", () => {
  it("representa colores, conteos y selección con botones accesibles", () => {
    const fixture = TestBed.createComponent(CalendarioDisponibilidad);
    fixture.componentRef.setInput("mes", "2026-11");
    fixture.componentRef.setInput("minima", "2026-11-22");
    fixture.componentRef.setInput("cantidades", {
      "2026-11-22": 2,
      "2026-11-23": 5,
    });
    fixture.detectChanges();
    const amarillo = fixture.nativeElement.querySelector(
      '[aria-label="2026-11-22: 2 turnos disponibles"]',
    ) as HTMLButtonElement;
    const verde = fixture.nativeElement.querySelector(
      '[aria-label="2026-11-23: 5 turnos disponibles"]',
    ) as HTMLButtonElement;
    const gris = fixture.nativeElement.querySelector(
      '[aria-label="2026-11-24: 0 turnos disponibles"]',
    ) as HTMLButtonElement;
    expect(amarillo.classList.contains("pocos")).toBe(true);
    expect(verde.classList.contains("disponible")).toBe(true);
    expect(gris.disabled).toBe(true);
    const seleccionar = vi.spyOn(fixture.componentInstance.fechaChange, "emit");
    amarillo.click();
    expect(seleccionar).toHaveBeenCalledWith("2026-11-22");
    fixture.componentRef.setInput("seleccionada", "2026-11-22");
    fixture.detectChanges();
    expect(amarillo.getAttribute("aria-pressed")).toBe("true");
    expect(amarillo.classList.contains("seleccionado")).toBe(true);
  });
  it("colorea cada día por cantidad y bloquea pasado o vacío", () => {
    const calendario = new CalendarioDisponibilidad();
    calendario.mes = "2026-11";
    calendario.minima = "2026-11-22";
    calendario.cantidades = {
      "2026-11-21": 8,
      "2026-11-22": 2,
      "2026-11-23": 5,
    };
    expect(calendario.estado("2026-11-22")).toBe("pocos");
    expect(calendario.estado("2026-11-23")).toBe("disponible");
    expect(calendario.estado("2026-11-24")).toBe("sin-turnos");
    expect(calendario.bloqueado("2026-11-21")).toBe(true);
    expect(calendario.bloqueado("2026-11-24")).toBe(true);
    const emitir = vi.spyOn(calendario.fechaChange, "emit");
    calendario.elegir("2026-11-21");
    calendario.elegir("2026-11-22");
    expect(emitir).toHaveBeenCalledExactlyOnceWith("2026-11-22");
  });
  it("construye semanas desde lunes y navega entre años", () => {
    const calendario = new CalendarioDisponibilidad();
    calendario.mes = "2026-12";
    const emitir = vi.spyOn(calendario.mesChange, "emit");
    calendario.cambiarMes(1);
    expect(emitir).toHaveBeenCalledWith("2027-01");
    calendario.mes = "2026-02";
    expect(calendario.celdas.filter(Boolean)).toHaveLength(28);
    expect(calendario.celdas[6]).toBe("2026-02-01");
  });
});

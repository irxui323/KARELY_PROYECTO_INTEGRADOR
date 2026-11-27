import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { expect, it } from "vitest";
import { ModuleHeader } from "./module-header";

@Component({
  imports: [ModuleHeader],
  template: `
    <header
      appModuleHeader
      class="k-module-header"
      titulo="Panel Médico"
      contexto="Karely"
      descripcion="Agenda"
      textoActualizar="Actualizar"
      [actualizacionDeshabilitada]="cargando()"
      (actualizar)="actualizaciones = actualizaciones + 1"
    >
      <p moduleHeaderDetail>Médico: Ana</p>
      <span moduleHeaderAction>2 citas asignadas</span>
    </header>
  `,
})
class PantallaMedica {
  readonly cargando = signal(true);
  actualizaciones = 0;
}

it("conserva el contexto de la pantalla y solo actualiza desde un botón habilitado", () => {
  const fixture = TestBed.createComponent(PantallaMedica);
  fixture.detectChanges();
  const header = fixture.nativeElement.querySelector("header");
  const boton: HTMLButtonElement = header.querySelector("button");
  expect(header.querySelector("h1").textContent).toBe("Panel Médico");
  expect(header.querySelector(".k-header-actions").textContent).toContain("2 citas asignadas");
  expect(header.querySelector(".k-title").parentElement.textContent).toContain("Médico: Ana");
  expect(boton.type).toBe("button");
  boton.click();
  expect(fixture.componentInstance.actualizaciones).toBe(0);
  fixture.componentInstance.cargando.set(false);
  fixture.detectChanges();
  expect(boton.disabled).toBe(false);
  boton.click();
  expect(fixture.componentInstance.actualizaciones).toBe(1);
});

import { TestBed } from "@angular/core/testing";
import { describe, it, expect } from "vitest";
import { Paginador } from "./paginador";
import { of, Subject } from "rxjs";
import { ListadoPaginado } from "../../../core/utils/listado-paginado";
import { PaginaResponse } from "../../../core/models/pagina-response";

describe("Paginador", () => {
  it("pagina 425 registros y cambia el tamaño sin perder el total", async () => {
    await TestBed.configureTestingModule({
      imports: [Paginador],
    }).compileComponents();
    const fixture = TestBed.createComponent(Paginador);
    fixture.componentRef.setInput(
      "registros",
      Array.from({ length: 425 }, (_, i) => i + 1),
    );
    fixture.detectChanges();
    const componente = fixture.componentInstance;
    expect(componente.contenido()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    componente.irA(42);
    fixture.detectChanges();
    expect(componente.contenido()).toEqual([421, 422, 423, 424, 425]);
    const selector: HTMLSelectElement =
      fixture.nativeElement.querySelector("select");
    selector.value = "100";
    selector.dispatchEvent(new Event("change"));
    fixture.detectChanges();
    expect(componente.actual()).toBe(0);
    expect(componente.contenido().length).toBe(100);
    expect(componente.paginas()).toBe(5);
    expect(fixture.nativeElement.textContent).toContain("425 registros");
  });

  it("emite la página solicitada y bloquea navegación durante la carga", async () => {
    await TestBed.configureTestingModule({
      imports: [Paginador],
    }).compileComponents();
    const fixture = TestBed.createComponent(Paginador);
    fixture.componentRef.setInput("totalPaginas", 43);
    fixture.componentRef.setInput("totalElementos", 425);
    fixture.detectChanges();
    const paginas: number[] = [];
    fixture.componentInstance.cambioPagina.subscribe((p) => paginas.push(p));
    fixture.componentInstance.irA(1);
    expect(paginas).toEqual([1]);
    fixture.componentRef.setInput("cargando", true);
    fixture.detectChanges();
    fixture.componentInstance.irA(2);
    expect(paginas).toEqual([1]);
    expect(fixture.nativeElement.querySelector("select").disabled).toBe(true);
  });
});

describe("ListadoPaginado", () => {
  const pagina = (
    numero: number,
    contenido: number[],
    total = 25,
  ): PaginaResponse<number> => ({
    pagina: numero,
    tamanio: 10,
    contenido,
    totalElementos: total,
    totalPaginas: Math.ceil(total / 10),
    primera: numero === 0,
    ultima: numero >= Math.ceil(total / 10) - 1,
  });

  it("descarta una búsqueda atrasada para conservar el último resultado", async () => {
    const lista = new ListadoPaginado<number>();
    const anterior = new Subject<PaginaResponse<number>>();
    const cargaAnterior = lista.consultar(() => anterior);
    await lista.consultar(() => of(pagina(0, [7])));
    anterior.next(pagina(0, [1]));
    await cargaAnterior;
    expect(lista.contenido).toEqual([7]);
    expect(lista.cargando).toBe(false);
  });

  it("vuelve a la última página si se elimina el último registro de otra página", async () => {
    const lista = new ListadoPaginado<number>();
    lista.pagina = 3;
    await lista.consultar(() =>
      of(pagina(lista.pagina, lista.pagina === 2 ? [21, 22, 23, 24, 25] : [])),
    );
    expect(lista.pagina).toBe(2);
    expect(lista.contenido).toEqual([21, 22, 23, 24, 25]);
    await lista.consultar(() => of(pagina(2, [], 0)));
    expect(lista.pagina).toBe(0);
    expect(lista.totalElementos).toBe(0);
  });
});

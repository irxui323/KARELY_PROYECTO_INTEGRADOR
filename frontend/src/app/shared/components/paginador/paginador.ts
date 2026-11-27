import { Component, computed, input, output, signal } from "@angular/core";

@Component({
  selector: "app-paginador",
  standalone: true,
  templateUrl: "./paginador.html",
  styleUrl: "./paginador.css",
})
export class Paginador<T> {
  readonly pagina = input(0);
  readonly tamanio = input(10);
  readonly totalElementos = input(0);
  readonly totalPaginas = input(0);
  readonly cargando = input(false);
  readonly registros = input<readonly T[] | null>(null);
  readonly cambioPagina = output<number>();
  readonly cambioTamanio = output<number>();
  private readonly paginaLocal = signal(0);
  private readonly tamanioLocal = signal(10);
  readonly filas = computed(() =>
    this.registros() !== null ? this.tamanioLocal() : this.tamanio(),
  );
  readonly total = computed(
    () => this.registros()?.length ?? this.totalElementos(),
  );
  readonly paginas = computed(() =>
    this.registros() !== null
      ? Math.ceil(this.total() / this.filas())
      : this.totalPaginas(),
  );
  readonly actual = computed(() =>
    Math.max(
      0,
      Math.min(
        this.registros() !== null ? this.paginaLocal() : this.pagina(),
        Math.max(this.paginas() - 1, 0),
      ),
    ),
  );
  readonly contenido = computed(() =>
    (this.registros() ?? []).slice(
      this.actual() * this.filas(),
      (this.actual() + 1) * this.filas(),
    ),
  );
  readonly hasta = computed(() =>
    Math.min((this.actual() + 1) * this.filas(), this.total()),
  );
  readonly desde = computed(() =>
    Math.min(this.actual() * this.filas() + 1, this.hasta()),
  );
  irA(pagina: number) {
    if (this.cargando() || pagina < 0 || pagina >= this.paginas()) return;
    if (this.registros() !== null) this.paginaLocal.set(pagina);
    else this.cambioPagina.emit(pagina);
  }
  cambiarTamanio(event: Event) {
    const tamanio = Number((event.target as HTMLSelectElement).value);
    if (this.cargando() || ![10, 20, 50, 100].includes(tamanio)) return;
    if (this.registros() !== null) {
      this.tamanioLocal.set(tamanio);
      this.paginaLocal.set(0);
    } else this.cambioTamanio.emit(tamanio);
  }
}

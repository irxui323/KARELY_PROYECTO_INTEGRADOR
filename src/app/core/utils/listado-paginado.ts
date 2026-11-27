import { firstValueFrom, Observable } from "rxjs";
import { PaginaResponse } from "../models/pagina-response";

export class ListadoPaginado<T> {
  pagina = 0;
  tamanio = 10;
  totalElementos = 0;
  totalPaginas = 0;
  cargando = false;
  contenido: T[] = [];
  private solicitud = 0;

  async consultar(cargar: () => Observable<PaginaResponse<T>>): Promise<T[]> {
    const id = ++this.solicitud;
    this.cargando = true;
    try {
      let resultado = await firstValueFrom(cargar());
      if (id !== this.solicitud) return this.contenido;
      if (
        resultado.totalPaginas > 0 &&
        resultado.pagina >= resultado.totalPaginas
      ) {
        this.pagina = resultado.totalPaginas - 1;
        resultado = await firstValueFrom(cargar());
        if (id !== this.solicitud) return this.contenido;
      }
      this.pagina = resultado.totalPaginas === 0 ? 0 : resultado.pagina;
      this.tamanio = resultado.tamanio;
      this.totalElementos = resultado.totalElementos;
      this.totalPaginas = resultado.totalPaginas;
      this.contenido = resultado.contenido;
      return this.contenido;
    } catch (error) {
      if (id !== this.solicitud) return this.contenido;
      throw error;
    } finally {
      if (id === this.solicitud) this.cargando = false;
    }
  }
}

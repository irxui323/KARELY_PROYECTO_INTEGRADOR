package pe.edu.karely.dto;

import java.util.List;

public record PaginaResponseDTO<T>(
        List<T> contenido,
        int pagina,
        int tamanio,
        long totalElementos,
        int totalPaginas,
        boolean primera,
        boolean ultima) {
    public static void validar(int pagina, int tamanio) {
        if (pagina < 0 || tamanio < 1 || tamanio > 100)
            throw new pe.edu.karely.exception.ReglaNegocioException(
                    "Paginación inválida: el tamaño debe estar entre 1 y 100");
    }

    public static <T> PaginaResponseDTO<T> crear(
            List<T> contenido, int pagina, int tamanio, long total) {
        validar(pagina, tamanio);
        int paginas = (int) Math.ceil((double) total / tamanio);
        return new PaginaResponseDTO<>(
                contenido, pagina, tamanio, total, paginas, pagina == 0, pagina >= paginas - 1);
    }
}

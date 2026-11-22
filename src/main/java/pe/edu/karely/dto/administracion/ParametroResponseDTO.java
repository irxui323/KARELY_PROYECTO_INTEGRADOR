package pe.edu.karely.dto.administracion;


public record ParametroResponseDTO(
        Long idParametro,
        String nombre,
        String valor,
        String descripcion,
        String estado) {}

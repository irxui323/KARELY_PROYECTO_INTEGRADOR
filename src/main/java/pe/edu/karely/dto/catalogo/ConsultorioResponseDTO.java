package pe.edu.karely.dto.catalogo;


public record ConsultorioResponseDTO(
        Long idConsultorio,
        String nombre,
        String ubicacion,
        String estado) {}

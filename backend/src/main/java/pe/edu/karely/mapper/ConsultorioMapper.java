package pe.edu.karely.mapper;

import pe.edu.karely.dto.catalogo.ConsultorioResponseDTO;
import pe.edu.karely.entity.Consultorio;

public final class ConsultorioMapper {
    private ConsultorioMapper() {}

    public static ConsultorioResponseDTO respuesta(Consultorio origen) {
        return new ConsultorioResponseDTO(
                origen.getIdConsultorio(),
                origen.getNombre(),
                origen.getUbicacion(),
                origen.getEstado());
    }
}

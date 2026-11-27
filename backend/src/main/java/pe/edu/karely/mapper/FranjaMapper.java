package pe.edu.karely.mapper;

import pe.edu.karely.dto.catalogo.FranjaResponseDTO;
import pe.edu.karely.entity.FranjaHoraria;

public final class FranjaMapper {
    private FranjaMapper() {}

    public static FranjaResponseDTO respuesta(FranjaHoraria origen) {
        return new FranjaResponseDTO(
                origen.getIdFranja(),
                origen.getHoraInicio(),
                origen.getHoraFin(),
                origen.getEstado());
    }
}

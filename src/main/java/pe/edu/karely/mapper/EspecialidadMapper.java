package pe.edu.karely.mapper;

import pe.edu.karely.entity.Especialidad;
import pe.edu.karely.dto.catalogo.EspecialidadResponseDTO;

public final class EspecialidadMapper {
    private EspecialidadMapper() {}

    public static EspecialidadResponseDTO respuesta(Especialidad origen) {
        return new EspecialidadResponseDTO(
                origen.getIdEspecialidad(),
                origen.getNombre(),
                origen.getPrecioConsulta(),
                origen.getEstado());
    }
}

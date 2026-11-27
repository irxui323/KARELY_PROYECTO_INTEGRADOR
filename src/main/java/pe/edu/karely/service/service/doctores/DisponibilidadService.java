package pe.edu.karely.service.service.doctores;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.doctor.DisponibilidadRequestDTO;
import pe.edu.karely.dto.doctor.DisponibilidadResponseDTO;

import java.util.List;

public interface DisponibilidadService {
    pe.edu.karely.dto.PaginaResponseDTO<DisponibilidadResponseDTO> listarHorariosPagina(
            int pagina, int tamanio, String filtro, long actor);

    List<DisponibilidadResponseDTO> listarHorarios(long actor);

    OperacionResponseDTO registrarHorario(long idDoctor, DisponibilidadRequestDTO i, long actor);
}

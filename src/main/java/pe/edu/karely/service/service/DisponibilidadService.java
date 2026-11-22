package pe.edu.karely.service.service;
import java.util.List;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.doctor.DisponibilidadRequestDTO;
import pe.edu.karely.dto.doctor.DisponibilidadResponseDTO;
public interface DisponibilidadService {
List<DisponibilidadResponseDTO> listarHorarios(long actor);
OperacionResponseDTO registrarHorario(long idDoctor, DisponibilidadRequestDTO i, long actor);
}

package pe.edu.karely.service.service.pacientes;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.paciente.PacienteRequestDTO;
import pe.edu.karely.dto.paciente.PacienteResponseDTO;

import java.util.List;

public interface PacienteService {
    List<PacienteResponseDTO> listarPacientes(long actor);

    OperacionResponseDTO registrarPaciente(PacienteRequestDTO i, long actor);

    OperacionResponseDTO editarPaciente(long idPaciente, PacienteRequestDTO i, long actor);

    List<PacienteResponseDTO> buscarPaciente(String tipo, String documento, long actor);

    PacienteResponseDTO buscarPorId(long id, long actor);

    pe.edu.karely.dto.PaginaResponseDTO<PacienteResponseDTO> listarPacientesPagina(
            int pagina, int tamanio, String filtro, long actor);
}

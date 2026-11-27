package pe.edu.karely.mapper;

import pe.edu.karely.dto.paciente.PacienteResponseDTO;
import pe.edu.karely.entity.Paciente;

public final class PacienteMapper {
    private PacienteMapper() {}

    public static PacienteResponseDTO respuesta(Paciente origen) {
        return new PacienteResponseDTO(
                origen.getIdPaciente(),
                origen.getTipoDocumento(),
                origen.getNumeroDocumento(),
                origen.getNombres(),
                origen.getApellidos(),
                origen.getFechaNacimiento(),
                origen.getTelefono(),
                origen.getCorreo(),
                origen.getDireccion(),
                origen.getEstado());
    }
}

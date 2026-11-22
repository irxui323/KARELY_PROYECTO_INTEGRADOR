package pe.edu.karely.mapper;

import pe.edu.karely.entity.Doctor;
import pe.edu.karely.dto.doctor.DoctorResponseDTO;

public final class DoctorMapper {
    private DoctorMapper() {}

    public static DoctorResponseDTO respuesta(Doctor origen) {
        return new DoctorResponseDTO(
                origen.getIdDoctor(),
                origen.getUsuario() == null ? null : origen.getUsuario().getIdUsuario(),
                origen.getTipoDocumento(),
                origen.getNumeroDocumento(),
                origen.getNombres(),
                origen.getApellidos(),
                origen.getTelefono(),
                origen.getCorreo(),
                origen.getEstadoDocumentacion(),
                origen.getEstado());
    }
}

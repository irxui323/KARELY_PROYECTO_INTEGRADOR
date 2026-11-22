package pe.edu.karely.dto.doctor;

public record DoctorResponseDTO(
        Long idDoctor,
        Long idUsuario,
        String tipoDocumento,
        String numeroDocumento,
        String nombres,
        String apellidos,
        String telefono,
        String correo,
        String estadoDocumentacion,
        String estado) {}

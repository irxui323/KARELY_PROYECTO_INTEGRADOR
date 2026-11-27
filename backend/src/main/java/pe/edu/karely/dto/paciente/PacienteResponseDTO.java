package pe.edu.karely.dto.paciente;

import java.time.LocalDate;

public record PacienteResponseDTO(
        Long idPaciente,
        String tipoDocumento,
        String numeroDocumento,
        String nombres,
        String apellidos,
        LocalDate fechaNacimiento,
        String telefono,
        String correo,
        String direccion,
        String estado) {}

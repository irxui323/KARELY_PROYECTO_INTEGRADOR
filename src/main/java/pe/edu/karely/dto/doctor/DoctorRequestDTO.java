package pe.edu.karely.dto.doctor;

import jakarta.validation.constraints.*;

public record DoctorRequestDTO(
        @NotBlank @Size(max = 12) String tipoDocumento,
        @NotBlank @Size(max = 20) String numeroDocumento,
        @NotBlank @Size(max = 100) String nombres,
        @NotBlank @Size(max = 100) String apellidos,
        @Size(max = 20) String telefono,
        @Email @Size(max = 150) String correo,
        @Pattern(regexp = "ACTIVO|INACTIVO") String estado) {
    public DoctorRequestDTO {
        tipoDocumento = tipoDocumento == null ? null : tipoDocumento.trim();
        numeroDocumento = numeroDocumento == null ? null : numeroDocumento.trim();
        nombres = nombres == null ? null : nombres.trim();
        apellidos = apellidos == null ? null : apellidos.trim();
        telefono = telefono == null ? null : telefono.trim();
        correo = correo == null ? null : correo.trim();
        estado = estado == null ? "ACTIVO" : estado.trim();
    }
}

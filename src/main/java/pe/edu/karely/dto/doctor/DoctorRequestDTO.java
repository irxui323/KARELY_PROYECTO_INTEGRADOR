package pe.edu.karely.dto.doctor;

import jakarta.validation.constraints.*;

public record DoctorRequestDTO(
        @NotBlank(message = "Selecciona el tipo de documento") @Size(max = 12, message = "El tipo de documento admite hasta 12 caracteres") String tipoDocumento,
        @NotBlank(message = "Ingresa el número de documento") @Size(max = 20, message = "El documento admite hasta 20 caracteres") String numeroDocumento,
        @NotBlank(message = "Ingresa los nombres") @Size(max = 100, message = "Los nombres admiten hasta 100 caracteres") String nombres,
        @NotBlank(message = "Ingresa los apellidos") @Size(max = 100, message = "Los apellidos admiten hasta 100 caracteres") String apellidos,
        @Size(max = 20, message = "El teléfono admite hasta 20 caracteres") String telefono,
        @Email(message = "Ingresa un correo válido") @Size(max = 150, message = "El correo admite hasta 150 caracteres") String correo,
        @Pattern(regexp = "ACTIVO|INACTIVO", message = "Selecciona un estado válido") String estado) {
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

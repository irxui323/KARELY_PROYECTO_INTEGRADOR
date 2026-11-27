package pe.edu.karely.dto.paciente;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record PacienteRequestDTO(
        @NotBlank(message = "Selecciona el tipo de documento") @Size(max = 12, message = "El tipo de documento admite hasta 12 caracteres") String tipoDocumento,
        @NotBlank(message = "Ingresa el número de documento") @Size(max = 20, message = "El documento admite hasta 20 caracteres") String numeroDocumento,
        @NotBlank(message = "Ingresa los nombres") @Size(max = 100, message = "Los nombres admiten hasta 100 caracteres") String nombres,
        @NotBlank(message = "Ingresa los apellidos") @Size(max = 100, message = "Los apellidos admiten hasta 100 caracteres") String apellidos,
        @Size(max = 20, message = "El teléfono admite hasta 20 caracteres") String telefono,
        @Email(message = "Ingresa un correo válido") @Size(max = 150, message = "El correo admite hasta 150 caracteres") String correo,
        @Size(max = 250, message = "La dirección admite hasta 250 caracteres") String direccion,
        @Pattern(regexp = "ACTIVO|INACTIVO", message = "Selecciona un estado válido") String estado,
        @PastOrPresent(message = "La fecha de nacimiento no puede ser futura") LocalDate fechaNacimiento) {
    public PacienteRequestDTO {
        tipoDocumento = tipoDocumento == null ? null : tipoDocumento.trim();
        numeroDocumento = numeroDocumento == null ? null : numeroDocumento.trim();
        nombres = nombres == null ? null : nombres.trim();
        apellidos = apellidos == null ? null : apellidos.trim();
        telefono = telefono == null ? null : telefono.trim();
        correo = correo == null ? null : correo.trim();
        direccion = direccion == null ? null : direccion.trim();
        estado = estado == null ? "ACTIVO" : estado.trim();
    }
}

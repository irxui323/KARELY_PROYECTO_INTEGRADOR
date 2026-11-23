package pe.edu.karely.dto.administracion;

import jakarta.validation.constraints.*;

public record UsuarioRequestDTO(
        @NotNull(message = "Selecciona un rol") @Positive(message = "Selecciona un rol válido") Long idRol,
        @NotBlank(message = "Ingresa el usuario") @Size(max = 60, message = "El usuario admite hasta 60 caracteres") String username,
        @NotBlank(message = "Ingresa el correo") @Email(message = "Ingresa un correo válido") @Size(max = 150, message = "El correo admite hasta 150 caracteres") String correo,
        @Size(min = 12, max = 72, message = "La contraseña debe tener entre 12 y 72 caracteres") String password) {
    public UsuarioRequestDTO {
        username = username == null ? null : username.trim();
        correo = correo == null ? null : correo.trim();
    }
}

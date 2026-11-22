package pe.edu.karely.dto.administracion;
import jakarta.validation.constraints.*;
public record UsuarioRequestDTO(
    @NotNull @Positive Long idRol,
    @NotBlank @Size(max=60) String username,
    @NotBlank @Email @Size(max=150) String correo,
    @Size(min=12,max=72) String password
) {
    public UsuarioRequestDTO {
        username = username == null ? null : username.trim();
        correo = correo == null ? null : correo.trim();
    }
}

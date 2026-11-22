package pe.edu.karely.dto.doctor;
import jakarta.validation.constraints.*;
public record CrearAccesoRequestDTO(@NotBlank @Size(max=60) @Pattern(regexp="[A-Za-z0-9._-]{3,60}") String username) {
    public CrearAccesoRequestDTO { username=username==null?null:username.trim().toLowerCase(java.util.Locale.ROOT); }
}

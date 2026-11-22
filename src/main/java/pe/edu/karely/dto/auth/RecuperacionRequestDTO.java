package pe.edu.karely.dto.auth;

import jakarta.validation.constraints.*;

public record RecuperacionRequestDTO(@NotBlank @Email @Size(max=150) String correo) {}

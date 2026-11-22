package pe.edu.karely.dto.auth;

import jakarta.validation.constraints.*;

public record RestablecerPasswordRequestDTO(
        @NotBlank @Pattern(regexp = "[A-Za-z0-9_-]{43}") String token,
        @NotBlank @Size(min = 12, max = 72) String password,
        @NotBlank @Size(min = 12, max = 72) String confirmacionPassword) {}

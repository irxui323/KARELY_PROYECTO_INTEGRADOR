package pe.edu.karely.dto.administracion;

import jakarta.validation.constraints.*;

public record EstadoUsuarioRequestDTO(
        @NotBlank @Pattern(regexp = "ACTIVO|INACTIVO|BLOQUEADO") String estado) {
    public EstadoUsuarioRequestDTO {
        estado = estado == null ? "ACTIVO" : estado.trim();
    }
}

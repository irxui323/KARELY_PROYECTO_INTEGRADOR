package pe.edu.karely.dto.catalogo;

import jakarta.validation.constraints.*;

public record ConsultorioRequestDTO(
        @NotBlank @Size(max = 100) String nombre,
        @Size(max = 200) String ubicacion,
        @Pattern(regexp = "ACTIVO|INACTIVO") String estado) {
    public ConsultorioRequestDTO {
        nombre = nombre == null ? null : nombre.trim();
        ubicacion = ubicacion == null ? null : ubicacion.trim();
        estado = estado == null ? "ACTIVO" : estado.trim();
    }
}

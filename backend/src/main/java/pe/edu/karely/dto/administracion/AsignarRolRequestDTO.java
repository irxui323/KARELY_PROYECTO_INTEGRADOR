package pe.edu.karely.dto.administracion;

import jakarta.validation.constraints.*;

public record AsignarRolRequestDTO(@NotNull @Positive Long idRol) {}

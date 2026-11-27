package pe.edu.karely.dto.doctor;

import jakarta.validation.constraints.*;

public record AsignarEspecialidadRequestDTO(@NotNull @Positive Long idEspecialidad) {}

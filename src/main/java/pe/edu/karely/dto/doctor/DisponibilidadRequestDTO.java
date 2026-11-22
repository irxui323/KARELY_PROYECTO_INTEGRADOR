package pe.edu.karely.dto.doctor;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record DisponibilidadRequestDTO(
        @NotNull LocalDate fecha,
        @NotNull @Positive Long idFranja,
        @NotNull @Positive Long idEspecialidad) {}

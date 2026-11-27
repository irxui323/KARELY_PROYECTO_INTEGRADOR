package pe.edu.karely.dto.cita;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record ReservaRequestDTO(
        @NotNull @Positive Long idPaciente,
        @NotNull @Positive Long idDoctor,
        @NotNull @Positive Long idEspecialidad,
        @NotNull @Positive Long idConsultorio,
        @NotNull @Positive Long idFranja,
        @NotNull LocalDate fecha) {}

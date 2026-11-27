package pe.edu.karely.dto.doctor;

import jakarta.validation.constraints.*;

public record ValidarDocumentacionRequestDTO(
        @NotNull @AssertTrue Boolean dniConforme,
        @NotNull @AssertTrue Boolean tituloConforme,
        @NotNull @Positive Long idDni,
        @NotNull @Positive Long idTitulo) {}

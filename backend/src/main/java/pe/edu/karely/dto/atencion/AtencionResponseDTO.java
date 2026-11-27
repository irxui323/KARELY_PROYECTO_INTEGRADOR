package pe.edu.karely.dto.atencion;

import java.time.LocalDateTime;

public record AtencionResponseDTO(
        Long idAtencion,
        Long idCita,
        Long idDoctor,
        LocalDateTime fechaInicio,
        LocalDateTime fechaCierre,
        String estado,
        Long idReceta,
        String indicacionesReceta) {}

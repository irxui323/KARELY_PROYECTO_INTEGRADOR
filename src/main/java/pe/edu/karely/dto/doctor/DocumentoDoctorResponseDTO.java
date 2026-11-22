package pe.edu.karely.dto.doctor;

import java.time.LocalDateTime;

public record DocumentoDoctorResponseDTO(
        Long idDocumento,
        Long idDoctor,
        String tipoDocumento,
        String nombreArchivo,
        String tipoMime,
        String estado,
        LocalDateTime fechaValidacion,
        String motivoRechazo) {}

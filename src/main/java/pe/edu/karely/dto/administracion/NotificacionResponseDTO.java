package pe.edu.karely.dto.administracion;

import java.time.LocalDateTime;

public record NotificacionResponseDTO(
        Long idNotificacion,
        String codigoEvento,
        String tipo,
        String canal,
        String estado,
        Integer intentos,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaProximoIntento,
        LocalDateTime fechaEnvio,
        Long idCita,
        Long idLiquidacion) {}

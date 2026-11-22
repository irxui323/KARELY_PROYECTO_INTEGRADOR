package pe.edu.karely.dto.administracion;


public record NotificacionEnvioDTO(
        Long idNotificacion,
        String tipo,
        String destinatario,
        String codigoEvento,
        Integer intento) {}

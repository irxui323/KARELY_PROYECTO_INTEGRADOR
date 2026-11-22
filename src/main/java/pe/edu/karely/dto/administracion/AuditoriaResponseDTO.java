package pe.edu.karely.dto.administracion;

import java.time.LocalDateTime;

public record AuditoriaResponseDTO(
        Long idAuditoria,
        Long idUsuario,
        String tablaAfectada,
        Long idRegistro,
        String accion,
        String detalle,
        LocalDateTime fechaOperacion,
        String origen,
        String estadoAnterior,
        String estadoNuevo) {}

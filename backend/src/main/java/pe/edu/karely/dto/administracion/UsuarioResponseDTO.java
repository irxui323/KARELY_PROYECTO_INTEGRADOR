package pe.edu.karely.dto.administracion;

import java.time.LocalDateTime;

public record UsuarioResponseDTO(
        Long idUsuario,
        String username,
        String correo,
        String rol,
        String estado,
        LocalDateTime ultimoAcceso) {}

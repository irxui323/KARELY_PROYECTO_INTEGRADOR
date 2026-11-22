package pe.edu.karely.dto.auth;


public record CredencialesDTO(
        Long idUsuario,
        String passwordHash,
        String estado,
        String rol) {}

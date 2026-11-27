package pe.edu.karely.dto.auth;

public record LoginResponseDTO(String token, String usuario, String rol, long idUsuario) {}

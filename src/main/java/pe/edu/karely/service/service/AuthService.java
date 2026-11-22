package pe.edu.karely.service.service;

import pe.edu.karely.dto.administracion.UsuarioResponseDTO;
import pe.edu.karely.dto.auth.LoginRequestDTO;
import pe.edu.karely.dto.auth.LoginResponseDTO;
import pe.edu.karely.dto.auth.MensajeResponseDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO body);

    UsuarioResponseDTO me(long actor);

    MensajeResponseDTO logout(long actor, String authorization);
}

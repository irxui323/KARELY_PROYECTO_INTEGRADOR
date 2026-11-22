package pe.edu.karely.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.karely.repository.UsuarioRepository;

@Service
public class LoginAttemptService {
    private final UsuarioRepository usuarios;

    public LoginAttemptService(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void failed(long userId) {
        usuarios.registrarIntentoFallido(userId);
    }
}

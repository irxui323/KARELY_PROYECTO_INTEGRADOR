package pe.edu.karely.service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.karely.dto.administracion.UsuarioResponseDTO;
import pe.edu.karely.dto.auth.CredencialesDTO;
import pe.edu.karely.dto.auth.LoginRequestDTO;
import pe.edu.karely.dto.auth.LoginResponseDTO;
import pe.edu.karely.dto.auth.MensajeResponseDTO;
import pe.edu.karely.repository.SesionRepository;
import pe.edu.karely.repository.UsuarioRepository;
import pe.edu.karely.security.JwtService;
import pe.edu.karely.service.service.AuthService;

import java.util.Locale;
import java.util.Objects;

@Service
public class AuthServiceImpl implements AuthService {
    private final SesionRepository sesiones;
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final LoginAttemptService intentos;

    public AuthServiceImpl(
            SesionRepository sesiones,
            UsuarioRepository usuarios,
            PasswordEncoder encoder,
            JwtService jwt,
            LoginAttemptService intentos) {
        this.sesiones = sesiones;
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.jwt = jwt;
        this.intentos = intentos;
    }

    @Override
    @Transactional
    public LoginResponseDTO login(LoginRequestDTO body) {
        String username = Objects.toString(body.username(), "").trim().toLowerCase(Locale.ROOT);
        String password = Objects.toString(body.password(), "");
        if (username.isEmpty() || password.isEmpty()) {
            throw credencialesIncorrectas();
        }

        CredencialesDTO usuario = usuarios.buscarCredenciales(username);
        if (usuario == null || !"ACTIVO".equals(usuario.estado())) {
            throw credencialesIncorrectas();
        }
        if (!encoder.matches(password, Objects.toString(usuario.passwordHash(), ""))) {
            intentos.failed(usuario.idUsuario());
            throw credencialesIncorrectas();
        }

        CredencialesDTO vigente = usuarios.bloquearCredenciales(usuario.idUsuario());
        if (vigente == null
                || !"ACTIVO".equals(vigente.estado())
                || !Objects.equals(usuario.passwordHash(), vigente.passwordHash())
                || !Objects.equals(usuario.rol(), vigente.rol())) {
            throw credencialesIncorrectas();
        }

        long id = usuario.idUsuario();
        usuarios.registrarAcceso(id);
        long sesion = sesiones.abrir(id);
        return new LoginResponseDTO(
                jwt.issue(id, sesion, usuario.rol()), username, usuario.rol(), id);
    }

    @Override
    public UsuarioResponseDTO me(long actor) {
        UsuarioResponseDTO usuario = usuarios.buscarPerfil(actor);
        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return usuario;
    }

    @Override
    @Transactional
    public MensajeResponseDTO logout(long actor, String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            JwtService.Claims claims = jwt.verify(authorization.substring(7));
            if (claims.userId() == actor) {
                sesiones.cerrar(claims.sessionId(), actor);
            }
        }
        return new MensajeResponseDTO("Sesión cerrada");
    }

    private BadCredentialsException credencialesIncorrectas() {
        return new BadCredentialsException("Credenciales inválidas");
    }
}

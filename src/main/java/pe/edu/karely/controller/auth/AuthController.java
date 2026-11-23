package pe.edu.karely.controller.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pe.edu.karely.dto.administracion.UsuarioResponseDTO;
import pe.edu.karely.dto.auth.LoginRequestDTO;
import pe.edu.karely.dto.auth.LoginResponseDTO;
import pe.edu.karely.dto.auth.MensajeResponseDTO;
import pe.edu.karely.dto.auth.RecuperacionRequestDTO;
import pe.edu.karely.dto.auth.RestablecerPasswordRequestDTO;
import pe.edu.karely.service.service.auth.AuthService;
import pe.edu.karely.service.service.auth.RecuperacionService;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService service;
    private final RecuperacionService recuperacion;

    public AuthController(AuthService service, RecuperacionService recuperacion) {
        this.service = service;
        this.recuperacion = recuperacion;
    }

    @PostMapping("/recuperacion")
    public ResponseEntity<MensajeResponseDTO> solicitarRecuperacion(
            @Valid @RequestBody RecuperacionRequestDTO body, HttpServletRequest request) {
        recuperacion.solicitar(body, request.getRemoteAddr());
        return ResponseEntity.accepted()
                .cacheControl(CacheControl.noStore())
                .body(
                        new MensajeResponseDTO(
                                "Si el correo corresponde a una cuenta, recibirás instrucciones"
                                    + " para restablecer tu contraseña"));
    }

    @PostMapping("/restablecer-password")
    public ResponseEntity<MensajeResponseDTO> restablecerPassword(
            @Valid @RequestBody RestablecerPasswordRequestDTO body) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(recuperacion.restablecer(body));
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO body) {
        return service.login(body);
    }

    @GetMapping("/me")
    public UsuarioResponseDTO me(Authentication auth) {
        return service.me((Long) auth.getPrincipal());
    }

    @PostMapping("/logout")
    public MensajeResponseDTO logout(Authentication auth, HttpServletRequest request) {
        return service.logout((Long) auth.getPrincipal(), request.getHeader("Authorization"));
    }
}

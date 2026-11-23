package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;

import pe.edu.karely.dto.auth.CredencialesDTO;
import pe.edu.karely.dto.auth.LoginRequestDTO;
import pe.edu.karely.repository.SesionRepository;
import pe.edu.karely.repository.UsuarioRepository;
import pe.edu.karely.security.JwtService;
import pe.edu.karely.service.impl.AuthServiceImpl;
import pe.edu.karely.service.impl.LoginAttemptService;

import tools.jackson.databind.json.JsonMapper;

class SesionRevisionTest {
    private final UsuarioRepository usuarios = mock(UsuarioRepository.class);
    private final SesionRepository sesiones = mock(SesionRepository.class);
    private final PasswordEncoder encoder = mock(PasswordEncoder.class);
    private final LoginAttemptService intentos = mock(LoginAttemptService.class);
    private final JwtService jwt =
            new JwtService(
                    "clave-exclusiva-para-pruebas-muy-larga-40", 60, JsonMapper.builder().build());
    private final AuthServiceImpl servicio =
            new AuthServiceImpl(sesiones, usuarios, encoder, jwt, intentos);

    @Test
    void credencialesVaciasNoConsultanBase() {
        var error =
                assertThrows(
                        BadCredentialsException.class,
                        () -> servicio.login(new LoginRequestDTO(null, null)));
        verifyNoInteractions(usuarios, sesiones);
    }

    @Test
    void usuarioInexistenteNoAbreSesion() {
        assertThrows(
                BadCredentialsException.class,
                () -> servicio.login(new LoginRequestDTO("ausente", "incorrecta")));
        verifyNoInteractions(sesiones, intentos);
    }

    @Test
    void claveIncorrectaRegistraIntentoSinAbrirSesion() {
        when(usuarios.buscarCredenciales("doctor"))
                .thenReturn(new CredencialesDTO(1L, "hash", "ACTIVO", "DOCTOR"));
        assertThrows(
                BadCredentialsException.class,
                () -> servicio.login(new LoginRequestDTO("doctor", "incorrecta")));
        verify(intentos).failed(1L);
        verifyNoInteractions(sesiones);
    }

    @Test
    void loginNormalizaUsuarioYDevuelveTokenSinHash() {
        when(usuarios.buscarCredenciales("doctor"))
                .thenReturn(new CredencialesDTO(1L, "hash", "ACTIVO", "DOCTOR"));
        when(encoder.matches("correcta", "hash")).thenReturn(true);
        when(usuarios.bloquearCredenciales(1L))
                .thenReturn(new CredencialesDTO(1L, "hash", "ACTIVO", "DOCTOR"));
        when(sesiones.abrir(1L)).thenReturn(2L);
        var respuesta = servicio.login(new LoginRequestDTO(" Doctor ", "correcta"));
        assertEquals("doctor", respuesta.usuario());
        assertEquals(2L, jwt.verify(respuesta.token()).sessionId());
        assertEquals("DOCTOR", respuesta.rol());
        verify(usuarios).registrarAcceso(1L);
    }

    @Test
    void noAbreSesionSiLaClaveCambioDuranteLaVerificacion() {
        when(usuarios.buscarCredenciales("doctor"))
                .thenReturn(new CredencialesDTO(1L, "hash-anterior", "ACTIVO", "DOCTOR"));
        when(encoder.matches("correcta", "hash-anterior")).thenReturn(true);
        when(usuarios.bloquearCredenciales(1L))
                .thenReturn(new CredencialesDTO(1L, "hash-nuevo", "ACTIVO", "DOCTOR"));
        assertThrows(
                BadCredentialsException.class,
                () -> servicio.login(new LoginRequestDTO("doctor", "correcta")));
        verifyNoInteractions(sesiones);
    }

    @Test
    void logoutCierraSoloSesionDelActor() {
        servicio.logout(1L, "Bearer " + jwt.issue(1, 2, "DOCTOR"));
        verify(sesiones).cerrar(2, 1);
    }

    @Test
    void logoutNoCierraSesionAjena() {
        servicio.logout(3L, "Bearer " + jwt.issue(1, 2, "DOCTOR"));
        verifyNoInteractions(sesiones);
    }
}

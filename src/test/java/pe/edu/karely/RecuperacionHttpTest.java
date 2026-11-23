package pe.edu.karely;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import pe.edu.karely.controller.auth.AuthController;
import pe.edu.karely.dto.auth.MensajeResponseDTO;
import pe.edu.karely.dto.auth.RestablecerPasswordRequestDTO;
import pe.edu.karely.exception.GlobalExceptionHandler;
import pe.edu.karely.service.service.auth.AuthService;
import pe.edu.karely.service.service.auth.RecuperacionService;

class RecuperacionHttpTest {
    @Test
    void solicitarRecuperacionAceptaCorreoSinRevelarUnaCuenta() throws Exception {
        var mvc =
                MockMvcBuilders.standaloneSetup(
                                new AuthController(
                                        mock(AuthService.class),
                                        mock(
                                                pe.edu.karely.service.service.auth.RecuperacionService
                                                        .class)))
                        .build();
        mvc.perform(
                        post("/api/v1/auth/recuperacion")
                                .contentType("application/json")
                                .content("{\"correo\":\"trabajador@example.com\"}"))
                .andExpect(status().isAccepted())
                .andExpect(
                        jsonPath("$.mensaje")
                                .value(
                                        "Si el correo corresponde a una cuenta, recibirÃ¡s"
                                            + " instrucciones para restablecer tu contraseÃ±a"));
    }

    @Test
    void correoInvalidoNoIniciaUnEnvio() throws Exception {
        var service = mock(RecuperacionService.class);
        var mvc =
                MockMvcBuilders.standaloneSetup(
                                new AuthController(mock(AuthService.class), service))
                        .setControllerAdvice(new GlobalExceptionHandler())
                        .build();
        mvc.perform(
                        post("/api/v1/auth/recuperacion")
                                .contentType("application/json")
                                .content("{\"correo\":\"invalido\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void restablecimientoRespondeSinCrearUnaSesion() throws Exception {
        var auth = mock(AuthService.class);
        var service = mock(RecuperacionService.class);
        when(service.restablecer(any()))
                .thenReturn(
                        new MensajeResponseDTO("ContraseÃ±a actualizada. Vuelve a iniciar sesiÃ³n"));
        var mvc =
                MockMvcBuilders.standaloneSetup(new AuthController(auth, service))
                        .setControllerAdvice(new GlobalExceptionHandler())
                        .build();
        String token = "A".repeat(43);
        mvc.perform(
                        post("/api/v1/auth/restablecer-password")
                                .contentType("application/json")
                                .content(
                                        "{\"token\":\""
                                                + token
                                                + "\",\"password\":\"NuevaClaveSegura123!\",\"confirmacionPassword\":\"NuevaClaveSegura123!\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.token").doesNotExist());
        verifyNoInteractions(auth);
        verify(service)
                .restablecer(
                        new RestablecerPasswordRequestDTO(
                                token, "NuevaClaveSegura123!", "NuevaClaveSegura123!"));
    }
}

package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import pe.edu.karely.controller.citas.CitaController;
import pe.edu.karely.dto.auth.RolActivoDTO;
import pe.edu.karely.dto.doctor.AsignarEspecialidadRequestDTO;
import pe.edu.karely.dto.paciente.PacienteRequestDTO;
import pe.edu.karely.exception.GlobalExceptionHandler;
import pe.edu.karely.repository.OracleJdbc;
import pe.edu.karely.repository.auth.SesionRepository;
import pe.edu.karely.security.AuthFilter;
import pe.edu.karely.security.JwtService;
import pe.edu.karely.service.service.citas.CitaService;

import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.util.List;

class RevisionAmpliadaTest {
    private JwtService jwt(long minutos) {
        return new JwtService(
                "secreto-exclusivo-de-pruebas-de-40-caracteres",
                minutos,
                JsonMapper.builder().build());
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "abc", "a.b", "a.b.c", "a.b.c.d", "@@.@@.@@"})
    void rechazaTokensMalformados(String token) {
        assertThrows(IllegalArgumentException.class, () -> jwt(60).verify(token));
    }

    @Test
    void rechazaTokenVencido() {
        var servicio = jwt(-1);
        assertThrows(
                IllegalArgumentException.class,
                () -> servicio.verify(servicio.issue(1, 2, "DOCTOR")));
    }

    @Test
    void rechazaOtraClave() {
        var otra =
                new JwtService(
                        "otra-clave-exclusiva-de-pruebas-muy-larga",
                        60,
                        JsonMapper.builder().build());
        assertThrows(
                IllegalArgumentException.class, () -> otra.verify(jwt(60).issue(1, 2, "DOCTOR")));
    }

    @Test
    void rechazaClaveCorta() {
        assertThrows(
                IllegalArgumentException.class,
                () -> new JwtService("corta", 60, JsonMapper.builder().build()));
    }

    @ParameterizedTest
    @ValueSource(strings = {"[]", "{}", "\"abc\"", "1.5"})
    void rechazaIdentificadoresNoNumericos(String valor) {
        var mapper =
                JsonMapper.builder().disable(DeserializationFeature.ACCEPT_FLOAT_AS_INT).build();
        assertThrows(
                tools.jackson.core.JacksonException.class,
                () ->
                        mapper.readValue(
                                "{\"idEspecialidad\":" + valor + "}",
                                AsignarEspecialidadRequestDTO.class));
    }

    @Test
    void normalizaTextoYOpcionales() {
        var entrada =
                new PacienteRequestDTO(
                        " DNI ", " 12345678 ", " Ana ", " PÃ©rez ", null, null, null, null, null);
        assertEquals("Ana", entrada.nombres());
        assertEquals("12345678", entrada.numeroDocumento());
        assertNull(entrada.correo());
        assertEquals("ACTIVO", entrada.estado());
    }

    @Test
    void convierteFechaParaJdbcSinAlterarOtrosValores() {
        var fecha = LocalDate.of(2026, 11, 20);
        assertArrayEquals(
                new Object[] {java.sql.Date.valueOf(fecha), null, "texto", 3L},
                OracleJdbc.convert(fecha, null, "texto", 3L));
    }

    @Test
    void rechazaNombreDeProcedimientoInyectadoAntesDeConectar() {
        assertThrows(
                IllegalArgumentException.class,
                () -> new OracleJdbc(null, null).call("SP_X; DROP TABLE USUARIO", 1));
    }

    @Test
    void sesionActivaAutenticaYSeLimpiaAlTerminar() throws Exception {
        var servicio = jwt(60);
        var repositorio = mock(SesionRepository.class);
        when(repositorio.buscarSesionActiva(2, 1)).thenReturn(List.of(new RolActivoDTO("DOCTOR")));
        var request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + servicio.issue(1, 2, "DOCTOR"));
        new AuthFilter(servicio, repositorio)
                .doFilter(
                        request,
                        new MockHttpServletResponse(),
                        (req, res) -> {
                            var auth = SecurityContextHolder.getContext().getAuthentication();
                            assertNotNull(auth);
                            assertEquals(1L, auth.getPrincipal());
                        });
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(repositorio).actualizarActividad(2);
    }

    @ParameterizedTest
    @ValueSource(strings = {"CERRADA", "ROL_CAMBIADO"})
    void sesionRevocadaORolDistintoNoAutentica(String caso) throws Exception {
        var servicio = jwt(60);
        var repositorio = mock(SesionRepository.class);
        when(repositorio.buscarSesionActiva(2, 1))
                .thenReturn(
                        caso.equals("CERRADA")
                                ? List.of()
                                : List.of(new RolActivoDTO("RECEPCIONISTA")));
        var request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + servicio.issue(1, 2, "DOCTOR"));
        new AuthFilter(servicio, repositorio)
                .doFilter(
                        request,
                        new MockHttpServletResponse(),
                        (req, res) ->
                                assertNull(SecurityContextHolder.getContext().getAuthentication()));
        verify(repositorio, never()).actualizarActividad(anyLong());
    }

    @Test
    void fechaHttpInvalidaDebeResponder400() throws Exception {
        var servicio = mock(CitaService.class);
        var mvc =
                MockMvcBuilders.standaloneSetup(new CitaController(servicio))
                        .setControllerAdvice(new GlobalExceptionHandler())
                        .build();
        mvc.perform(get("/api/v1/citas/agenda").param("fecha", "fecha-invalida"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(servicio);
    }

    @Test
    void jsonMalformadoDebeResponder400() throws Exception {
        var servicio = mock(CitaService.class);
        var mvc =
                MockMvcBuilders.standaloneSetup(new CitaController(servicio))
                        .setControllerAdvice(new GlobalExceptionHandler())
                        .build();
        mvc.perform(
                        post("/api/v1/citas/confirmar")
                                .contentType("application/json")
                                .content("{invalido"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(servicio);
    }
}

package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import pe.edu.karely.dto.administracion.*;
import pe.edu.karely.repository.administracion.UsuarioRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.impl.administracion.UsuarioServiceImpl;

import java.util.List;

class TrabajadorAccesoTest {
    @Test
    void creaTrabajadorSinPedirUnaClaveYGuardaSoloHash() {
        var repo = mock(UsuarioRepository.class);
        when(repo.listarRoles())
                .thenReturn(List.of(new RolResponseDTO(2L, "RECEPCIONISTA", "ACTIVO")));
        when(repo.crearUsuario(
                        eq(7L), eq(2L), eq("recepcion"), eq("recepcion@example.com"), anyString()))
                .thenReturn(10L);
        var servicio =
                new UsuarioServiceImpl(
                        repo, mock(PermisosUsuario.class), new BCryptPasswordEncoder());
        var acceso =
                servicio.registrarUsuario(
                        new UsuarioRequestDTO(2L, "recepcion", "recepcion@example.com", null), 7);
        var hash = ArgumentCaptor.forClass(String.class);
        verify(repo)
                .crearUsuario(
                        eq(7L),
                        eq(2L),
                        eq("recepcion"),
                        eq("recepcion@example.com"),
                        hash.capture());
        assertTrue(hash.getValue().startsWith("$2a$"));
        assertEquals(10L, acceso.idUsuario());
        assertTrue(acceso.password().length() >= 12);
        assertNotEquals(acceso.password(), hash.getValue());
        assertTrue(new BCryptPasswordEncoder().matches(acceso.password(), hash.getValue()));
    }

    @Test
    void cuentaDeDoctorExigeSuProcesoDeValidacion() {
        var repo = mock(UsuarioRepository.class);
        when(repo.listarRoles()).thenReturn(List.of(new RolResponseDTO(3L, "DOCTOR", "ACTIVO")));
        var servicio =
                new UsuarioServiceImpl(
                        repo, mock(PermisosUsuario.class), new BCryptPasswordEncoder());
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        servicio.registrarUsuario(
                                new UsuarioRequestDTO(
                                        3L, "doctor", "doctor@example.com", "ClaveSegura2026!"),
                                7));
        verify(repo, never())
                .crearUsuario(anyLong(), anyLong(), anyString(), anyString(), anyString());
    }

    @Test
    void todosLosRolesDeTrabajadorPuedenCrearseYGeneranClavesDistintas() {
        var repo = mock(UsuarioRepository.class);
        var servicio =
                new UsuarioServiceImpl(
                        repo, mock(PermisosUsuario.class), new BCryptPasswordEncoder());
        var claves = new java.util.HashSet<String>();
        for (String rol : List.of("ADMINISTRADORA", "RECEPCIONISTA", "CAJERA", "TESORERA")) {
            when(repo.listarRoles()).thenReturn(List.of(new RolResponseDTO(2L, rol, "ACTIVO")));
            claves.add(
                    servicio.registrarUsuario(
                                    new UsuarioRequestDTO(
                                            2L, "trabajador", "trabajador@example.com", null),
                                    7)
                            .password());
        }
        assertEquals(4, claves.size());
    }

    @Test
    void rolInactivoYOperadorNoAdministradorNoCreanCuentas() {
        var repo = mock(UsuarioRepository.class);
        when(repo.listarRoles()).thenReturn(List.of(new RolResponseDTO(2L, "CAJERA", "INACTIVO")));
        var permiso = mock(PermisosUsuario.class);
        var servicio = new UsuarioServiceImpl(repo, permiso, new BCryptPasswordEncoder());
        var datos = new UsuarioRequestDTO(2L, "caja", "caja@example.com", null);
        assertThrows(IllegalArgumentException.class, () -> servicio.registrarUsuario(datos, 7));
        doThrow(new org.springframework.security.access.AccessDeniedException("Sin permiso"))
                .when(permiso)
                .exigir(8, "ADMINISTRADORA");
        assertThrows(
                org.springframework.security.access.AccessDeniedException.class,
                () -> servicio.registrarUsuario(datos, 8));
        verify(repo, never())
                .crearUsuario(anyLong(), anyLong(), anyString(), anyString(), anyString());
    }

    @Test
    void endpointAceptaRegistroSinClaveYNoPermiteCachearCredenciales() throws Exception {
        var repo = mock(UsuarioRepository.class);
        when(repo.listarRoles()).thenReturn(List.of(new RolResponseDTO(2L, "CAJERA", "ACTIVO")));
        when(repo.crearUsuario(eq(7L), eq(2L), anyString(), anyString(), anyString()))
                .thenReturn(10L);
        var service =
                new UsuarioServiceImpl(
                        repo, mock(PermisosUsuario.class), new BCryptPasswordEncoder());
        var mvc =
                org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(
                                new pe.edu.karely.controller.administracion.UsuarioController(service))
                        .build();
        mvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                                        "/api/v1/usuarios")
                                .principal(
                                        new org.springframework.security.authentication
                                                .UsernamePasswordAuthenticationToken(7L, null))
                                .contentType("application/json")
                                .content(
                                        "{\"idRol\":2,\"username\":\"caja\",\"correo\":\"caja@example.com\"}"))
                .andExpect(
                        org.springframework.test.web.servlet.result.MockMvcResultMatchers.status()
                                .isOk())
                .andExpect(
                        org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                                .string("Cache-Control", "no-store"))
                .andExpect(
                        org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath(
                                        "$.idUsuario")
                                .value(10))
                .andExpect(
                        org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath(
                                        "$.password")
                                .isNotEmpty());
    }
}

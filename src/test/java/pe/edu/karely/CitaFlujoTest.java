package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import pe.edu.karely.controller.citas.CitaController;
import pe.edu.karely.repository.citas.CitaRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.impl.citas.CitaServiceImpl;

import java.util.ArrayList;
import java.util.List;

class CitaFlujoTest {
    @Test
    void confirmarCitaConservaLaRutaYDelegaUnaVezEnOracle() throws Exception {
        List<String> pasos = new ArrayList<>();
        var repo =
                new CitaRepository(null) {
                    @Override
                    public Long registrarCita(
                            long actor,
                            long usuario,
                            Long reserva,
                            String metodo,
                            String referencia) {
                        assertEquals(
                                List.of(7L, 7L, 14L, "EFECTIVO", "COBRO-000014"),
                                List.of(actor, usuario, reserva, metodo, referencia));
                        pasos.add("confirmar");
                        return 31L;
                    }
                };
        var permisos =
                new PermisosUsuario(null) {
                    @Override
                    public void exigir(long actor, String... roles) {
                        assertEquals(7L, actor);
                        assertEquals(
                                List.of("ADMINISTRADORA", "RECEPCIONISTA", "CAJERA"),
                                List.of(roles));
                        pasos.add("autorizar");
                    }
                };
        var mvc =
                MockMvcBuilders.standaloneSetup(
                                new CitaController(new CitaServiceImpl(repo, permisos)))
                        .build();

        mvc.perform(
                        post("/api/v1/citas/confirmar")
                                .principal(
                                        new UsernamePasswordAuthenticationToken(
                                                7L, null, List.of()))
                                .contentType("application/json")
                                .content(
                                        """
                                        {"idPreReserva":14,"metodoPago":"EFECTIVO"}
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(31))
                .andExpect(
                        jsonPath("$.mensaje")
                                .value("Cobro COBRO-000014 registrado. Cita #31 confirmada."))
                .andExpect(jsonPath("$.accion").value("SP_CONFIRMAR_CITA_PAGADA"));

        assertEquals(List.of("autorizar", "confirmar"), pasos);
    }

    @Test
    void laAgendaRechazaUnRolAjenoAntesDeConsultarOracle() {
        var permisos =
                new PermisosUsuario(null) {
                    @Override
                    public void exigir(long actor, String... roles) {
                        assertEquals(List.of("DOCTOR", "ADMINISTRADORA"), List.of(roles));
                        throw new AccessDeniedException("Rol sin permiso");
                    }
                };
        var service = new CitaServiceImpl(new CitaRepository(null), permisos);
        assertThrows(AccessDeniedException.class, () -> service.detalleCitaMedica(7L, 31L));
    }
}

package pe.edu.karely;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pe.edu.karely.controller.PacienteController;
import pe.edu.karely.controller.LiquidacionController;
import pe.edu.karely.service.service.PacienteService;
import pe.edu.karely.service.service.LiquidacionService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class NuevaArquitecturaHttpTest {
    @Test
    void pacientesSeConsultaComoRecurso() throws Exception {
        var mvc = MockMvcBuilders.standaloneSetup(new PacienteController(mock(PacienteService.class))).build();
        mvc.perform(get("/api/v1/pacientes").principal(new UsernamePasswordAuthenticationToken(1L, null)))
            .andExpect(status().isOk());
    }

    @Test
    void altaPacienteValidaElContratoAntesDeLlamarAlServicio() throws Exception {
        var mvc = MockMvcBuilders.standaloneSetup(new PacienteController(mock(PacienteService.class))).build();
        mvc.perform(post("/api/v1/pacientes").contentType("application/json").content("{}")
            .principal(new UsernamePasswordAuthenticationToken(1L, null)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void pagoDoctorRequiereDatosDelPagoEfectivo() throws Exception {
        var mvc = MockMvcBuilders.standaloneSetup(new LiquidacionController(mock(LiquidacionService.class))).build();
        mvc.perform(post("/api/v1/liquidaciones").contentType("application/json")
            .content("{\"idDoctor\":1,\"fechaInicio\":\"2026-01-01\",\"fechaFin\":\"2026-01-31\"}")
            .principal(new UsernamePasswordAuthenticationToken(1L, null)))
            .andExpect(status().isBadRequest());
    }
}

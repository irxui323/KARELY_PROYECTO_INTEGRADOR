package pe.edu.karely;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import pe.edu.karely.controller.doctores.DoctorController;
import pe.edu.karely.service.service.administracion.*;
import pe.edu.karely.service.service.atencion.*;
import pe.edu.karely.service.service.auth.*;
import pe.edu.karely.service.service.catalogos.*;
import pe.edu.karely.service.service.citas.*;
import pe.edu.karely.service.service.doctores.*;
import pe.edu.karely.service.service.finanzas.*;
import pe.edu.karely.service.service.pacientes.*;
import pe.edu.karely.service.service.reportes.*;

class DoctorEspecialidadHttpTest {
    @Test
    void listaYRetiraDesdeElControllerExistente() throws Exception {
        var service = mock(DoctorService.class);
        when(service.listarEspecialidades(1, 7))
                .thenReturn(
                        java.util.List.of(
                                new pe.edu.karely.dto.catalogo.EspecialidadResponseDTO(
                                        2L,
                                        "Dermatologia",
                                        java.math.BigDecimal.valueOf(100),
                                        "ACTIVO")));
        var mvc =
                MockMvcBuilders.standaloneSetup(
                                new DoctorController(
                                        service,
                                        mock(DocumentoDoctorService.class),
                                        mock(DisponibilidadService.class)))
                        .build();
        var actor = new UsernamePasswordAuthenticationToken(7L, null);
        mvc.perform(get("/api/v1/doctores/1/especialidades").principal(actor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idEspecialidad").value(2));
        mvc.perform(delete("/api/v1/doctores/1/especialidades/2").principal(actor))
                .andExpect(status().isOk());
        verify(service).quitarEspecialidad(1, 2, 7);
    }
}

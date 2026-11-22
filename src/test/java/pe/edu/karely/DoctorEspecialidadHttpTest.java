package pe.edu.karely;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pe.edu.karely.controller.DoctorController;
import pe.edu.karely.service.service.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DoctorEspecialidadHttpTest {
    @Test void listaYRetiraDesdeElControllerExistente() throws Exception {
        var service=mock(DoctorService.class);
        when(service.listarEspecialidades(1,7)).thenReturn(java.util.List.of(new pe.edu.karely.dto.catalogo.EspecialidadResponseDTO(2L,"Dermatologia",java.math.BigDecimal.valueOf(100),"ACTIVO")));
        var mvc=MockMvcBuilders.standaloneSetup(new DoctorController(service,mock(DocumentoDoctorService.class),mock(DisponibilidadService.class))).build();
        var actor=new UsernamePasswordAuthenticationToken(7L,null);
        mvc.perform(get("/api/v1/doctores/1/especialidades").principal(actor))
            .andExpect(status().isOk()).andExpect(jsonPath("$[0].idEspecialidad").value(2));
        mvc.perform(delete("/api/v1/doctores/1/especialidades/2").principal(actor)).andExpect(status().isOk());
        verify(service).quitarEspecialidad(1,2,7);
    }
}

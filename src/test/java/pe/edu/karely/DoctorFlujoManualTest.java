package pe.edu.karely;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import pe.edu.karely.controller.DoctorController;
import pe.edu.karely.service.service.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DoctorFlujoManualTest {
    @Test void noApruebaDocumentosSinConfirmacionManual() throws Exception {
        var service=mock(DoctorService.class);
        var mvc=MockMvcBuilders.standaloneSetup(new DoctorController(service,mock(DocumentoDoctorService.class),mock(DisponibilidadService.class))).build();
        mvc.perform(post("/api/v1/doctores/1/validar-documentacion")
            .contentType("application/json").content("{}")
            .principal(new UsernamePasswordAuthenticationToken(7L,null)))
            .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
}

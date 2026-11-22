package pe.edu.karely;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import pe.edu.karely.controller.DoctorController;
import pe.edu.karely.service.service.*;

class DoctorFlujoManualTest {
    @Test
    void noApruebaDocumentosSinConfirmacionManual() throws Exception {
        var service = mock(DoctorService.class);
        var mvc =
                MockMvcBuilders.standaloneSetup(
                                new DoctorController(
                                        service,
                                        mock(DocumentoDoctorService.class),
                                        mock(DisponibilidadService.class)))
                        .build();
        mvc.perform(
                        post("/api/v1/doctores/1/validar-documentacion")
                                .contentType("application/json")
                                .content("{}")
                                .principal(new UsernamePasswordAuthenticationToken(7L, null)))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
}

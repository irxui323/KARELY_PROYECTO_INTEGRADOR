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

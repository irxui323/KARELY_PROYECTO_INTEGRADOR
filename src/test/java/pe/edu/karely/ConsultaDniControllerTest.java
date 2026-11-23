package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import pe.edu.karely.controller.catalogos.ConsultaDniController;
import pe.edu.karely.dto.catalogo.ConsultaDniResponseDTO;
import pe.edu.karely.service.service.catalogos.ConsultaDniService;

class ConsultaDniControllerTest {
    @Test
    void consultaDniDevuelveIdentidadParaAutocompletarFormulario() {
        var service = mock(ConsultaDniService.class);
        var auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(7L);
        when(service.consultar("45871236", 7L))
                .thenReturn(new ConsultaDniResponseDTO("45871236", "MARIA ELENA", "QUISPE", "HUAMAN"));

        var response = new ConsultaDniController(service).consultar("45871236", auth);

        assertEquals("MARIA ELENA", response.nombres());
        assertEquals("QUISPE", response.apellidoPaterno());
        assertEquals("HUAMAN", response.apellidoMaterno());
    }
}

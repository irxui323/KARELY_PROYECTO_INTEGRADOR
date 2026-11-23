package pe.edu.karely;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import pe.edu.karely.controller.atencion.AtencionMedicaController;
import pe.edu.karely.service.service.atencion.AtencionMedicaService;
import pe.edu.karely.exception.GlobalExceptionHandler;
import pe.edu.karely.dto.OperacionResponseDTO;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ReciboHttpTest {
    @Test
    void emiteSinNumeroManualYDescargaPdfProtegidoSinCache() throws Exception {
        var service=mock(AtencionMedicaService.class);
        when(service.emitirRecibo(eq(12L),any(),eq(7L)))
                .thenReturn(new OperacionResponseDTO("SP_EMITIR_RECIBO",20L,"Recibo emitido"));
        byte[] pdf="%PDF-1.7".getBytes(java.nio.charset.StandardCharsets.US_ASCII);
        when(service.descargarRecibo(12,7)).thenReturn(pdf);
        var mvc=MockMvcBuilders.standaloneSetup(new AtencionMedicaController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        var actor=new UsernamePasswordAuthenticationToken(7L,null);
        mvc.perform(post("/api/v1/atenciones/12/recibo").principal(actor)
                        .contentType("application/json").content("{}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(20));
        mvc.perform(get("/api/v1/atenciones/12/recibo/pdf").principal(actor))
                .andExpect(status().isOk()).andExpect(content().contentType("application/pdf"))
                .andExpect(content().bytes(pdf)).andExpect(header().string("Cache-Control","no-store"));
        mvc.perform(post("/api/v1/atenciones/12/entrega").principal(actor)
                        .contentType("application/json").content("{\"medioEntrega\":\"OTRO\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.validationErrors.medioEntrega").exists());
    }
}

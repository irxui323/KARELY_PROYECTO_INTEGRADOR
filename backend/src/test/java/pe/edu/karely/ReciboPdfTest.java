package pe.edu.karely;

import org.junit.jupiter.api.Test;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import pe.edu.karely.dto.atencion.ReciboResponseDTO;
import pe.edu.karely.service.impl.atencion.ReciboPdf;
import java.math.BigDecimal;
import java.time.*;
import java.nio.file.*;
import static org.junit.jupiter.api.Assertions.*;

class ReciboPdfTest {
    @Test
    void documentoIncluyeIdentidadLogoImporteYNumeroSinInformacionClinica() throws Exception {
        var recibo = new ReciboResponseDTO(1L,12L,"REC-0000000012",new BigDecimal("120.00"),
                LocalDateTime.of(2026,11,23,11,0),"José Paciente de prueba","12345678",
                "paciente@example.com","María Doctora de prueba","Medicina general",
                LocalDate.of(2026,11,23),"11:00","TRANSFERENCIA",null,null);
        var bytes = new ReciboPdf().generar(recibo);
        Files.createDirectories(Path.of("target","recibos"));
        Files.write(Path.of("target","recibos","recibo-muestra.pdf"),bytes);
        try(var doc=Loader.loadPDF(bytes)) {
            assertEquals(1,doc.getNumberOfPages());
            String text=new PDFTextStripper().getText(doc);
            for(String expected:new String[]{"REC-0000000012","José Paciente","María Doctora",
                    "Medicina general","120.00","TRANSFERENCIA","No es comprobante tributario"}) {
                assertTrue(text.contains(expected),expected);
            }
            assertFalse(text.contains("Diagnóstico"));
            assertFalse(text.contains("Medicamento"));
            assertTrue(doc.getPage(0).getResources().getXObjectNames().iterator().hasNext());
        }
    }
}

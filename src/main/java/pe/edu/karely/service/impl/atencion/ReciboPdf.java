package pe.edu.karely.service.impl.atencion;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import pe.edu.karely.dto.atencion.ReciboResponseDTO;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Component
public class ReciboPdf {
    private static final Color AZUL = new Color(0, 90, 139);
    private final PDType1Font regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private final PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

    public synchronized byte[] generar(ReciboResponseDTO recibo) {
        try (var doc = new PDDocument();
                var buffer = new ByteArrayOutputStream()) {
            var page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            try (var canvas = new PDPageContentStream(doc, page)) {
                var logo = new ClassPathResource("mail/logo-karely.png");
                canvas.drawImage(
                        PDImageXObject.createFromByteArray(
                                doc, logo.getContentAsByteArray(), "logo"),
                        48,
                        710,
                        80,
                        80);
                texto(canvas, "KARELY'S - CENTRO INTEGRAL", 145, 764, 17, true);
                texto(canvas, "Recibo de atención médica", 145, 737, 13, false);
                texto(canvas, "N.º " + recibo.numeroRecibo(), 48, 677, 13, true);
                texto(
                        canvas,
                        "Emitido: "
                                + recibo.fechaEmision()
                                        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                        48,
                        651,
                        10,
                        false);
                linea(canvas, 630);
                campo(canvas, "Paciente", recibo.paciente(), 604);
                campo(canvas, "Documento", recibo.documento(), 557);
                campo(canvas, "Doctor", recibo.doctor(), 510);
                campo(canvas, "Especialidad", recibo.especialidad(), 463);
                campo(
                        canvas,
                        "Fecha y hora de cita",
                        recibo.fechaCita().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                                + " - "
                                + recibo.horaInicio(),
                        416);
                linea(canvas, 370);
                texto(canvas, "CONCEPTO", 48, 346, 11, true);
                texto(canvas, "IMPORTE", 438, 346, 11, true);
                texto(canvas, "Consulta médica", 48, 314, 12, false);
                texto(canvas, "S/ " + recibo.monto().toPlainString(), 438, 314, 12, false);
                linea(canvas, 292);
                texto(canvas, "TOTAL PAGADO", 48, 264, 13, true);
                texto(canvas, "S/ " + recibo.monto().toPlainString(), 438, 264, 13, true);
                campo(canvas, "Método de pago", recibo.metodoPago(), 220);
                texto(canvas, "Gracias por confiar en Karely's.", 48, 123, 11, false);
                texto(canvas, "Documento interno. No es comprobante tributario.", 48, 96, 9, false);
            }
            doc.save(buffer);
            return buffer.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo generar el PDF del recibo", ex);
        }
    }

    private void campo(PDPageContentStream canvas, String label, String value, float y)
            throws IOException {
        texto(canvas, label, 48, y, 10, true);
        texto(canvas, value, 48, y - 18, 11, false);
    }

    private void linea(PDPageContentStream canvas, float y) throws IOException {
        canvas.setStrokingColor(new Color(202, 221, 232));
        canvas.moveTo(48, y);
        canvas.lineTo(547, y);
        canvas.stroke();
    }

    private void texto(
            PDPageContentStream canvas, String value, float x, float y, float size, boolean strong)
            throws IOException {
        StringBuilder safe = new StringBuilder();
        var font = strong ? bold : regular;
        for (int cp : String.valueOf(value).replaceAll("[\\r\\n\\t]", " ").codePoints().toArray()) {
            String ch = new String(Character.toChars(cp));
            try {
                font.encode(ch);
                safe.append(ch);
            } catch (IllegalArgumentException ex) {
                safe.append('?');
            }
        }
        String text = safe.toString();
        while (font.getStringWidth(text) / 1000 * size > 499 && size > 7) size -= 0.5f;
        canvas.setNonStrokingColor(AZUL);
        canvas.beginText();
        canvas.setFont(font, size);
        canvas.newLineAtOffset(x, y);
        canvas.showText(text);
        canvas.endText();
    }
}

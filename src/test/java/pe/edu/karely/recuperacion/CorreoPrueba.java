package pe.edu.karely.recuperacion;

import static org.mockito.Mockito.*;

import jakarta.mail.*;
import jakarta.mail.internet.MimeMessage;

import org.springframework.mail.javamail.JavaMailSender;

import java.util.*;

final class CorreoPrueba {
    static void preparar(JavaMailSender sender) {
        when(sender.createMimeMessage())
                .thenAnswer(i -> new MimeMessage(Session.getInstance(new Properties())));
    }

    static List<Part> partes(Part message) throws Exception {
        List<Part> result = new ArrayList<>();
        if (message.isMimeType("multipart/*")) {
            Multipart multipart = (Multipart) message.getContent();
            for (int i = 0; i < multipart.getCount(); i++)
                result.addAll(partes(multipart.getBodyPart(i)));
        } else result.add(message);
        return result;
    }

    static String contenido(Part message, String mime) throws Exception {
        for (Part part : partes(message))
            if (part.isMimeType(mime)) return (String) part.getContent();
        throw new IllegalStateException("Falta parte " + mime);
    }

    static String token(MimeMessage message) throws Exception {
        message.saveChanges();
        var matcher =
                java.util.regex.Pattern.compile("#token=([A-Za-z0-9_-]{43})")
                        .matcher(contenido(message, "text/plain"));
        if (!matcher.find()) throw new IllegalStateException("Falta enlace de recuperacion");
        return matcher.group(1);
    }
}

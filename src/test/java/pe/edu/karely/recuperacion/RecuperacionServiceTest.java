package pe.edu.karely.recuperacion;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.karely.dto.auth.*;
import pe.edu.karely.entity.*;
import pe.edu.karely.repository.TokenRecuperacionRepository;
import pe.edu.karely.service.impl.RecuperacionServiceImpl;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.*;
import java.util.*;

class RecuperacionServiceTest {
    TokenRecuperacionRepository repo;
    JavaMailSender mail;
    RecuperacionServiceImpl service;
    Usuario user;
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);
    Instant instant = Instant.parse("2026-11-22T12:00:00Z");
    TokenRecuperacion issued;
    String raw;
    Clock clock;

    @BeforeEach
    void setup() throws Exception {
        repo = mock(TokenRecuperacionRepository.class);
        mail = mock(JavaMailSender.class);
        CorreoPrueba.preparar(mail);
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(mail);
        PlatformTransactionManager tx = mock(PlatformTransactionManager.class);
        when(tx.getTransaction(any())).thenAnswer(i -> new SimpleTransactionStatus());
        clock = mock(Clock.class);
        when(clock.instant()).thenReturn(instant);
        when(clock.millis()).thenReturn(instant.toEpochMilli());
        service =
                new RecuperacionServiceImpl(
                        repo,
                        encoder,
                        provider,
                        tx,
                        clock,
                        true,
                        "http://localhost:4200/restablecer-password",
                        15,
                        "test@example.org",
                        "smtp.example.org");
        user = new Usuario();
        var id = Usuario.class.getDeclaredField("idUsuario");
        id.setAccessible(true);
        id.set(user, 7L);
        user.setCorreo("test@example.org");
        user.setPasswordHash(encoder.encode("OriginalPassword1"));
        user.setIntentosFallidos(0);
        user.setRol(new Rol());
        when(repo.bloquearUsuarioPorCorreo(anyString())).thenReturn(Optional.of(user));
        when(repo.bloquearUsuario(7L)).thenReturn(Optional.of(user));
        doAnswer(
                        i -> {
                            issued = i.getArgument(0);
                            return null;
                        })
                .when(repo)
                .guardar(any());
        doAnswer(
                        i -> {
                            MimeMessage msg = i.getArgument(0);
                            raw = CorreoPrueba.token(msg);
                            return null;
                        })
                .when(mail)
                .send(any(MimeMessage.class));
    }

    void issue() {
        service.solicitar(new RecuperacionRequestDTO("test@example.org"), "127.0.0.1");
        when(repo.buscarUsuarioId(anyString())).thenReturn(Optional.of(7L));
        when(repo.bloquearToken(anyString())).thenAnswer(i -> Optional.ofNullable(issued));
    }

    RestablecerPasswordRequestDTO reset(String password, String confirmation) {
        return new RestablecerPasswordRequestDTO(raw, password, confirmation);
    }

    @Test
    void enviaCorreoHtmlConLogoIncrustadoYBotonDeRestablecimiento() throws Exception {
        user.setUsername("ana");
        when(mail.createMimeMessage())
                .thenAnswer(
                        i -> new MimeMessage(jakarta.mail.Session.getInstance(new Properties())));
        issue();
        var mensaje = org.mockito.ArgumentCaptor.forClass(MimeMessage.class);
        verify(mail).send(mensaje.capture());
        assertTrue(mensaje.getValue().isMimeType("multipart/*"));
        var bytes = new java.io.ByteArrayOutputStream();
        mensaje.getValue().writeTo(bytes);
        var recibido =
                new MimeMessage(
                        jakarta.mail.Session.getInstance(new Properties()),
                        new java.io.ByteArrayInputStream(bytes.toByteArray()));
        String html = CorreoPrueba.contenido(recibido, "text/html");
        String texto = CorreoPrueba.contenido(recibido, "text/plain");
        String enlace = "http://localhost:4200/restablecer-password#token=" + raw;
        assertTrue(html.contains("Hola, ana"));
        assertTrue(html.contains("Restablecer mi contraseña"));
        assertTrue(html.contains("href=\"" + enlace + "\""));
        assertTrue(texto.contains(enlace));
        assertTrue(html.contains("cid:karely-logo"));
        assertFalse(html.contains("cid:karely-candado"));
        assertTrue(html.contains("#006aa6"));
        assertTrue(html.contains("<strong>15 minutos</strong>"));
        assertTrue(texto.contains("15 minutos"));
        assertFalse(html.contains("{{"));
        boolean logo = false;
        for (var parte : CorreoPrueba.partes(recibido)) {
            String[] ids = parte.getHeader("Content-ID");
            if (ids == null) continue;
            assertEquals("inline", parte.getDisposition());
            assertTrue(parte.isMimeType("image/png"));
            if (java.util.List.of(ids).contains("<karely-logo>")) {
                assertArrayEquals(
                        new org.springframework.core.io.ClassPathResource("mail/logo-karely.png")
                                .getContentAsByteArray(),
                        parte.getInputStream().readAllBytes());
                logo = true;
            }
            assertFalse(java.util.List.of(ids).contains("<karely-candado>"));
        }
        assertTrue(logo);
    }

    @Test
    void escapaElSaludoParaNoInsertarHtmlDesdeElUsuario() throws Exception {
        user.setUsername("<img src=x onerror=alert(1)>&Ana");
        issue();
        var mensaje = org.mockito.ArgumentCaptor.forClass(MimeMessage.class);
        verify(mail).send(mensaje.capture());
        String html = CorreoPrueba.contenido(mensaje.getValue(), "text/html");
        assertFalse(html.contains("<img src=x"));
        assertTrue(html.contains("&lt;img src=x onerror=alert(1)&gt;&amp;Ana"));
    }

    @Test
    void tokenAleatorioSoloSePersisteComoHash() throws Exception {
        issue();
        assertEquals(32, Base64.getUrlDecoder().decode(raw).length);
        assertNotEquals(raw, issued.getTokenHash());
        assertEquals(
                HexFormat.of()
                        .formatHex(
                                MessageDigest.getInstance("SHA-256")
                                        .digest(raw.getBytes(StandardCharsets.UTF_8))),
                issued.getTokenHash());
        assertEquals(
                LocalDateTime.ofInstant(instant.plusSeconds(900), ZoneOffset.UTC),
                issued.getFechaExpiracion());
    }

    @Test
    void restablecerCambiaHashRevocaSesionesYConsumoImpideReuso() {
        issue();
        service.restablecer(reset("NewPassword123", "NewPassword123"));
        assertTrue(encoder.matches("NewPassword123", user.getPasswordHash()));
        verify(repo).revocarSesiones(eq(7L), any());
        assertNotNull(issued.getFechaUso());
        assertThrows(
                ResponseStatusException.class,
                () -> service.restablecer(reset("OtherPassword123", "OtherPassword123")));
    }

    @Test
    void tokenVencidoNoCambiaClave() {
        issue();
        issued.setFechaExpiracion(LocalDateTime.ofInstant(instant, ZoneOffset.UTC));
        assertThrows(
                ResponseStatusException.class,
                () -> service.restablecer(reset("NewPassword123", "NewPassword123")));
        verify(repo, never()).revocarSesiones(anyLong(), any());
    }

    @Test
    void confirmacionDistintaNoConsumeToken() {
        issue();
        assertThrows(
                ResponseStatusException.class,
                () -> service.restablecer(reset("NewPassword123", "Mismatch12345")));
        assertNull(issued.getFechaUso());
    }

    @Test
    void correoInexistenteNoEnvia() {
        when(repo.bloquearUsuarioPorCorreo(anyString())).thenReturn(Optional.empty());
        service.solicitar(new RecuperacionRequestDTO("unknown@example.org"), "127.0.0.1");
        verify(mail, never()).send(any(MimeMessage.class));
    }

    @Test
    void falloSmtpInvalidaSoloTokenEmitido() {
        doThrow(new MailSendException("fallo")).when(mail).send(any(MimeMessage.class));
        service.solicitar(new RecuperacionRequestDTO("test@example.org"), "127.0.0.1");
        verify(repo).invalidarToken(eq(issued.getTokenHash()), any());
    }

    @Test
    void cambioCorreoOHashInvalidaEnlace() {
        issue();
        user.setCorreo("new@example.org");
        assertThrows(
                ResponseStatusException.class,
                () -> service.restablecer(reset("NewPassword123", "NewPassword123")));
    }

    @Test
    void claveAnteriorSeRechaza() {
        issue();
        assertThrows(
                ResponseStatusException.class,
                () -> service.restablecer(reset("OriginalPassword1", "OriginalPassword1")));
    }

    @Test
    void cuentaInactivaYBloqueoManualNoEmiten() {
        user.setEstado("INACTIVO");
        service.solicitar(new RecuperacionRequestDTO("test@example.org"), "ip1");
        user.setEstado("BLOQUEADO");
        service.solicitar(new RecuperacionRequestDTO("test@example.org"), "ip2");
        verify(mail, never()).send(any(MimeMessage.class));
    }

    @Test
    void rolInactivoNoPermiteRestablecer() {
        issue();
        user.getRol().setEstado("INACTIVO");
        assertThrows(
                ResponseStatusException.class,
                () -> service.restablecer(reset("NewPassword123", "NewPassword123")));
    }

    @Test
    void limiteCorreoBloqueaCuartaSolicitud() {
        for (int i = 0; i < 4; i++)
            service.solicitar(new RecuperacionRequestDTO("test@example.org"), "ip" + i);
        verify(mail, times(3)).send(any(MimeMessage.class));
    }

    @Test
    void limiteCorreoExpiraSinBloquearNuevaSolicitud() {
        for (int i = 0; i < 4; i++)
            service.solicitar(new RecuperacionRequestDTO("test@example.org"), "ip" + i);
        when(clock.instant()).thenReturn(instant.plusSeconds(901));
        when(clock.millis()).thenReturn(instant.plusSeconds(901).toEpochMilli());
        service.solicitar(new RecuperacionRequestDTO("test@example.org"), "ip0");
        verify(mail, times(4)).send(any(MimeMessage.class));
    }
}

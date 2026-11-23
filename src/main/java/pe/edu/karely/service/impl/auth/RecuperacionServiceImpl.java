package pe.edu.karely.service.impl.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.HtmlUtils;

import pe.edu.karely.dto.auth.*;
import pe.edu.karely.entity.*;
import pe.edu.karely.repository.auth.TokenRecuperacionRepository;
import pe.edu.karely.service.service.auth.RecuperacionService;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;

@Service
public class RecuperacionServiceImpl implements RecuperacionService {
    private static final Logger LOG = LoggerFactory.getLogger(RecuperacionServiceImpl.class);
    private final TokenRecuperacionRepository repo;
    private final PasswordEncoder encoder;
    private final ObjectProvider<JavaMailSender> mailProvider;
    private final TransactionTemplate tx;
    private final Clock clock;
    private final boolean enabled;
    private final String baseUrl;
    private final long expirationMinutes;
    private final String from;
    private final String mailHost;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, Window> limits = new HashMap<>();

    private record Window(long until, int count) {}

    private record Delivery(String hash, String raw, String correo, Long userId, String username) {}

    public RecuperacionServiceImpl(
            TokenRecuperacionRepository repo,
            PasswordEncoder encoder,
            ObjectProvider<JavaMailSender> mailProvider,
            PlatformTransactionManager manager,
            Clock clock,
            @Value("${app.recovery.enabled:false}") boolean enabled,
            @Value("${app.recovery.base-url:http://localhost:4200/restablecer-password}")
                    String baseUrl,
            @Value("${app.recovery.expiration-minutes:15}") long expirationMinutes,
            @Value("${app.recovery.from:${app.mail.from:}}") String from,
            @Value("${spring.mail.host:}") String mailHost) {
        this.repo = repo;
        this.encoder = encoder;
        this.mailProvider = mailProvider;
        this.tx = new TransactionTemplate(manager);
        this.clock = clock;
        this.enabled = enabled;
        this.baseUrl = baseUrl;
        this.expirationMinutes = Math.max(1, Math.min(15, expirationMinutes));
        this.from = from;
        this.mailHost = mailHost;
        URI uri = URI.create(baseUrl);
        boolean local =
                "localhost".equalsIgnoreCase(uri.getHost()) || "127.0.0.1".equals(uri.getHost());
        if (uri.getHost() == null
                || uri.getUserInfo() != null
                || uri.getFragment() != null
                || uri.getQuery() != null
                || !("https".equalsIgnoreCase(uri.getScheme())
                        || (local && "http".equalsIgnoreCase(uri.getScheme()))))
            throw new IllegalArgumentException("URL de recuperaciÃ³n no confiable");
    }

    @Override
    @Async("recuperacionExecutor")
    public void solicitar(RecuperacionRequestDTO request, String ip) {
        if (!enabled
                || mailHost == null
                || mailHost.isBlank()
                || from == null
                || from.isBlank()
                || request == null
                || request.correo() == null) return;
        String correo = request.correo().trim().toLowerCase(Locale.ROOT);
        if (correo.length() > 150
                || !admit("ip:" + String.valueOf(ip), 10)
                || !admit("email:" + sha256(correo), 3)) return;
        try {
            JavaMailSender sender = mailProvider.getIfAvailable();
            if (sender == null) return;
            Delivery delivery =
                    tx.execute(
                            status -> {
                                Usuario user = repo.bloquearUsuarioPorCorreo(correo).orElse(null);
                                if (!eligible(user)) return null;
                                byte[] bytes = new byte[32];
                                random.nextBytes(bytes);
                                String raw =
                                        Base64.getUrlEncoder()
                                                .withoutPadding()
                                                .encodeToString(bytes);
                                LocalDateTime now = now();
                                repo.invalidarTokens(user.getIdUsuario(), now);
                                TokenRecuperacion token = new TokenRecuperacion();
                                token.setTokenHash(sha256(raw));
                                token.setIdUsuario(user.getIdUsuario());
                                token.setCorreo(user.getCorreo());
                                token.setVersionCredencial(sha256(user.getPasswordHash()));
                                token.setFechaCreacion(now);
                                token.setFechaExpiracion(now.plusMinutes(expirationMinutes));
                                repo.guardar(token);
                                return new Delivery(
                                        token.getTokenHash(),
                                        raw,
                                        user.getCorreo(),
                                        user.getIdUsuario(),
                                        user.getUsername());
                            });
            if (delivery == null) return;
            try {
                enviarCorreo(sender, delivery);
            } catch (jakarta.mail.MessagingException | java.io.IOException | RuntimeException ex) {
                tx.executeWithoutResult(
                        status -> {
                            repo.bloquearUsuario(delivery.userId());
                            repo.invalidarToken(delivery.hash(), now());
                        });
                if (ex instanceof org.springframework.mail.MailAuthenticationException)
                    LOG.warn(
                            "El servidor SMTP rechazÃ³ la autenticaciÃ³n. Revisa la contraseÃ±a de"
                                + " aplicaciÃ³n del remitente");
                else
                    LOG.warn(
                            "No se pudo enviar un correo de recuperaciÃ³n. Comprueba conexiÃ³n y"
                                + " configuraciÃ³n SMTP");
            }
        } catch (RuntimeException ex) {
            LOG.warn("No se pudo procesar una solicitud de recuperaciÃ³n");
        }
    }

    private void enviarCorreo(JavaMailSender sender, Delivery delivery)
            throws jakarta.mail.MessagingException, java.io.IOException {
        String enlace = baseUrl + "#token=" + delivery.raw();
        String saludo =
                delivery.username() == null || delivery.username().isBlank()
                        ? "Hola"
                        : "Hola, " + delivery.username();
        String texto =
                saludo
                        + "\n\n"
                        + "Recibimos una solicitud para restablecer la contraseÃ±a de tu cuenta de"
                        + " Karely.\n\n"
                        + "Abre este enlace para elegir una nueva contraseÃ±a:\n"
                        + enlace
                        + "\n\n"
                        + "El enlace vence en "
                        + expirationMinutes
                        + " minutos y solo se puede utilizar una vez.\n"
                        + "Si no solicitaste este cambio, ignora este correo. Tu contraseÃ±a seguirÃ¡"
                        + " siendo la misma.\n\n"
                        + "Karelyâ€™s Â· Centro Integral";
        String html =
                new ClassPathResource("mail/recuperacion.html")
                        .getContentAsString(StandardCharsets.UTF_8)
                        .replace("{{SALUDO}}", HtmlUtils.htmlEscape(saludo, "UTF-8"))
                        .replace("{{MINUTOS}}", Long.toString(expirationMinutes))
                        .replace("{{ENLACE}}", HtmlUtils.htmlEscape(enlace, "UTF-8"));
        var message = sender.createMimeMessage();
        var helper =
                new MimeMessageHelper(
                        message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");
        helper.setFrom(
                new jakarta.mail.internet.InternetAddress(
                        from, "Karelyâ€™s Centro Integral", "UTF-8"));
        helper.setTo(delivery.correo());
        helper.setSubject("Restablecer contraseÃ±a de Karely");
        helper.setText(texto, html);
        helper.addInline("karely-logo", new ClassPathResource("mail/logo-karely.png"), "image/png");
        sender.send(message);
    }

    @Override
    public MensajeResponseDTO restablecer(RestablecerPasswordRequestDTO request) {
        if (!enabled
                || request == null
                || request.token() == null
                || !request.token().matches("[A-Za-z0-9_-]{43}")
                || request.password() == null
                || request.password().length() < 12
                || request.password().length() > 72
                || request.password().getBytes(StandardCharsets.UTF_8).length > 72
                || !request.password().equals(request.confirmacionPassword())) throw invalid();
        return tx.execute(
                status -> {
                    String hash = sha256(request.token());
                    Long userId = repo.buscarUsuarioId(hash).orElseThrow(this::invalid);
                    Usuario user = repo.bloquearUsuario(userId).orElseThrow(this::invalid);
                    TokenRecuperacion token = repo.bloquearToken(hash).orElseThrow(this::invalid);
                    LocalDateTime now = now();
                    if (!eligible(user)
                            || !userId.equals(token.getIdUsuario())
                            || token.getFechaUso() != null
                            || !token.getFechaExpiracion().isAfter(now)
                            || !Objects.equals(token.getCorreo(), user.getCorreo())
                            || !sha256(user.getPasswordHash()).equals(token.getVersionCredencial())
                            || encoder.matches(request.password(), user.getPasswordHash()))
                        throw invalid();
                    user.setPasswordHash(encoder.encode(request.password()));
                    user.setIntentosFallidos(0);
                    user.setEstado("ACTIVO");
                    token.setFechaUso(now);
                    repo.invalidarTokens(userId, now);
                    repo.revocarSesiones(userId, now);
                    repo.registrarRestablecimiento(user, now);
                    return new MensajeResponseDTO(
                            "ContraseÃ±a restablecida. Inicia sesiÃ³n con tu nueva contraseÃ±a");
                });
    }

    private boolean eligible(Usuario user) {
        return user != null
                && user.getRol() != null
                && "ACTIVO".equals(user.getRol().getEstado())
                && ("ACTIVO".equals(user.getEstado())
                        || ("BLOQUEADO".equals(user.getEstado())
                                && user.getIntentosFallidos() != null
                                && user.getIntentosFallidos() >= 5));
    }

    private synchronized boolean admit(String key, int maximum) {
        long now = clock.millis();
        limits.entrySet().removeIf(entry -> entry.getValue().until() <= now);
        Window old = limits.get(key);
        if (old == null) {
            if (limits.size() >= 10000) return false;
            limits.put(key, new Window(now + 900000, 1));
            return true;
        }
        if (old.count() >= maximum) return false;
        limits.put(key, new Window(old.until(), old.count() + 1));
        return true;
    }

    private LocalDateTime now() {
        return LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
    }

    private ResponseStatusException invalid() {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "El enlace o los datos de recuperaciÃ³n no son vÃ¡lidos");
    }

    private static String sha256(String value) {
        try {
            return HexFormat.of()
                    .formatHex(
                            MessageDigest.getInstance("SHA-256")
                                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }
}

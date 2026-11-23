package pe.edu.karely.service.impl.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import pe.edu.karely.dto.administracion.NotificacionEnvioDTO;
import pe.edu.karely.repository.administracion.NotificacionRepository;

@Component
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true")
public class MailQueueWorker {
    private static final Logger LOG = LoggerFactory.getLogger(MailQueueWorker.class);

    private final NotificacionRepository repo;
    private final JavaMailSender mail;
    private final TransactionTemplate tx;
    private final long operator;
    private final String from;

    public MailQueueWorker(
            NotificacionRepository repo,
            JavaMailSender mail,
            PlatformTransactionManager tm,
            @Value("${app.mail.operator-id:0}") long operator,
            @Value("${app.mail.from:}") String from) {
        if (operator < 1 || from.isBlank()) {
            throw new IllegalArgumentException(
                    "Configurar APP_MAIL_OPERATOR_ID (administradora activa) y APP_MAIL_FROM para"
                        + " activar SMTP");
        }
        this.repo = repo;
        this.mail = mail;
        this.tx = new TransactionTemplate(tm);
        this.operator = operator;
        this.from = from;
    }

    @Scheduled(fixedDelayString = "${app.mail.poll-ms:30000}")
    public void run() {
        NotificacionEnvioDTO job;
        try {
            job = tx.execute(status -> repo.reclamar(operator));
        } catch (Exception ex) {
            LOG.error("No se pudo reclamar una notificaciÃ³n", ex);
            return;
        }
        if (job == null || job.idNotificacion() == null) {
            return;
        }

        String success = "N";
        String error = null;
        try {
            var message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(job.destinatario());
            message.setSubject("Karely's - " + job.tipo().replace('_', ' '));
            message.setText(
                    "Su notificaciÃ³n del centro mÃ©dico Karely's estÃ¡ registrada. Referencia: "
                            + job.codigoEvento()
                            + ". Si no solicitÃ³ esta operaciÃ³n, contacte a administraciÃ³n.\n\n"
                            + "No responda a este correo.");
            mail.send(message);
            success = "S";
        } catch (Exception ex) {
            error = ex.getClass().getSimpleName();
            LOG.warn("FallÃ³ el envÃ­o del evento {}", job.codigoEvento());
        }

        String succeeded = success;
        String detail = error;
        try {
            tx.executeWithoutResult(
                    status ->
                            repo.registrarResultado(
                                    operator,
                                    job.idNotificacion(),
                                    job.intento(),
                                    succeeded,
                                    detail));
        } catch (Exception ex) {
            LOG.error("No se pudo registrar resultado del envÃ­o {}", job.codigoEvento(), ex);
        }
    }
}

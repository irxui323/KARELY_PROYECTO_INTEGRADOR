package pe.edu.karely.service.impl.atencion;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.atencion.AtencionResponseDTO;
import pe.edu.karely.dto.atencion.DiagnosticoRequestDTO;
import pe.edu.karely.dto.atencion.DetalleAtencionResponseDTO;
import pe.edu.karely.dto.atencion.EntregaReciboRequestDTO;
import pe.edu.karely.dto.atencion.MedicamentoRequestDTO;
import pe.edu.karely.dto.atencion.RecetaRequestDTO;
import pe.edu.karely.dto.atencion.ReciboRequestDTO;
import pe.edu.karely.dto.atencion.ReciboResponseDTO;
import pe.edu.karely.exception.RecursoNoEncontradoException;
import pe.edu.karely.exception.ReglaNegocioException;
import pe.edu.karely.repository.atencion.AtencionMedicaRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.atencion.AtencionMedicaService;

import java.util.List;

@Service
public class AtencionMedicaServiceImpl implements AtencionMedicaService {
    private final AtencionMedicaRepository repository;
    private final PermisosUsuario permisos;
    private final ReciboPdf reciboPdf;
    private final ObjectProvider<JavaMailSender> mail;
    private final String remitente;

    public AtencionMedicaServiceImpl(
            AtencionMedicaRepository repository,
            PermisosUsuario permisos,
            ReciboPdf reciboPdf,
            ObjectProvider<JavaMailSender> mail,
            @Value("${app.recovery.from:${app.mail.from:}}") String remitente) {
        this.repository = repository;
        this.permisos = permisos;
        this.reciboPdf = reciboPdf;
        this.mail = mail;
        this.remitente = remitente;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AtencionResponseDTO> listarAtenciones(long actor) {
        String rol = permisos.rol(actor);
        permisos.exigir(actor, "DOCTOR", "ADMINISTRADORA");
        return rol.equals("DOCTOR")
                ? repository.listarAtencionesDelMedico(actor)
                : repository.listarAtencionesGeneral();
    }

    @Override
    @Transactional(readOnly = true)
    public DetalleAtencionResponseDTO consultarDetalle(long idCita, long actor) {
        String rol = permisos.rol(actor);
        permisos.exigir(actor, "DOCTOR", "ADMINISTRADORA", "RECEPCIONISTA");
        var detalle = repository.buscarDetalleCerrada(idCita, actor, rol);
        if (detalle == null)
            throw new RecursoNoEncontradoException("Atención atendida no encontrada o sin acceso");
        return detalle;
    }

    @Override
    @Transactional
    public OperacionResponseDTO iniciarAtencion(long idCita, long actor) {
        permisos.exigir(actor, "DOCTOR", "ADMINISTRADORA");
        return OperacionResponseDTO.resultado(
                "SP_INICIAR_ATENCION", repository.iniciarAtencion(actor, actor, idCita));
    }

    @Override
    @Transactional
    public OperacionResponseDTO registrarDiagnostico(
            long idCita, DiagnosticoRequestDTO i, long actor) {
        permisos.exigir(actor, "DOCTOR", "ADMINISTRADORA");
        repository.registrarDiagnostico(actor, actor, idCita, i.diagnostico(), i.observaciones());
        return OperacionResponseDTO.resultado("SP_REGISTRAR_DIAGNOSTICO", null);
    }

    @Override
    @Transactional
    public OperacionResponseDTO registrarReceta(long idCita, RecetaRequestDTO i, long actor) {
        permisos.exigir(actor, "DOCTOR", "ADMINISTRADORA");
        return OperacionResponseDTO.resultado(
                "SP_CREAR_RECETA",
                repository.registrarReceta(actor, actor, idCita, i.indicaciones()));
    }

    @Override
    @Transactional
    public OperacionResponseDTO agregarMedicamento(
            long idReceta, MedicamentoRequestDTO i, long actor) {
        permisos.exigir(actor, "DOCTOR", "ADMINISTRADORA");
        return OperacionResponseDTO.resultado(
                "SP_AGREGAR_MEDICAMENTO",
                repository.agregarMedicamento(
                        actor,
                        actor,
                        idReceta,
                        i.medicamento(),
                        i.dosis(),
                        i.frecuencia(),
                        i.duracion(),
                        i.observaciones()));
    }

    @Override
    @Transactional
    public OperacionResponseDTO emitirRecibo(long idCita, ReciboRequestDTO i, long actor) {
        autorizarRecibo(idCita, actor);
        var recibo = repository.buscarRecibo(idCita);
        if (recibo == null) {
            String numero = "REC-" + String.format(java.util.Locale.ROOT, "%010d", idCita);
            repository.emitirRecibo(actor, actor, idCita, numero);
            recibo = repository.buscarRecibo(idCita);
        }
        if (recibo == null)
            throw new ReglaNegocioException("No se pudo recuperar el recibo emitido");
        asegurarPdf(recibo);
        return new OperacionResponseDTO(
                "SP_EMITIR_RECIBO",
                recibo.idRecibo(),
                "Recibo " + recibo.numeroRecibo() + " emitido. PDF disponible para descargar.");
    }

    @Override
    @Transactional
    public OperacionResponseDTO entregarRecibo(long idCita, EntregaReciboRequestDTO i, long actor) {
        autorizarRecibo(idCita, actor);
        var recibo = exigirRecibo(idCita);
        if (recibo.fechaEntrega() != null)
            return new OperacionResponseDTO(
                    "SP_ENTREGAR_RECIBO",
                    recibo.idRecibo(),
                    "La entrega del recibo ya está registrada.");
        if (!"EMAIL".equals(i.medioEntrega()) && !"PRESENCIAL".equals(i.medioEntrega()))
            throw new ReglaNegocioException("Selecciona correo electrónico o entrega impresa");
        byte[] pdf = asegurarPdf(recibo);
        JavaMailSender sender = null;
        if ("EMAIL".equals(i.medioEntrega())) {
            if (recibo.correo() == null || recibo.correo().isBlank())
                throw new ReglaNegocioException(
                        "El paciente no tiene correo registrado. Actualiza sus datos o elige"
                            + " entrega impresa.");
            sender = mail.getIfAvailable();
            if (sender == null || remitente.isBlank())
                throw new ReglaNegocioException(
                        "El envío de recibos no está configurado. Configura el correo remitente.");
        }
        repository.entregarRecibo(actor, actor, idCita, i.medioEntrega());
        if (sender != null) {
            try {
                var message = sender.createMimeMessage();
                var helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(
                        new jakarta.mail.internet.InternetAddress(
                                remitente, "Karely's Centro Integral", "UTF-8"));
                helper.setTo(recibo.correo());
                helper.setSubject("Tu recibo de atención - " + recibo.numeroRecibo());
                helper.setText(
                        "Adjuntamos el recibo de tu atención en Karely's. Gracias por tu"
                            + " confianza.\n\nDoctor: " + recibo.doctor()
                            + "\nEspecialidad: " + recibo.especialidad());
                helper.addAttachment(
                        recibo.numeroRecibo() + ".pdf",
                        new ByteArrayResource(pdf),
                        "application/pdf");
                sender.send(message);
                repository.guardarCorreoRecibo(idCita, recibo.correo());
            } catch (Exception ex) {
                throw new ReglaNegocioException(
                        "No se pudo enviar el recibo. La entrega no fue confirmada; vuelve a"
                            + " intentar.");
            }
        }
        return new OperacionResponseDTO(
                "SP_ENTREGAR_RECIBO",
                recibo.idRecibo(),
                sender != null
                        ? "Recibo enviado al correo del paciente."
                        : "Entrega impresa del recibo registrada.");
    }

    @Override
    @Transactional
    public ReciboResponseDTO consultarRecibo(long idCita, long actor) {
        autorizarRecibo(idCita, actor);
        return repository.buscarRecibo(idCita);
    }

    @Override
    @Transactional
    public byte[] descargarRecibo(long idCita, long actor) {
        autorizarRecibo(idCita, actor);
        return asegurarPdf(exigirRecibo(idCita));
    }

    private void autorizarRecibo(long idCita, long actor) {
        permisos.exigir(actor, "DOCTOR", "ADMINISTRADORA");
        if (repository.bloquearCitaParaRecibo(idCita, actor, permisos.rol(actor)) == null)
            throw new RecursoNoEncontradoException("Cita no encontrada o sin acceso a este recibo");
    }

    private ReciboResponseDTO exigirRecibo(long idCita) {
        var recibo = repository.buscarRecibo(idCita);
        if (recibo == null)
            throw new RecursoNoEncontradoException("Primero emite el recibo de esta atención");
        return recibo;
    }

    private byte[] asegurarPdf(ReciboResponseDTO recibo) {
        byte[] pdf = repository.buscarPdf(recibo.idCita());
        if (pdf == null || pdf.length == 0) {
            pdf = reciboPdf.generar(recibo);
            repository.guardarPdf(recibo.idCita(), pdf);
        }
        return pdf;
    }

    @Override
    @Transactional
    public OperacionResponseDTO cerrarAtencion(long idCita, long actor) {
        permisos.exigir(actor, "DOCTOR", "ADMINISTRADORA");
        repository.cerrarAtencion(actor, actor, idCita);
        return OperacionResponseDTO.resultado("SP_CERRAR_ATENCION", null);
    }
}

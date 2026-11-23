package pe.edu.karely;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import pe.edu.karely.dto.atencion.*;
import pe.edu.karely.exception.*;
import pe.edu.karely.repository.atencion.AtencionMedicaRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.impl.atencion.*;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.Multipart;
import java.math.BigDecimal;
import java.time.*;
import java.util.Properties;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReciboFlujoTest {
    private final AtencionMedicaRepository repo = mock(AtencionMedicaRepository.class);
    private final PermisosUsuario permisos = mock(PermisosUsuario.class);
    private final ReciboPdf pdf = mock(ReciboPdf.class);
    private final JavaMailSender mail = mock(JavaMailSender.class);
    private AtencionMedicaServiceImpl service;
    private final byte[] archivo = "%PDF-recibo".getBytes(java.nio.charset.StandardCharsets.US_ASCII);

    @BeforeEach
    void preparar() {
        var beans = new StaticListableBeanFactory();
        beans.addBean("mail", mail);
        service = new AtencionMedicaServiceImpl(repo, permisos, pdf,
                beans.getBeanProvider(JavaMailSender.class), "centro@example.com");
        when(permisos.rol(7)).thenReturn("DOCTOR");
        when(repo.bloquearCitaParaRecibo(12, 7, "DOCTOR"))
                .thenReturn(new AtencionMedicaRepository.CitaRecibo(12L));
        when(repo.buscarRecibo(12)).thenReturn(recibo("paciente@example.com", null));
        when(repo.buscarPdf(12)).thenReturn(archivo);
    }

    private ReciboResponseDTO recibo(String correo, LocalDateTime entrega) {
        return new ReciboResponseDTO(20L,12L,"REC-0000000012", new BigDecimal("120.00"),
                LocalDateTime.of(2026,11,23,11,0),"Paciente de prueba","12345678",correo,
                "Doctor de prueba","Medicina general",LocalDate.of(2026,11,23),"11:00",
                "TRANSFERENCIA",entrega,entrega == null ? null : "EMAIL");
    }

    @Test
    void emisionAutomaticaIgnoraNumeroDelClienteYConservaPdf() {
        var registro = recibo("paciente@example.com",null);
        when(repo.buscarRecibo(12)).thenReturn(null, registro);
        when(repo.buscarPdf(12)).thenReturn(null);
        when(pdf.generar(registro)).thenReturn(archivo);
        var result = service.emitirRecibo(12,new ReciboRequestDTO("MANUAL"),7);
        assertEquals(20L,result.id());
        assertTrue(result.mensaje().contains("REC-0000000012"));
        verify(repo).emitirRecibo(7,7,12L,"REC-0000000012");
        verify(repo).guardarPdf(12,archivo);
    }

    @Test
    void reemitirNoDuplicaNiRegeneraPdf() {
        service.emitirRecibo(12,null,7);
        service.emitirRecibo(12,null,7);
        verify(repo,never()).emitirRecibo(anyLong(),anyLong(),anyLong(),anyString());
        verifyNoInteractions(pdf);
        assertArrayEquals(archivo,service.descargarRecibo(12,7));
    }

    @Test
    void otroDoctorNoPuedeLeerDescargarOEmitir() {
        when(repo.bloquearCitaParaRecibo(12,7,"DOCTOR")).thenReturn(null);
        assertThrows(RecursoNoEncontradoException.class,()->service.consultarRecibo(12,7));
        assertThrows(RecursoNoEncontradoException.class,()->service.descargarRecibo(12,7));
        assertThrows(RecursoNoEncontradoException.class,()->service.emitirRecibo(12,null,7));
        verify(repo,never()).buscarRecibo(anyLong());
    }

    @Test
    void rolSinPermisoNoAccedeAlRecibo() {
        doThrow(new AccessDeniedException("Sin permiso")).when(permisos)
                .exigir(7,"DOCTOR","ADMINISTRADORA");
        assertThrows(AccessDeniedException.class,()->service.descargarRecibo(12,7));
        verifyNoInteractions(repo);
    }

    @Test
    void entregaImpresaNoEnviaCorreoYReintentoNoDuplicaEntrega() {
        service.entregarRecibo(12,new EntregaReciboRequestDTO("PRESENCIAL"),7);
        verify(repo).entregarRecibo(7,7,12L,"PRESENCIAL");
        verifyNoInteractions(mail);
        when(repo.buscarRecibo(12)).thenReturn(recibo("paciente@example.com",LocalDateTime.now()));
        service.entregarRecibo(12,new EntregaReciboRequestDTO("PRESENCIAL"),7);
        verify(repo,times(1)).entregarRecibo(anyLong(),anyLong(),anyLong(),anyString());
    }

    @Test
    void correoSinDestinatarioNoConfirmaEntrega() {
        when(repo.buscarRecibo(12)).thenReturn(recibo(null,null));
        assertThrows(ReglaNegocioException.class,
                ()->service.entregarRecibo(12,new EntregaReciboRequestDTO("EMAIL"),7));
        verify(repo,never()).entregarRecibo(anyLong(),anyLong(),anyLong(),anyString());
        verifyNoInteractions(mail);
    }

    @Test
    void envioIncluyePdfPacienteYNumeroDeRecibo() throws Exception {
        var message = new MimeMessage(jakarta.mail.Session.getInstance(new Properties()));
        when(mail.createMimeMessage()).thenReturn(message);
        service.entregarRecibo(12,new EntregaReciboRequestDTO("EMAIL"),7);
        verify(mail).send(message);
        verify(repo).guardarCorreoRecibo(12,"paciente@example.com");
        message.saveChanges();
        assertEquals("paciente@example.com",message.getAllRecipients()[0].toString());
        assertTrue(message.getSubject().contains("REC-0000000012"));
        assertTrue(tienePdf((Multipart)message.getContent()));
        String texto = textoCorreo((Multipart)message.getContent());
        assertTrue(texto.contains("Doctor: Doctor de prueba"));
        assertTrue(texto.contains("Especialidad: Medicina general"));
    }

    private String textoCorreo(Multipart multipart) throws Exception {
        StringBuilder texto = new StringBuilder();
        for (int i=0; i<multipart.getCount(); i++) {
            var parte = multipart.getBodyPart(i);
            if (parte.isMimeType("text/plain")) texto.append(parte.getContent());
            else if (parte.getContent() instanceof Multipart nested) texto.append(textoCorreo(nested));
        }
        return texto.toString();
    }

    private boolean tienePdf(Multipart multipart) throws Exception {
        for(int i=0;i<multipart.getCount();i++) {
            var parte=multipart.getBodyPart(i);
            if("REC-0000000012.pdf".equals(parte.getFileName())) {
                assertArrayEquals(archivo,parte.getInputStream().readAllBytes());
                return true;
            }
            if(parte.getContent() instanceof Multipart nested && tienePdf(nested)) return true;
        }
        return false;
    }

    @Test
    void falloSmtpRevierteEntregaEnTransaccionYPermiteReintentar() {
        var ds=new DriverManagerDataSource("jdbc:h2:mem:reciboEntrega;DB_CLOSE_DELAY=-1","sa","");
        var jdbc=new JdbcTemplate(ds);
        jdbc.execute("CREATE TABLE IF NOT EXISTS ENTREGA (ID INT PRIMARY KEY, ENTREGADO INT)");
        jdbc.execute("MERGE INTO ENTREGA KEY(ID) VALUES(12,0)");
        doAnswer(i->{jdbc.update("UPDATE ENTREGA SET ENTREGADO=1 WHERE ID=12"); return null;})
                .when(repo).entregarRecibo(7,7,12L,"EMAIL");
        var message=new MimeMessage(jakarta.mail.Session.getInstance(new Properties()));
        when(mail.createMimeMessage()).thenReturn(message);
        doThrow(new org.springframework.mail.MailSendException("SMTP falló")).when(mail).send(message);
        var tx=new TransactionTemplate(new DataSourceTransactionManager(ds));
        assertThrows(ReglaNegocioException.class,()->tx.execute(status ->
                service.entregarRecibo(12,new EntregaReciboRequestDTO("EMAIL"),7)));
        assertEquals(0,jdbc.queryForObject("SELECT ENTREGADO FROM ENTREGA WHERE ID=12",Integer.class));
        verify(repo,never()).guardarCorreoRecibo(anyLong(),anyString());
        doNothing().when(mail).send(message);
        tx.execute(status -> service.entregarRecibo(12,new EntregaReciboRequestDTO("EMAIL"),7));
        assertEquals(1,jdbc.queryForObject("SELECT ENTREGADO FROM ENTREGA WHERE ID=12",Integer.class));
    }

    @Test
    void sinReciboOConMedioIncorrectoNoRegistraEntrega() {
        assertThrows(ReglaNegocioException.class,
                ()->service.entregarRecibo(12,new EntregaReciboRequestDTO("OTRO"),7));
        when(repo.buscarRecibo(12)).thenReturn(null);
        assertThrows(RecursoNoEncontradoException.class,
                ()->service.entregarRecibo(12,new EntregaReciboRequestDTO("EMAIL"),7));
        verify(repo,never()).entregarRecibo(anyLong(),anyLong(),anyLong(),anyString());
    }
}

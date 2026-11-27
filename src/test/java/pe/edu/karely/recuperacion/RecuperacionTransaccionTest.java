package pe.edu.karely.recuperacion;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.orm.jpa.*;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.karely.dto.auth.*;
import pe.edu.karely.entity.*;
import pe.edu.karely.repository.auth.TokenRecuperacionRepository;
import pe.edu.karely.service.impl.auth.RecuperacionServiceImpl;

import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

class RecuperacionTransaccionTest {
    @Test
    void soloUnResetConcurrenteGanaYCierraSesionesEnLaMismaTransaccion() throws Exception {
        var factory = new LocalContainerEntityManagerFactoryBean();
        var source =
                new DriverManagerDataSource(
                        "jdbc:h2:mem:recuperacion;MODE=Oracle;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000",
                        "sa",
                        "");
        factory.setDataSource(source);
        factory.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        factory.setPackagesToScan("pe.edu.karely.entity");
        factory.setJpaPropertyMap(Map.of("hibernate.hbm2ddl.auto", "create-drop"));
        factory.afterPropertiesSet();
        try (var schemaConnection = source.getConnection()) {
            var emf = factory.getObject();
            var em = SharedEntityManagerCreator.createSharedEntityManager(emf);
            var tx = new TransactionTemplate(new JpaTransactionManager(emf));
            try (var statement = schemaConnection.createStatement()) {
                statement.execute(
                        "ALTER TABLE AUDITORIA ADD CONSTRAINT CK_AUD_ORIGEN_PRUEBA CHECK (ORIGEN IN"
                            + " ('USUARIO','SISTEMA'))");
            }
            var repo = new TokenRecuperacionRepository();
            var field = TokenRecuperacionRepository.class.getDeclaredField("em");
            field.setAccessible(true);
            field.set(repo, em);
            var encoder = new BCryptPasswordEncoder(4);
            Long id =
                    tx.execute(
                            status -> {
                                var rol = new Rol();
                                rol.setNombre("DOCTOR");
                                em.persist(rol);
                                var user = new Usuario();
                                user.setRol(rol);
                                user.setUsername("prueba");
                                user.setCorreo("prueba@example.org");
                                user.setPasswordHash(encoder.encode("OriginalPassword1"));
                                user.setEstado("BLOQUEADO");
                                user.setIntentosFallidos(5);
                                em.persist(user);
                                var session = new SesionUsuario();
                                session.setUsuario(user);
                                session.setEstado("ACTIVA");
                                session.setFechaInicio(LocalDateTime.now());
                                session.setUltimaActividad(LocalDateTime.now());
                                em.persist(session);
                                return user.getIdUsuario();
                            });
            var mail = mock(JavaMailSender.class);
            CorreoPrueba.preparar(mail);
            ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
            when(provider.getIfAvailable()).thenReturn(mail);
            AtomicReference<String> raw = new AtomicReference<>();
            doAnswer(
                            invocation -> {
                                assertFalse(
                                        org.springframework.transaction.support
                                                .TransactionSynchronizationManager
                                                .isActualTransactionActive());
                                assertEquals(
                                        Long.valueOf(1),
                                        tx.execute(
                                                status ->
                                                        em.createQuery(
                                                                        "select count(t) from"
                                                                            + " TokenRecuperacion"
                                                                            + " t",
                                                                        Long.class)
                                                                .getSingleResult()));
                                MimeMessage message = invocation.getArgument(0);
                                raw.set(CorreoPrueba.token(message));
                                return null;
                            })
                    .when(mail)
                    .send(any(MimeMessage.class));
            var service =
                    new RecuperacionServiceImpl(
                            repo,
                            encoder,
                            provider,
                            new JpaTransactionManager(emf),
                            Clock.systemUTC(),
                            true,
                            "http://localhost:4200/restablecer-password",
                            15,
                            "sender@example.org",
                            "smtp.example.org");
            service.solicitar(new RecuperacionRequestDTO("prueba@example.org"), "127.0.0.1");
            assertNotNull(raw.get());
            var start = new CountDownLatch(1);
            var pool = Executors.newFixedThreadPool(2);
            try {
                Callable<Boolean> reset =
                        () -> {
                            start.await();
                            try {
                                service.restablecer(
                                        new RestablecerPasswordRequestDTO(
                                                raw.get(), "NewPassword123", "NewPassword123"));
                                return true;
                            } catch (ResponseStatusException expected) {
                                assertEquals(400, expected.getStatusCode().value());
                                return false;
                            }
                        };
                var first = pool.submit(reset);
                var second = pool.submit(reset);
                start.countDown();
                assertNotEquals(first.get(15, TimeUnit.SECONDS), second.get(15, TimeUnit.SECONDS));
            } finally {
                pool.shutdownNow();
            }
            tx.executeWithoutResult(
                    status -> {
                        var user = em.find(Usuario.class, id);
                        assertTrue(encoder.matches("NewPassword123", user.getPasswordHash()));
                        assertEquals("ACTIVO", user.getEstado());
                        assertEquals(0, user.getIntentosFallidos());
                        assertEquals(
                                0L,
                                em.createQuery(
                                                "select count(s) from SesionUsuario s where"
                                                    + " s.estado='ACTIVA'",
                                                Long.class)
                                        .getSingleResult());
                        assertEquals(
                                0L,
                                em.createQuery(
                                                "select count(t) from TokenRecuperacion t where"
                                                    + " t.fechaUso is null",
                                                Long.class)
                                        .getSingleResult());
                        assertEquals(
                                1L,
                                em.createQuery(
                                                "select count(a) from Auditoria a where"
                                                    + " a.accion='RESTABLECER'",
                                                Long.class)
                                        .getSingleResult());
                    });
        } finally {
            factory.destroy();
        }
    }
}

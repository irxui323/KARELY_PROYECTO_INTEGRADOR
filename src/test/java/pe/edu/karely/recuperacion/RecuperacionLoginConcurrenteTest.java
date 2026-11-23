package pe.edu.karely.recuperacion;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.orm.jpa.*;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.support.TransactionTemplate;

import pe.edu.karely.dto.auth.*;
import pe.edu.karely.entity.*;
import pe.edu.karely.repository.administracion.*;
import pe.edu.karely.repository.atencion.*;
import pe.edu.karely.repository.auth.*;
import pe.edu.karely.repository.catalogos.*;
import pe.edu.karely.repository.citas.*;
import pe.edu.karely.repository.doctores.*;
import pe.edu.karely.repository.finanzas.*;
import pe.edu.karely.repository.pacientes.*;
import pe.edu.karely.repository.reportes.*;
import pe.edu.karely.repository.OracleJdbc;
import pe.edu.karely.security.JwtService;
import pe.edu.karely.service.impl.administracion.*;
import pe.edu.karely.service.impl.atencion.*;
import pe.edu.karely.service.impl.auth.*;
import pe.edu.karely.service.impl.catalogos.*;
import pe.edu.karely.service.impl.citas.*;
import pe.edu.karely.service.impl.doctores.*;
import pe.edu.karely.service.impl.finanzas.*;
import pe.edu.karely.service.impl.pacientes.*;
import pe.edu.karely.service.impl.reportes.*;

import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicReference;

class RecuperacionLoginConcurrenteTest {
    @Test
    void loginConSnapshotAnteriorNoAbreSesionDespuesDelReset() throws Exception {
        var source =
                new DriverManagerDataSource(
                        "jdbc:h2:mem:recuperacionlogin;MODE=Oracle;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000",
                        "sa",
                        "");
        var factory = new LocalContainerEntityManagerFactoryBean();
        factory.setDataSource(source);
        factory.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        factory.setPackagesToScan("pe.edu.karely.entity");
        factory.setJpaPropertyMap(Map.of("hibernate.hbm2ddl.auto", "create-drop"));
        factory.afterPropertiesSet();
        try {
            var emf = factory.getObject();
            var em = SharedEntityManagerCreator.createSharedEntityManager(emf);
            var manager = new JpaTransactionManager(emf);
            var tx = new TransactionTemplate(manager);
            var repo = new TokenRecuperacionRepository();
            var field = TokenRecuperacionRepository.class.getDeclaredField("em");
            field.setAccessible(true);
            field.set(repo, em);
            var bcrypt = new BCryptPasswordEncoder(4);
            tx.executeWithoutResult(
                    status -> {
                        var rol = new Rol();
                        rol.setNombre("DOCTOR");
                        em.persist(rol);
                        var user = new Usuario();
                        user.setRol(rol);
                        user.setUsername("doctor");
                        user.setCorreo("doctor@example.org");
                        user.setPasswordHash(bcrypt.encode("OriginalPassword1"));
                        user.setIntentosFallidos(0);
                        em.persist(user);
                    });
            var mail = mock(JavaMailSender.class);
            CorreoPrueba.preparar(mail);
            ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
            when(provider.getIfAvailable()).thenReturn(mail);
            AtomicReference<String> token = new AtomicReference<>();
            doAnswer(
                            invocation -> {
                                MimeMessage message = invocation.getArgument(0);
                                token.set(CorreoPrueba.token(message));
                                return null;
                            })
                    .when(mail)
                    .send(any(MimeMessage.class));
            var recovery =
                    new RecuperacionServiceImpl(
                            repo,
                            bcrypt,
                            provider,
                            manager,
                            Clock.systemUTC(),
                            true,
                            "http://localhost:4200/restablecer-password",
                            15,
                            "sender@example.org",
                            "smtp.example.org");
            recovery.solicitar(new RecuperacionRequestDTO("doctor@example.org"), "127.0.0.1");
            assertNotNull(token.get());
            var snapshotRead = new CountDownLatch(1);
            var resetCommitted = new CountDownLatch(1);
            PasswordEncoder blocked =
                    new PasswordEncoder() {
                        public String encode(CharSequence raw) {
                            return bcrypt.encode(raw);
                        }

                        public boolean matches(CharSequence raw, String encoded) {
                            snapshotRead.countDown();
                            try {
                                if (!resetCommitted.await(15, TimeUnit.SECONDS))
                                    throw new IllegalStateException("Reset no terminÃ³");
                            } catch (InterruptedException ex) {
                                Thread.currentThread().interrupt();
                                throw new IllegalStateException(ex);
                            }
                            return bcrypt.matches(raw, encoded);
                        }
                    };
            var sessions = mock(SesionRepository.class);
            when(sessions.abrir(anyLong())).thenReturn(1L);
            var users = new UsuarioRepository(new OracleJdbc(new JdbcTemplate(source), source));
            var auth =
                    new AuthServiceImpl(
                            sessions,
                            users,
                            blocked,
                            mock(JwtService.class),
                            mock(LoginAttemptService.class));
            var pool = Executors.newSingleThreadExecutor();
            try {
                var login =
                        pool.submit(
                                () ->
                                        tx.execute(
                                                status ->
                                                        auth.login(
                                                                new LoginRequestDTO(
                                                                        "doctor",
                                                                        "OriginalPassword1"))));
                assertTrue(snapshotRead.await(15, TimeUnit.SECONDS));
                recovery.restablecer(
                        new RestablecerPasswordRequestDTO(
                                token.get(), "NewPassword123", "NewPassword123"));
                resetCommitted.countDown();
                var failure =
                        assertThrows(
                                ExecutionException.class, () -> login.get(15, TimeUnit.SECONDS));
                assertInstanceOf(BadCredentialsException.class, failure.getCause());
                verify(sessions, never()).abrir(anyLong());
            } finally {
                resetCommitted.countDown();
                pool.shutdownNow();
            }
        } finally {
            factory.destroy();
        }
    }
}

package pe.edu.karely.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import pe.edu.karely.repository.administracion.UsuarioRepository;

import java.util.Locale;

@Configuration
public class BootstrapAdmin {
    @Bean
    @Order(2)
    ApplicationRunner initAdmin(
            UsuarioRepository usuarios,
            PasswordEncoder encoder,
            @Value("${app.bootstrap.username:}") String username,
            @Value("${app.bootstrap.email:}") String email,
            @Value("${app.bootstrap.password:}") String password) {
        return args -> {
            if (username.isBlank() && email.isBlank() && password.isBlank()) {
                return;
            }
            if (username.isBlank() || email.isBlank() || password.length() < 12) {
                throw new IllegalArgumentException(
                        "Bootstrap: usuario/correo/contraseña segura (12 caracteres mínimo)"
                            + " obligatorios");
            }
            if (usuarios.contarAdministradorasActivas().total() > 0) {
                return;
            }
            var rol = usuarios.buscarRolAdministradora();
            if (rol == null) {
                throw new IllegalStateException(
                        "Falta el rol activo de administradora. Revise los datos iniciales de"
                            + " Oracle.");
            }
            usuarios.crearAdministradoraInicial(
                    rol.idRol(),
                    username.trim().toLowerCase(Locale.ROOT),
                    email.trim().toLowerCase(Locale.ROOT),
                    encoder.encode(password));
        };
    }
}

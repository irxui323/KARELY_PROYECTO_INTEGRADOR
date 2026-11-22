package pe.edu.karely;

import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.servlet.Filter;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mock.web.MockServletContext;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import pe.edu.karely.config.SecurityConfig;
import pe.edu.karely.controller.AuthController;
import pe.edu.karely.repository.SesionRepository;
import pe.edu.karely.security.JwtService;
import pe.edu.karely.service.service.AuthService;
import pe.edu.karely.service.service.RecuperacionService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

class RecuperacionSeguridadHttpTest {
    @Configuration
    @EnableWebSecurity
    @EnableWebMvc
    static class PruebaConfig {
        @Bean
        JwtService jwt() {
            return mock(JwtService.class);
        }

        @Bean
        SesionRepository sesiones() {
            return mock(SesionRepository.class);
        }

        @Bean
        ObjectMapper mapper() {
            return JsonMapper.builder().build();
        }

        @Bean
        AuthController controller() {
            return new AuthController(mock(AuthService.class), mock(RecuperacionService.class));
        }
    }

    @Test
    void solicitudDeRecuperacionEsPublicaYElPerfilSigueProtegido() throws Exception {
        try (var context = new AnnotationConfigWebApplicationContext()) {
            context.setServletContext(new MockServletContext());
            context.register(PruebaConfig.class, SecurityConfig.class);
            context.refresh();
            var mvc =
                    MockMvcBuilders.webAppContextSetup(context)
                            .addFilters(context.getBean("springSecurityFilterChain", Filter.class))
                            .build();
            mvc.perform(
                            post("/api/v1/auth/recuperacion")
                                    .contentType("application/json")
                                    .content("{\"correo\":\"ana@example.com\"}"))
                    .andExpect(status().isAccepted());
            mvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized());
        }
    }
}

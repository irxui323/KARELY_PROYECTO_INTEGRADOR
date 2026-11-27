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
import pe.edu.karely.controller.auth.AuthController;
import pe.edu.karely.repository.auth.SesionRepository;
import pe.edu.karely.security.JwtService;
import pe.edu.karely.service.service.auth.AuthService;
import pe.edu.karely.service.service.auth.RecuperacionService;

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

        @Bean
        pe.edu.karely.controller.sistema.HealthController health() {
            return new pe.edu.karely.controller.sistema.HealthController();
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
            mvc.perform(post("/api/v1/auth/recuperacion")
                            .contentType("application/json")
                            .content("{\"correo\":\"ana@example.com\"}"))
                    .andExpect(status().isForbidden());
            var bootstrap = mvc.perform(get("/api/v1/health"))
                    .andExpect(status().isOk()).andReturn();
            var cookie = bootstrap.getResponse().getCookie("XSRF-TOKEN");
            org.junit.jupiter.api.Assertions.assertNotNull(cookie);
            mvc.perform(
                            post("/api/v1/auth/recuperacion")
                                    .cookie(cookie)
                                    .header("X-XSRF-TOKEN", "incorrecto")
                                    .contentType("application/json")
                                    .content("{\"correo\":\"ana@example.com\"}"))
                    .andExpect(status().isForbidden());
            mvc.perform(
                            post("/api/v1/auth/recuperacion")
                                    .cookie(cookie)
                                    .header("X-XSRF-TOKEN", cookie.getValue())
                                    .contentType("application/json")
                                    .content("{\"correo\":\"ana@example.com\"}"))
                    .andExpect(status().isAccepted());
            mvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized());
            mvc.perform(post("/fuera-de-la-api")).andExpect(status().isForbidden());
        }
    }
}

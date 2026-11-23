package pe.edu.karely.config;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import pe.edu.karely.dto.ErrorResponseDTO;
import pe.edu.karely.repository.auth.SesionRepository;
import pe.edu.karely.security.AuthFilter;
import pe.edu.karely.security.JwtService;

import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    CorsConfigurationSource cors(@Value("${app.frontend-origin}") String origins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(
                Arrays.stream(origins.split(","))
                        .map(String::trim)
                        .filter(origin -> !origin.isEmpty())
                        .toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    SecurityFilterChain chain(
            HttpSecurity http, JwtService jwt, SesionRepository sesiones, ObjectMapper mapper)
            throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        auth ->
                                auth.requestMatchers(
                                                "/api/v1/auth/login",
                                                "/api/v1/auth/recuperacion",
                                                "/api/v1/auth/restablecer-password",
                                                "/api/v1/health",
                                                "/v3/api-docs/**",
                                                "/swagger-ui.html",
                                                "/swagger-ui/**")
                                        .permitAll()
                                        .anyRequest()
                                        .authenticated())
                .exceptionHandling(
                        errors ->
                                errors.authenticationEntryPoint(
                                                (request, response, ex) ->
                                                        writeError(
                                                                request,
                                                                response,
                                                                mapper,
                                                                401,
                                                                "SesiÃ³n no vÃ¡lida"))
                                        .accessDeniedHandler(
                                                (request, response, ex) ->
                                                        writeError(
                                                                request,
                                                                response,
                                                                mapper,
                                                                403,
                                                                "Acceso no autorizado")))
                .addFilterBefore(
                        new AuthFilter(jwt, sesiones), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private void writeError(
            jakarta.servlet.http.HttpServletRequest request,
            HttpServletResponse response, ObjectMapper mapper, int status, String detail)
            throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        mapper.writeValue(response.getOutputStream(), new ErrorResponseDTO(
                java.time.LocalDateTime.now(), status,
                org.springframework.http.HttpStatus.valueOf(status).getReasonPhrase(),
                detail, request.getRequestURI(), null));
    }
}

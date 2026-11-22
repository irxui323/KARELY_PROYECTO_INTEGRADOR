package pe.edu.karely.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import pe.edu.karely.dto.auth.RolActivoDTO;
import pe.edu.karely.repository.SesionRepository;

import java.io.IOException;
import java.util.List;

public class AuthFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final SesionRepository sesiones;

    public AuthFilter(JwtService jwt, SesionRepository sesiones) {
        this.jwt = jwt;
        this.sesiones = sesiones;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            try {
                JwtService.Claims claims = jwt.verify(authorization.substring(7));
                List<RolActivoDTO> roles =
                        sesiones.buscarSesionActiva(claims.sessionId(), claims.userId());
                if (!roles.isEmpty() && claims.role().equals(roles.getFirst().rol())) {
                    var token =
                            new UsernamePasswordAuthenticationToken(
                                    claims.userId(),
                                    null,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + claims.role())));
                    sesiones.actualizarActividad(claims.sessionId());
                    SecurityContextHolder.getContext().setAuthentication(token);
                }
            } catch (Exception ignored) {
                SecurityContextHolder.clearContext();
            }
        }
        try {
            chain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}

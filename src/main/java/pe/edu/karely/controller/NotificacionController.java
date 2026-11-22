package pe.edu.karely.controller;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.administracion.NotificacionRequestDTO;
import pe.edu.karely.dto.administracion.NotificacionResponseDTO;
import pe.edu.karely.service.service.NotificacionService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notificaciones")
public class NotificacionController {
    private final NotificacionService service;

    public NotificacionController(NotificacionService service) {
        this.service = service;
    }

    @GetMapping
    public List<NotificacionResponseDTO> listar(Authentication auth) {
        return service.listarNotificaciones((Long) auth.getPrincipal());
    }

    @PostMapping
    public OperacionResponseDTO encolar(
            @Valid @RequestBody NotificacionRequestDTO body, Authentication auth) {
        return service.encolarNotificacion(body, (Long) auth.getPrincipal());
    }
}

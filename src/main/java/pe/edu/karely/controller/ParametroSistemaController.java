package pe.edu.karely.controller;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.administracion.ParametroRequestDTO;
import pe.edu.karely.dto.administracion.ParametroResponseDTO;
import pe.edu.karely.service.service.ParametroSistemaService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parametros")
public class ParametroSistemaController {
    private final ParametroSistemaService service;

    public ParametroSistemaController(ParametroSistemaService service) {
        this.service = service;
    }

    @GetMapping
    public List<ParametroResponseDTO> listar(Authentication auth) {
        return service.listarParametros((Long) auth.getPrincipal());
    }

    @PutMapping("/{nombre}")
    public OperacionResponseDTO actualizar(
            @PathVariable String nombre,
            @Valid @RequestBody ParametroRequestDTO body,
            Authentication auth) {
        return service.configurarParametro(nombre, body, (Long) auth.getPrincipal());
    }
}

package pe.edu.karely.controller;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.catalogo.ConsultorioRequestDTO;
import pe.edu.karely.dto.catalogo.ConsultorioResponseDTO;
import pe.edu.karely.service.service.ConsultorioService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/consultorios")
public class ConsultorioController {
    private final ConsultorioService service;

    public ConsultorioController(ConsultorioService service) {
        this.service = service;
    }

    @GetMapping
    public List<ConsultorioResponseDTO> listar(Authentication auth) {
        return service.listarConsultorios((Long) auth.getPrincipal());
    }

    @PostMapping
    public OperacionResponseDTO crear(
            @Valid @RequestBody ConsultorioRequestDTO body, Authentication auth) {
        return service.registrarConsultorio(body, (Long) auth.getPrincipal());
    }

    @PutMapping("/{id}")
    public OperacionResponseDTO editar(
            @PathVariable long id,
            @Valid @RequestBody ConsultorioRequestDTO body,
            Authentication auth) {
        return service.editarConsultorio(id, body, (Long) auth.getPrincipal());
    }
}

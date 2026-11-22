package pe.edu.karely.controller;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.paciente.PacienteRequestDTO;
import pe.edu.karely.dto.paciente.PacienteResponseDTO;
import pe.edu.karely.service.service.PacienteService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pacientes")
public class PacienteController {
    private final PacienteService service;

    public PacienteController(PacienteService service) {
        this.service = service;
    }

    @GetMapping
    public List<PacienteResponseDTO> listar(Authentication auth) {
        return service.listarPacientes((Long) auth.getPrincipal());
    }

    @PostMapping
    public OperacionResponseDTO crear(
            @Valid @RequestBody PacienteRequestDTO body, Authentication auth) {
        return service.registrarPaciente(body, (Long) auth.getPrincipal());
    }

    @PutMapping("/{id}")
    public OperacionResponseDTO editar(
            @PathVariable long id,
            @Valid @RequestBody PacienteRequestDTO body,
            Authentication auth) {
        return service.editarPaciente(id, body, (Long) auth.getPrincipal());
    }

    @GetMapping("/{id}")
    public PacienteResponseDTO buscar(@PathVariable long id, Authentication auth) {
        return service.buscarPorId(id, (Long) auth.getPrincipal());
    }

    @GetMapping("/buscar")
    public List<PacienteResponseDTO> buscarDocumento(
            @RequestParam String tipo, @RequestParam String documento, Authentication auth) {
        return service.buscarPaciente(tipo, documento, (Long) auth.getPrincipal());
    }
}

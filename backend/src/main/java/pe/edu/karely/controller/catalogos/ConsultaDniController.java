package pe.edu.karely.controller.catalogos;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pe.edu.karely.dto.catalogo.ConsultaDniResponseDTO;
import pe.edu.karely.exception.ReglaNegocioException;
import pe.edu.karely.service.service.catalogos.ConsultaDniService;

@RestController
@RequestMapping("/api/v1/catalogos/dni")
public class ConsultaDniController {
    private final ConsultaDniService service;

    public ConsultaDniController(ConsultaDniService service) {
        this.service = service;
    }

    @GetMapping("/{dni}")
    public ConsultaDniResponseDTO consultar(@PathVariable String dni, Authentication auth) {
        if (!dni.matches("\\d{8}")) {
            throw new ReglaNegocioException("El DNI debe tener 8 dígitos");
        }
        return service.consultar(dni, (Long) auth.getPrincipal());
    }
}

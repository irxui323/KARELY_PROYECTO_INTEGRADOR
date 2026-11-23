package pe.edu.karely.controller.administracion;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import pe.edu.karely.dto.administracion.AuditoriaResponseDTO;
import pe.edu.karely.service.service.administracion.AuditoriaService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auditoria")
public class AuditoriaController {
    private final AuditoriaService service;

    public AuditoriaController(AuditoriaService service) {
        this.service = service;
    }

    @GetMapping(params = "!pagina")
    public List<AuditoriaResponseDTO> listar(Authentication auth) {
        return service.listarAuditoria((Long) auth.getPrincipal());
    }

    @GetMapping(params = "pagina")
    public pe.edu.karely.dto.PaginaResponseDTO<AuditoriaResponseDTO> pagina(
            @RequestParam int pagina,
            @RequestParam(defaultValue = "10") int tamanio,
            @RequestParam(defaultValue = "") String filtro,
            Authentication auth) {
        return service.listarAuditoriaPagina(pagina, tamanio, filtro, (Long) auth.getPrincipal());
    }
}

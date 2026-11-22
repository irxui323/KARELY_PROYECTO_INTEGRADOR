package pe.edu.karely.controller;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.edu.karely.service.service.AuditoriaService;
import pe.edu.karely.dto.administracion.AuditoriaResponseDTO;
@RestController
@RequestMapping("/api/v1/auditoria")
public class AuditoriaController{
private final AuditoriaService service;
public AuditoriaController(AuditoriaService service){this.service=service;}
@GetMapping
public List<AuditoriaResponseDTO> listar(Authentication auth){return service.listarAuditoria((Long)auth.getPrincipal());}

}

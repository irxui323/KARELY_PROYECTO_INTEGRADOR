package pe.edu.karely.controller.administracion;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.administracion.AccesoUsuarioResponseDTO;
import pe.edu.karely.dto.administracion.AsignarRolRequestDTO;
import pe.edu.karely.dto.administracion.EstadoUsuarioRequestDTO;
import pe.edu.karely.dto.administracion.RolResponseDTO;
import pe.edu.karely.dto.administracion.UsuarioRequestDTO;
import pe.edu.karely.dto.administracion.UsuarioResponseDTO;
import pe.edu.karely.service.service.administracion.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {
    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping(params = "!pagina")
    public List<UsuarioResponseDTO> listar(Authentication auth) {
        return service.listarUsuarios((Long) auth.getPrincipal());
    }

    @GetMapping("/roles")
    public List<RolResponseDTO> roles(Authentication auth) {
        return service.listarRoles((Long) auth.getPrincipal());
    }

    @PostMapping
    public org.springframework.http.ResponseEntity<AccesoUsuarioResponseDTO> crear(
            @Valid @RequestBody UsuarioRequestDTO body, Authentication auth) {
        return org.springframework.http.ResponseEntity.ok()
                .cacheControl(org.springframework.http.CacheControl.noStore())
                .body(service.registrarUsuario(body, (Long) auth.getPrincipal()));
    }

    @PatchMapping("/{id}/rol")
    public OperacionResponseDTO asignarRol(
            @PathVariable long id,
            @Valid @RequestBody AsignarRolRequestDTO body,
            Authentication auth) {
        return service.asignarRol(id, body, (Long) auth.getPrincipal());
    }

    @PatchMapping("/{id}/estado")
    public OperacionResponseDTO cambiarEstado(
            @PathVariable long id,
            @Valid @RequestBody EstadoUsuarioRequestDTO body,
            Authentication auth) {
        return service.cambiarEstado(id, body, (Long) auth.getPrincipal());
    }

    @GetMapping(params = "pagina")
    public pe.edu.karely.dto.PaginaResponseDTO<UsuarioResponseDTO> pagina(
            @RequestParam int pagina,
            @RequestParam(defaultValue = "10") int tamanio,
            @RequestParam(defaultValue = "") String filtro,
            Authentication auth) {
        return service.listarUsuariosPagina(pagina, tamanio, filtro, (Long) auth.getPrincipal());
    }
}

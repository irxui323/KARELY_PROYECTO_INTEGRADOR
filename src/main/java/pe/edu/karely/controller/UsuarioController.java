package pe.edu.karely.controller;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.edu.karely.service.service.UsuarioService;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.administracion.AsignarRolRequestDTO;
import pe.edu.karely.dto.administracion.EstadoUsuarioRequestDTO;
import pe.edu.karely.dto.administracion.RolResponseDTO;
import pe.edu.karely.dto.administracion.UsuarioRequestDTO;
import pe.edu.karely.dto.administracion.UsuarioResponseDTO;
@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController{
private final UsuarioService service;
public UsuarioController(UsuarioService service){this.service=service;}
@GetMapping
public List<UsuarioResponseDTO> listar(Authentication auth){return service.listarUsuarios((Long)auth.getPrincipal());}
@GetMapping("/roles")
public List<RolResponseDTO> roles(Authentication auth){return service.listarRoles((Long)auth.getPrincipal());}
@PostMapping
public OperacionResponseDTO crear(@Valid @RequestBody UsuarioRequestDTO body , Authentication auth){return service.registrarUsuario(body,(Long)auth.getPrincipal());}
@PatchMapping("/{id}/rol")
public OperacionResponseDTO asignarRol(@PathVariable long id,@Valid @RequestBody AsignarRolRequestDTO body , Authentication auth){return service.asignarRol(id,body,(Long)auth.getPrincipal());}
@PatchMapping("/{id}/estado")
public OperacionResponseDTO cambiarEstado(@PathVariable long id,@Valid @RequestBody EstadoUsuarioRequestDTO body , Authentication auth){return service.cambiarEstado(id,body,(Long)auth.getPrincipal());}

}

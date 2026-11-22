package pe.edu.karely.controller;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.edu.karely.service.service.EspecialidadService;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.catalogo.EspecialidadRequestDTO;
import pe.edu.karely.dto.catalogo.EspecialidadResponseDTO;
@RestController
@RequestMapping("/api/v1/especialidades")
public class EspecialidadController{
private final EspecialidadService service;
public EspecialidadController(EspecialidadService service){this.service=service;}
@GetMapping
public List<EspecialidadResponseDTO> listar(Authentication auth){return service.listarEspecialidades((Long)auth.getPrincipal());}
@PostMapping
public OperacionResponseDTO crear(@Valid @RequestBody EspecialidadRequestDTO body , Authentication auth){return service.registrarEspecialidad(body,(Long)auth.getPrincipal());}
@PutMapping("/{id}")
public OperacionResponseDTO editar(@PathVariable long id,@Valid @RequestBody EspecialidadRequestDTO body , Authentication auth){return service.editarEspecialidad(id,body,(Long)auth.getPrincipal());}

}

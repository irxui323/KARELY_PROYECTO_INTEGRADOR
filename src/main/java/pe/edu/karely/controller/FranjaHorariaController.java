package pe.edu.karely.controller;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.edu.karely.service.service.FranjaHorariaService;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.catalogo.FranjaRequestDTO;
import pe.edu.karely.dto.catalogo.FranjaResponseDTO;
@RestController
@RequestMapping("/api/v1/franjas")
public class FranjaHorariaController{
private final FranjaHorariaService service;
public FranjaHorariaController(FranjaHorariaService service){this.service=service;}
@GetMapping
public List<FranjaResponseDTO> listar(Authentication auth){return service.listarTurnos((Long)auth.getPrincipal());}
@PostMapping
public OperacionResponseDTO crear(@Valid @RequestBody FranjaRequestDTO body , Authentication auth){return service.registrarTurno(body,(Long)auth.getPrincipal());}
@PutMapping("/{id}")
public OperacionResponseDTO editar(@PathVariable long id,@Valid @RequestBody FranjaRequestDTO body , Authentication auth){return service.editarTurno(id,body,(Long)auth.getPrincipal());}

}

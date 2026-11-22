package pe.edu.karely.controller;
import java.util.List;
import java.time.LocalDate;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.edu.karely.service.service.CitaService;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.cita.CancelarCitaRequestDTO;
import pe.edu.karely.dto.cita.CitaResponseDTO;
import pe.edu.karely.dto.cita.ConfirmarCitaRequestDTO;
import pe.edu.karely.dto.cita.ReprogramarCitaRequestDTO;
import pe.edu.karely.dto.cita.ReservaRequestDTO;
import pe.edu.karely.dto.cita.ReservaResponseDTO;
@RestController
@RequestMapping("/api/v1/citas")
public class CitaController{
private final CitaService service;
public CitaController(CitaService service){this.service=service;}
@GetMapping("/disponibilidad-mes")
public List<pe.edu.karely.dto.cita.DisponibilidadDiaDTO> disponibilidadMes(@RequestParam long idEspecialidad,@RequestParam LocalDate mes,@RequestParam(required=false) Long idConsultorio,Authentication auth){return service.disponibilidadMes(idEspecialidad,mes,idConsultorio,(Long)auth.getPrincipal());}
@GetMapping("/disponibilidad")
public List<pe.edu.karely.dto.cita.DoctorDisponibleDTO> disponibilidad(@RequestParam long idEspecialidad,@RequestParam(required=false) LocalDate fecha,@RequestParam(required=false) Long idConsultorio,Authentication auth){return service.disponibilidad(idEspecialidad,fecha,idConsultorio,(Long)auth.getPrincipal());}
@GetMapping
public List<CitaResponseDTO> listar(Authentication auth){return service.listarCitas((Long)auth.getPrincipal());}
@GetMapping("/reservas")
public List<ReservaResponseDTO> reservas(Authentication auth){return service.listarReservas((Long)auth.getPrincipal());}
@GetMapping("/agenda")
public List<CitaResponseDTO> agenda(@RequestParam LocalDate fecha , Authentication auth){return service.filtrarAgendaMedica((Long)auth.getPrincipal(),fecha);}
@GetMapping("/{id}")
public CitaResponseDTO detalle(@PathVariable long id , Authentication auth){return service.detalleCitaMedica((Long)auth.getPrincipal(),id);}
@PostMapping("/reservas")
public OperacionResponseDTO bloquearTurno(@Valid @RequestBody ReservaRequestDTO body , Authentication auth){return service.bloquearTurno(body,(Long)auth.getPrincipal());}
@PostMapping("/confirmar")
public OperacionResponseDTO registrarCita(@Valid @RequestBody ConfirmarCitaRequestDTO body , Authentication auth){return service.registrarCita(body,(Long)auth.getPrincipal());}
@PostMapping("/{id}/reprogramar")
public OperacionResponseDTO reprogramarCita(@PathVariable long id,@Valid @RequestBody ReprogramarCitaRequestDTO body , Authentication auth){return service.reprogramarCita(id,body,(Long)auth.getPrincipal());}
@PostMapping("/{id}/cancelar")
public OperacionResponseDTO cancelarReprogramada(@PathVariable long id,@Valid @RequestBody CancelarCitaRequestDTO body , Authentication auth){return service.cancelarReprogramada(id,body,(Long)auth.getPrincipal());}
@PostMapping("/{id}/asistencia")
public OperacionResponseDTO asistencia(@PathVariable long id , Authentication auth){return service.registrarAsistencia(id,(Long)auth.getPrincipal());}

}

package pe.edu.karely.controller;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.edu.karely.service.service.DisponibilidadService;
import pe.edu.karely.service.service.DoctorService;
import pe.edu.karely.service.service.DocumentoDoctorService;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.doctor.AsignarEspecialidadRequestDTO;
import pe.edu.karely.dto.doctor.DisponibilidadRequestDTO;
import pe.edu.karely.dto.doctor.DisponibilidadResponseDTO;
import pe.edu.karely.dto.doctor.DoctorRequestDTO;
import pe.edu.karely.dto.doctor.DoctorResponseDTO;
import pe.edu.karely.dto.doctor.DocumentoDoctorResponseDTO;
import pe.edu.karely.dto.doctor.*;
@RestController
@RequestMapping("/api/v1/doctores")
public class DoctorController{
private final DoctorService service;
private final DocumentoDoctorService documentos;
private final DisponibilidadService disponibilidad;
public DoctorController(DoctorService service,DocumentoDoctorService documentos,DisponibilidadService disponibilidad){this.service=service;this.documentos=documentos;this.disponibilidad=disponibilidad;}
@GetMapping
public List<DoctorResponseDTO> listar(Authentication auth){return service.listarDoctores((Long)auth.getPrincipal());}
@PostMapping
public OperacionResponseDTO crear(@Valid @RequestBody DoctorRequestDTO body , Authentication auth){return service.registrarDoctor(body,(Long)auth.getPrincipal());}
@PutMapping("/{id}")
public OperacionResponseDTO editar(@PathVariable long id,@Valid @RequestBody DoctorRequestDTO body , Authentication auth){return service.editarDoctor(id,body,(Long)auth.getPrincipal());}
@GetMapping("/{id}")
public DoctorResponseDTO buscar(@PathVariable long id , Authentication auth){return service.buscarPorId(id,(Long)auth.getPrincipal());}
@PostMapping("/{id}/acceso")
public org.springframework.http.ResponseEntity<AccesoDoctorResponseDTO> crearAcceso(@PathVariable long id,@Valid @RequestBody CrearAccesoRequestDTO body,Authentication auth){
return org.springframework.http.ResponseEntity.ok().cacheControl(org.springframework.http.CacheControl.noStore()).body(service.crearAcceso(id,body,(Long)auth.getPrincipal()));}
@PostMapping("/{id}/documentos/{idDocumento}/rechazar")
public OperacionResponseDTO rechazarDocumento(@PathVariable long id,@PathVariable long idDocumento,@Valid @RequestBody RechazarDocumentoRequestDTO body,Authentication auth){return service.rechazarDocumento(id,idDocumento,body,(Long)auth.getPrincipal());}
@PostMapping("/{id}/especialidades")
public OperacionResponseDTO asignarEspecialidad(@PathVariable long id,@Valid @RequestBody AsignarEspecialidadRequestDTO body , Authentication auth){return service.asignarEspecialidad(id,body,(Long)auth.getPrincipal());}
@GetMapping("/{id}/especialidades")
public List<pe.edu.karely.dto.catalogo.EspecialidadResponseDTO> especialidades(@PathVariable long id,Authentication auth){return service.listarEspecialidades(id,(Long)auth.getPrincipal());}
@DeleteMapping("/{id}/especialidades/{idEspecialidad}")
public OperacionResponseDTO quitarEspecialidad(@PathVariable long id,@PathVariable long idEspecialidad,Authentication auth){return service.quitarEspecialidad(id,idEspecialidad,(Long)auth.getPrincipal());}
@PostMapping("/{id}/validar-documentacion")
public OperacionResponseDTO validarDocumentacion(@PathVariable long id,@Valid @RequestBody ValidarDocumentacionRequestDTO body,Authentication auth){return service.validarDocumentacion(id,body,(Long)auth.getPrincipal());}
@GetMapping("/pendientes")
public List<DoctorResponseDTO> listarPendientes(Authentication auth){return service.listarPendientes((Long)auth.getPrincipal());}
@GetMapping("/documentacion-completa")
public List<DoctorResponseDTO> listarConDocumentacionCompleta(Authentication auth){return service.listarConDocumentacionCompleta((Long)auth.getPrincipal());}
@GetMapping("/buscar")
public List<DoctorResponseDTO> buscarDocumento(@RequestParam String documento , Authentication auth){return service.buscarPorDocumento(documento,(Long)auth.getPrincipal());}
@GetMapping("/disponibilidades")
public List<DisponibilidadResponseDTO> horarios(Authentication auth){return disponibilidad.listarHorarios((Long)auth.getPrincipal());}
@PostMapping("/{id}/disponibilidades")
public OperacionResponseDTO registrarHorario(@PathVariable long id,@Valid @RequestBody DisponibilidadRequestDTO body , Authentication auth){return disponibilidad.registrarHorario(id,body,(Long)auth.getPrincipal());}
@GetMapping("/{id}/documentos")
public List<DocumentoDoctorResponseDTO> documentos(@PathVariable long id , Authentication auth){return documentos.listar(id,(Long)auth.getPrincipal());}
@PostMapping(value="/{id}/documentos",consumes="multipart/form-data")
public OperacionResponseDTO subir(@PathVariable long id,@RequestParam String tipo,@RequestParam org.springframework.web.multipart.MultipartFile archivo,Authentication auth) throws java.io.IOException {
return documentos.subir(id,tipo,archivo,(Long)auth.getPrincipal());}
@GetMapping("/documentos/{idDocumento}")
public org.springframework.http.ResponseEntity<byte[]> descargar(@PathVariable long idDocumento,Authentication auth){
var archivo=documentos.descargar(idDocumento,(Long)auth.getPrincipal());
if(archivo==null)throw new pe.edu.karely.exception.RecursoNoEncontradoException("Documento no encontrado");
return org.springframework.http.ResponseEntity.ok().header("Content-Disposition","attachment; filename=\""+archivo.nombre().replaceAll("[^A-Za-z0-9._-]","_")+"\"").contentType(org.springframework.http.MediaType.parseMediaType(archivo.mime())).body(archivo.bytes());}

}

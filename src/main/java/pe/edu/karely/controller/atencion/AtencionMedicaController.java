package pe.edu.karely.controller.atencion;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.atencion.AtencionResponseDTO;
import pe.edu.karely.dto.atencion.DiagnosticoRequestDTO;
import pe.edu.karely.dto.atencion.EntregaReciboRequestDTO;
import pe.edu.karely.dto.atencion.IniciarAtencionRequestDTO;
import pe.edu.karely.dto.atencion.MedicamentoRequestDTO;
import pe.edu.karely.dto.atencion.RecetaRequestDTO;
import pe.edu.karely.dto.atencion.ReciboRequestDTO;
import pe.edu.karely.service.service.atencion.AtencionMedicaService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/atenciones")
public class AtencionMedicaController {
    private final AtencionMedicaService service;

    public AtencionMedicaController(AtencionMedicaService service) {
        this.service = service;
    }

    @GetMapping
    public List<AtencionResponseDTO> listar(Authentication auth) {
        return service.listarAtenciones((Long) auth.getPrincipal());
    }

    @PostMapping("/iniciar")
    public OperacionResponseDTO iniciar(
            @Valid @RequestBody IniciarAtencionRequestDTO body, Authentication auth) {
        return service.iniciarAtencion(body.idCita(), (Long) auth.getPrincipal());
    }

    @PostMapping("/{idCita}/diagnostico")
    public OperacionResponseDTO registrarDiagnostico(
            @PathVariable long idCita,
            @Valid @RequestBody DiagnosticoRequestDTO body,
            Authentication auth) {
        return service.registrarDiagnostico(idCita, body, (Long) auth.getPrincipal());
    }

    @PostMapping("/{idCita}/receta")
    public OperacionResponseDTO registrarReceta(
            @PathVariable long idCita,
            @Valid @RequestBody RecetaRequestDTO body,
            Authentication auth) {
        return service.registrarReceta(idCita, body, (Long) auth.getPrincipal());
    }

    @PostMapping("/{idCita}/recibo")
    public OperacionResponseDTO emitirRecibo(
            @PathVariable long idCita,
            @Valid @RequestBody(required = false) ReciboRequestDTO body,
            Authentication auth) {
        return service.emitirRecibo(idCita, body, (Long) auth.getPrincipal());
    }

    @PostMapping("/{idCita}/entrega")
    public OperacionResponseDTO entregarRecibo(
            @PathVariable long idCita,
            @Valid @RequestBody EntregaReciboRequestDTO body,
            Authentication auth) {
        return service.entregarRecibo(idCita, body, (Long) auth.getPrincipal());
    }

    @GetMapping("/{idCita}/recibo")
    public org.springframework.http.ResponseEntity<pe.edu.karely.dto.atencion.ReciboResponseDTO>
            consultarRecibo(@PathVariable long idCita, Authentication auth) {
        var recibo = service.consultarRecibo(idCita, (Long) auth.getPrincipal());
        return recibo == null
                ? org.springframework.http.ResponseEntity.noContent().build()
                : org.springframework.http.ResponseEntity.ok()
                        .cacheControl(org.springframework.http.CacheControl.noStore())
                        .body(recibo);
    }

    @GetMapping(value = "/{idCita}/recibo/pdf", produces = "application/pdf")
    public org.springframework.http.ResponseEntity<byte[]> descargarRecibo(
            @PathVariable long idCita, Authentication auth) {
        return org.springframework.http.ResponseEntity.ok()
                .cacheControl(org.springframework.http.CacheControl.noStore())
                .header(
                        "Content-Disposition",
                        "attachment; filename=recibo-cita-" + idCita + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(service.descargarRecibo(idCita, (Long) auth.getPrincipal()));
    }

    @PostMapping("/recetas/{idReceta}/medicamentos")
    public OperacionResponseDTO medicamento(
            @PathVariable long idReceta,
            @Valid @RequestBody MedicamentoRequestDTO body,
            Authentication auth) {
        return service.agregarMedicamento(idReceta, body, (Long) auth.getPrincipal());
    }

    @PostMapping("/{idCita}/cerrar")
    public OperacionResponseDTO cerrar(@PathVariable long idCita, Authentication auth) {
        return service.cerrarAtencion(idCita, (Long) auth.getPrincipal());
    }
}

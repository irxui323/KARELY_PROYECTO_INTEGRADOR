package pe.edu.karely.controller.reportes;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import pe.edu.karely.dto.cita.CitaResponseDTO;
import pe.edu.karely.dto.reporte.IngresoResponseDTO;
import pe.edu.karely.dto.reporte.ResumenResponseDTO;
import pe.edu.karely.dto.reporte.TotalIngresoResponseDTO;
import pe.edu.karely.service.service.reportes.ReporteService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reportes")
public class ReporteController {
    private final ReporteService service;

    public ReporteController(ReporteService service) {
        this.service = service;
    }

    @GetMapping("/resumen")
    public List<ResumenResponseDTO> resumen(Authentication auth) {
        return service.generarResumen((Long) auth.getPrincipal());
    }

    @GetMapping("/citas")
    public List<CitaResponseDTO> citas(
            @RequestParam LocalDate desde,
            @RequestParam LocalDate hasta,
            @RequestParam(required = false) String estado,
            Authentication auth) {
        return service.generarReporte(desde, hasta, estado, (Long) auth.getPrincipal());
    }

    @GetMapping("/ingresos")
    public List<IngresoResponseDTO> ingresos(Authentication auth) {
        return service.listarIngresos((Long) auth.getPrincipal());
    }

    @GetMapping("/ingresos/doctores/{id}/total")
    public List<TotalIngresoResponseDTO> total(@PathVariable long id, Authentication auth) {
        return service.sumarIngresos(id, (Long) auth.getPrincipal());
    }
}

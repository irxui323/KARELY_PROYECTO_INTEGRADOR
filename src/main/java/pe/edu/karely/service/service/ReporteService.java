package pe.edu.karely.service.service;

import pe.edu.karely.dto.cita.CitaResponseDTO;
import pe.edu.karely.dto.reporte.IngresoResponseDTO;
import pe.edu.karely.dto.reporte.ResumenResponseDTO;
import pe.edu.karely.dto.reporte.TotalIngresoResponseDTO;

import java.util.List;

public interface ReporteService {
    List<ResumenResponseDTO> generarResumen(long actor);

    List<CitaResponseDTO> generarReporte(
            java.time.LocalDate desde, java.time.LocalDate hasta, String estado, long actor);

    List<IngresoResponseDTO> listarIngresos(long actor);

    List<TotalIngresoResponseDTO> sumarIngresos(long idDoctor, long actor);
}

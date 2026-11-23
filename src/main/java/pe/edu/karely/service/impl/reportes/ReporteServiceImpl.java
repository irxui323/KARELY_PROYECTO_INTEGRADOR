package pe.edu.karely.service.impl.reportes;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.cita.CitaResponseDTO;
import pe.edu.karely.dto.reporte.IngresoResponseDTO;
import pe.edu.karely.dto.reporte.ResumenResponseDTO;
import pe.edu.karely.dto.reporte.TotalIngresoResponseDTO;
import pe.edu.karely.repository.finanzas.IngresoRepository;
import pe.edu.karely.repository.reportes.ReporteRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.reportes.ReporteService;

import java.util.List;

@Service
public class ReporteServiceImpl implements ReporteService {
    private static final org.slf4j.Logger LOG =
            org.slf4j.LoggerFactory.getLogger(ReporteServiceImpl.class);
    private final ReporteRepository repository;
    private final IngresoRepository ingresos;
    private final PermisosUsuario permisos;

    public ReporteServiceImpl(
            ReporteRepository repository, IngresoRepository ingresos, PermisosUsuario permisos) {
        this.repository = repository;
        this.ingresos = ingresos;
        this.permisos = permisos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumenResponseDTO> generarResumen(long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "TESORERA", "RECEPCIONISTA");
        long inicio = System.nanoTime();
        LOG.info("Inicio consulta generarResumen");
        var resultado = repository.generarResumen();
        LOG.info(
                "Fin consulta generarResumen: filas={}, duracionMs={}",
                resultado.size(),
                (System.nanoTime() - inicio) / 1_000_000);
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponseDTO> generarReporte(
            java.time.LocalDate desde, java.time.LocalDate hasta, String estado, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA", "TESORERA");
        if (hasta.isBefore(desde)) {
            throw new IllegalArgumentException("Rango de fechas invÃ¡lido");
        }
        long inicio = System.nanoTime();
        LOG.info("Inicio consulta generarReporte");
        var resultado = repository.generarReporte(desde, hasta, estado);
        LOG.info(
                "Fin consulta generarReporte: filas={}, duracionMs={}",
                resultado.size(),
                (System.nanoTime() - inicio) / 1_000_000);
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngresoResponseDTO> listarIngresos(long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "TESORERA");
        long inicio = System.nanoTime();
        LOG.info("Inicio consulta listarIngresos");
        var resultado = ingresos.listarIngresos();
        LOG.info(
                "Fin consulta listarIngresos: filas={}, duracionMs={}",
                resultado.size(),
                (System.nanoTime() - inicio) / 1_000_000);
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TotalIngresoResponseDTO> sumarIngresos(long idDoctor, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "TESORERA");
        long inicio = System.nanoTime();
        LOG.info("Inicio consulta sumarIngresos");
        var resultado = ingresos.sumarIngresos(idDoctor);
        LOG.info(
                "Fin consulta sumarIngresos: filas={}, duracionMs={}",
                resultado.size(),
                (System.nanoTime() - inicio) / 1_000_000);
        return resultado;
    }
}

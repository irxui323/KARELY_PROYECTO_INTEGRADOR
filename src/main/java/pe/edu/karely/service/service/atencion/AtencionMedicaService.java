package pe.edu.karely.service.service.atencion;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.atencion.AtencionResponseDTO;
import pe.edu.karely.dto.atencion.DiagnosticoRequestDTO;
import pe.edu.karely.dto.atencion.EntregaReciboRequestDTO;
import pe.edu.karely.dto.atencion.MedicamentoRequestDTO;
import pe.edu.karely.dto.atencion.RecetaRequestDTO;
import pe.edu.karely.dto.atencion.ReciboRequestDTO;

import java.util.List;

public interface AtencionMedicaService {
    pe.edu.karely.dto.atencion.ReciboResponseDTO consultarRecibo(long idCita, long actor);

    byte[] descargarRecibo(long idCita, long actor);

    List<AtencionResponseDTO> listarAtenciones(long actor);

    OperacionResponseDTO iniciarAtencion(long idCita, long actor);

    OperacionResponseDTO registrarDiagnostico(long idCita, DiagnosticoRequestDTO i, long actor);

    OperacionResponseDTO registrarReceta(long idCita, RecetaRequestDTO i, long actor);

    OperacionResponseDTO agregarMedicamento(long idReceta, MedicamentoRequestDTO i, long actor);

    OperacionResponseDTO emitirRecibo(long idCita, ReciboRequestDTO i, long actor);

    OperacionResponseDTO entregarRecibo(long idCita, EntregaReciboRequestDTO i, long actor);

    OperacionResponseDTO cerrarAtencion(long idCita, long actor);
}

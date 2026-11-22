package pe.edu.karely.service.service;
import java.util.List;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.atencion.AtencionResponseDTO;
import pe.edu.karely.dto.atencion.DiagnosticoRequestDTO;
import pe.edu.karely.dto.atencion.EntregaReciboRequestDTO;
import pe.edu.karely.dto.atencion.MedicamentoRequestDTO;
import pe.edu.karely.dto.atencion.RecetaRequestDTO;
import pe.edu.karely.dto.atencion.ReciboRequestDTO;
public interface AtencionMedicaService {
List<AtencionResponseDTO> listarAtenciones(long actor);
OperacionResponseDTO iniciarAtencion(long idCita, long actor);
OperacionResponseDTO registrarDiagnostico(long idCita, DiagnosticoRequestDTO i, long actor);
OperacionResponseDTO registrarReceta(long idCita, RecetaRequestDTO i, long actor);
OperacionResponseDTO agregarMedicamento(long idReceta, MedicamentoRequestDTO i, long actor);
OperacionResponseDTO emitirRecibo(long idCita, ReciboRequestDTO i, long actor);
OperacionResponseDTO entregarRecibo(long idCita, EntregaReciboRequestDTO i, long actor);
OperacionResponseDTO cerrarAtencion(long idCita, long actor);
}

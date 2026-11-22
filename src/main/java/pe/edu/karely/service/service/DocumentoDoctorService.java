package pe.edu.karely.service.service;
import pe.edu.karely.repository.DocumentoDoctorRepository.Documento;
import java.util.List;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.doctor.DocumentoDoctorResponseDTO;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentoDoctorService {
OperacionResponseDTO subir(long idDoctor, String tipo, MultipartFile archivo, long actor) throws IOException;
List<DocumentoDoctorResponseDTO> listar(long idDoctor, long actor);
Documento descargar(long idDocumento, long actor);
}

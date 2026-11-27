package pe.edu.karely.service.service.doctores;

import org.springframework.web.multipart.MultipartFile;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.doctor.DocumentoDoctorResponseDTO;
import pe.edu.karely.repository.doctores.DocumentoDoctorRepository.Documento;

import java.io.IOException;
import java.util.List;

public interface DocumentoDoctorService {
    OperacionResponseDTO subir(long idDoctor, String tipo, MultipartFile archivo, long actor)
            throws IOException;

    List<DocumentoDoctorResponseDTO> listar(long idDoctor, long actor);

    Documento descargar(long idDocumento, long actor);
}

package pe.edu.karely.service.service;

import pe.edu.karely.dto.administracion.AuditoriaResponseDTO;

import java.util.List;

public interface AuditoriaService {
    List<AuditoriaResponseDTO> listarAuditoria(long actor);
}

package pe.edu.karely.service.service.administracion;

import pe.edu.karely.dto.administracion.AuditoriaResponseDTO;

import java.util.List;

public interface AuditoriaService {
    List<AuditoriaResponseDTO> listarAuditoria(long actor);

    pe.edu.karely.dto.PaginaResponseDTO<AuditoriaResponseDTO> listarAuditoriaPagina(
            int pagina, int tamanio, String filtro, long actor);
}

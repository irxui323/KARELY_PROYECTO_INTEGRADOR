package pe.edu.karely.service.service.catalogos;

import pe.edu.karely.dto.catalogo.ConsultaDniResponseDTO;

public interface ConsultaDniService {
    ConsultaDniResponseDTO consultar(String dni, long actor);
}

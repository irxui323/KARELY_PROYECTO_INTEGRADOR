package pe.edu.karely.service.service;

import pe.edu.karely.dto.auth.*;

public interface RecuperacionService {
    void solicitar(RecuperacionRequestDTO request, String ip);

    MensajeResponseDTO restablecer(RestablecerPasswordRequestDTO request);
}

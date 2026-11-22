package pe.edu.karely.service.service;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.finanzas.LiquidacionResponseDTO;
import pe.edu.karely.dto.finanzas.PagoDoctorRequestDTO;
import pe.edu.karely.dto.finanzas.SaldoDoctorResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface LiquidacionService {
    List<LiquidacionResponseDTO> listarLiquidaciones(long actor);

    SaldoDoctorResponseDTO consultarSaldo(long idDoctor, LocalDate fechaCorte, long actor);

    OperacionResponseDTO pagarDoctor(PagoDoctorRequestDTO request, long actor);
}

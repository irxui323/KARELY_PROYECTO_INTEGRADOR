package pe.edu.karely.service.impl.finanzas;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.finanzas.LiquidacionResponseDTO;
import pe.edu.karely.dto.finanzas.PagoDoctorRequestDTO;
import pe.edu.karely.dto.finanzas.SaldoDoctorResponseDTO;
import pe.edu.karely.repository.finanzas.LiquidacionRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.finanzas.LiquidacionService;

import java.time.LocalDate;
import java.util.List;

@Service
public class LiquidacionServiceImpl implements LiquidacionService {
    private final LiquidacionRepository repository;
    private final PermisosUsuario permisos;

    public LiquidacionServiceImpl(LiquidacionRepository repository, PermisosUsuario permisos) {
        this.repository = repository;
        this.permisos = permisos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LiquidacionResponseDTO> listarLiquidaciones(long actor) {
        permisos.exigir(actor, "TESORERA", "ADMINISTRADORA");
        return repository.listarLiquidaciones();
    }

    @Override
    @Transactional(readOnly = true)
    public SaldoDoctorResponseDTO consultarSaldo(long idDoctor, LocalDate fechaCorte, long actor) {
        permisos.exigir(actor, "TESORERA", "ADMINISTRADORA");
        return repository.saldoDoctor(idDoctor, fechaCorte);
    }

    @Override
    @Transactional
    public OperacionResponseDTO pagarDoctor(PagoDoctorRequestDTO i, long actor) {
        permisos.exigir(actor, "TESORERA", "ADMINISTRADORA");
        if (i.fechaFin().isBefore(i.fechaInicio()))
            throw new IllegalArgumentException("Rango de fechas inválido");
        String referencia =
                java.util
                        .UUID
                        .randomUUID()
                        .toString()
                        .replace("-", "")
                        .toUpperCase(java.util.Locale.ROOT);
        String operacion = "OP-" + referencia;
        String boleta = "BOL-" + referencia;
        Long id =
                repository.pagarDoctor(
                        actor,
                        actor,
                        i.idDoctor(),
                        i.fechaInicio(),
                        i.fechaFin(),
                        i.monto(),
                        i.metodoPago(),
                        operacion,
                        boleta);
        return new OperacionResponseDTO(
                "doctor-pagar",
                id,
                "Pago registrado. Operación: " + operacion + ". Boleta: " + boleta + ".");
    }

    @Override
    @Transactional(readOnly = true)
    public pe.edu.karely.dto.PaginaResponseDTO<LiquidacionResponseDTO> listarLiquidacionesPagina(
            int pagina, int tamanio, String filtro, long actor) {
        pe.edu.karely.dto.PaginaResponseDTO.validar(pagina, tamanio);
        permisos.exigir(actor, "TESORERA", "ADMINISTRADORA");
        return repository.listarLiquidacionesPagina(pagina, tamanio, filtro);
    }
}

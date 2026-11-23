package pe.edu.karely.controller.finanzas;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.finanzas.LiquidacionResponseDTO;
import pe.edu.karely.dto.finanzas.PagoDoctorRequestDTO;
import pe.edu.karely.dto.finanzas.SaldoDoctorResponseDTO;
import pe.edu.karely.service.service.finanzas.LiquidacionService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/liquidaciones")
public class LiquidacionController {
    private final LiquidacionService service;

    public LiquidacionController(LiquidacionService service) {
        this.service = service;
    }

    @GetMapping
    public List<LiquidacionResponseDTO> listar(Authentication auth) {
        return service.listarLiquidaciones((Long) auth.getPrincipal());
    }

    @PostMapping
    public OperacionResponseDTO pagar(
            @Valid @RequestBody PagoDoctorRequestDTO body, Authentication auth) {
        return service.pagarDoctor(body, (Long) auth.getPrincipal());
    }

    @GetMapping("/saldo")
    public SaldoDoctorResponseDTO saldo(
            @RequestParam long idDoctor, @RequestParam LocalDate fechaCorte, Authentication auth) {
        return service.consultarSaldo(idDoctor, fechaCorte, (Long) auth.getPrincipal());
    }
}

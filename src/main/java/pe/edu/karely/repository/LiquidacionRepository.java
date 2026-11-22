package pe.edu.karely.repository;

import pe.edu.karely.dto.finanzas.LiquidacionResponseDTO;
import pe.edu.karely.dto.finanzas.SaldoDoctorResponseDTO;
import java.util.List;
import pe.edu.karely.repository.OracleJdbc;
import org.springframework.stereotype.Repository;

@Repository
public class LiquidacionRepository {
    private final OracleJdbc jdbc;
    public LiquidacionRepository(OracleJdbc jdbc) {
        this.jdbc = jdbc;
    }
    public List<LiquidacionResponseDTO> listarLiquidaciones() {
        return jdbc.list(LiquidacionResponseDTO.class, "SELECT ID_LIQUIDACION, ID_DOCTOR, NOMBRE_DOCTOR, PERIODO_INICIO, PERIODO_FIN, MONTO_PAGADO, METODO_PAGO, NUMERO_OPERACION, NUMERO_BOLETA, FECHA_PAGO, SALDO_PENDIENTE FROM VW_SALDOS_LIQUIDACIONES ORDER BY ID_LIQUIDACION DESC FETCH FIRST 200 ROWS ONLY");
    }
    public Long pagarDoctor(long actor, long usuario, Long idDoctor, java.time.LocalDate fechaInicio, java.time.LocalDate fechaFin, java.math.BigDecimal monto, String metodoPago, String numeroOperacion, String numeroBoleta) {
        return jdbc.callId("SP_PAGAR_DOCTOR", actor, usuario, idDoctor, fechaInicio, fechaFin, monto, metodoPago, numeroOperacion, numeroBoleta, OracleJdbc.outNumber());
    }

    public SaldoDoctorResponseDTO saldoDoctor(long idDoctor, java.time.LocalDate fechaCorte) {
        return jdbc.one(SaldoDoctorResponseDTO.class,
                "SELECT ? AS ID_DOCTOR, ? AS FECHA_CORTE, FN_SALDO_DOCTOR(?, ?) AS SALDO_PENDIENTE FROM DUAL",
                idDoctor, fechaCorte, idDoctor, fechaCorte);
    }
}

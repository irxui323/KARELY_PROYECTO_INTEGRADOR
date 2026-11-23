package pe.edu.karely.repository.finanzas;

import pe.edu.karely.repository.OracleJdbc;

import org.springframework.stereotype.Repository;

import pe.edu.karely.dto.reporte.IngresoResponseDTO;
import pe.edu.karely.dto.reporte.TotalIngresoResponseDTO;

import java.util.List;

@Repository
public class IngresoRepository {
    private final OracleJdbc jdbc;

    public IngresoRepository(OracleJdbc jdbc) {
        this.jdbc = jdbc;
    }

    public List<IngresoResponseDTO> listarIngresos() {
        return jdbc.list(
                IngresoResponseDTO.class,
                "SELECT ID_CITA, ID_DOCTOR, FECHA_CITA, CONCEPTO, MONTO_INGRESO FROM"
                    + " VW_INGRESOS_GESTORA ORDER BY FECHA_CITA DESC FETCH FIRST 200 ROWS ONLY");
    }

    public List<TotalIngresoResponseDTO> sumarIngresos(long doctor) {
        return jdbc.list(
                TotalIngresoResponseDTO.class,
                """
                SELECT NVL(SUM(MONTO_INGRESO), 0) AS TOTAL
                FROM VW_INGRESOS_GESTORA WHERE ID_DOCTOR = ?
                """,
                doctor);
    }
}

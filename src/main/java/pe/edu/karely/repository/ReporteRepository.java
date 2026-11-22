package pe.edu.karely.repository;

import org.springframework.stereotype.Repository;

import pe.edu.karely.dto.cita.CitaResponseDTO;
import pe.edu.karely.dto.reporte.ResumenResponseDTO;

import java.util.List;

@Repository
public class ReporteRepository {
    private final OracleJdbc jdbc;

    public ReporteRepository(OracleJdbc jdbc) {
        this.jdbc = jdbc;
    }

    public List<ResumenResponseDTO> generarResumen() {
        return jdbc.list(
                ResumenResponseDTO.class,
                "SELECT FECHA_CITA, ID_DOCTOR, NOMBRE_DOCTOR, TOTAL_CITAS, TOTAL_PROGRAMADAS,"
                    + " TOTAL_REPROGRAMADAS, TOTAL_EN_ATENCION, TOTAL_ATENDIDAS, TOTAL_PERDIDAS,"
                    + " TOTAL_CANCELADAS, MONTO_ATENDIDO FROM VW_RESUMEN_CITAS_DIARIAS ORDER BY"
                    + " FECHA_CITA DESC FETCH FIRST 100 ROWS ONLY");
    }

    public List<CitaResponseDTO> generarReporte(
            java.time.LocalDate desde, java.time.LocalDate hasta, String estado) {
        return jdbc.list(
                CitaResponseDTO.class,
                """
                SELECT ID_CITA, FECHA_CITA, HORA_INICIO, HORA_FIN, ID_DOCTOR, NOMBRE_DOCTOR, ID_PACIENTE, NOMBRE_PACIENTE, ID_ESPECIALIDAD, ESPECIALIDAD, ID_CONSULTORIO, CONSULTORIO, ESTADO_CITA, REPROGRAMACIONES, ASISTENCIA_REGISTRADA, MONTO_TOTAL FROM VW_AGENDA_CITAS
                WHERE FECHA_CITA >= ? AND FECHA_CITA <= ? AND (? IS NULL OR ESTADO_CITA = ?)
                ORDER BY FECHA_CITA DESC, HORA_INICIO, ID_CITA
                """,
                desde,
                hasta,
                estado,
                estado);
    }
}

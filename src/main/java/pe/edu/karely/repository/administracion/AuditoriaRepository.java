package pe.edu.karely.repository.administracion;

import pe.edu.karely.repository.OracleJdbc;

import org.springframework.stereotype.Repository;

import pe.edu.karely.dto.administracion.AuditoriaResponseDTO;

import java.util.List;

@Repository
public class AuditoriaRepository {
    private final OracleJdbc jdbc;

    public AuditoriaRepository(OracleJdbc jdbc) {
        this.jdbc = jdbc;
    }

    public List<AuditoriaResponseDTO> listarAuditoria() {
        return jdbc.list(
                AuditoriaResponseDTO.class,
                "SELECT"
                    + " ID_AUDITORIA,ID_USUARIO,TABLA_AFECTADA,ID_REGISTRO,ACCION,DETALLE,FECHA_OPERACION,ORIGEN,ESTADO_ANTERIOR,ESTADO_NUEVO"
                    + " FROM AUDITORIA ORDER BY FECHA_OPERACION DESC FETCH FIRST 200 ROWS ONLY");
    }

    public void registrar(long actor, String tabla, Object id, String accion, String detalle) {
        jdbc.update(
                "INSERT INTO AUDITORIA"
                    + " (ID_USUARIO,TABLA_AFECTADA,ID_REGISTRO,ACCION,DETALLE,ORIGEN) VALUES"
                    + " (?,?,?,?,?,'USUARIO')",
                actor,
                tabla,
                id,
                accion,
                detalle);
    }
}

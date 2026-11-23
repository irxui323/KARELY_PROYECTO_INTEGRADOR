package pe.edu.karely.repository.doctores;

import pe.edu.karely.repository.OracleJdbc;

import org.springframework.stereotype.Repository;

import pe.edu.karely.dto.doctor.DocumentoDoctorResponseDTO;

import java.util.List;

@Repository
public class DocumentoDoctorRepository {
    public int rechazar(long doctor, long documento, long actor) {
        return jdbc.update(
                "UPDATE DOCUMENTO_DOCTOR SET"
                    + " ESTADO='RECHAZADO',USUARIO_VALIDACION=?,FECHA_VALIDACION=SYSTIMESTAMP WHERE"
                    + " ID_DOCUMENTO=? AND ID_DOCTOR=?",
                actor,
                documento,
                doctor);
    }

    private final OracleJdbc jdbc;

    public DocumentoDoctorRepository(OracleJdbc jdbc) {
        this.jdbc = jdbc;
    }

    public Long insertar(long doctor, String tipo, String nombre, String mime, byte[] bytes) {
        return jdbc.insertReturning(
                "begin insert into"
                    + " DOCUMENTO_DOCTOR(ID_DOCTOR,TIPO_DOCUMENTO,NOMBRE_ARCHIVO,TIPO_MIME,ARCHIVO)"
                    + " values(?,?,?,?,?) returning ID_DOCUMENTO into ?; end;",
                doctor,
                tipo,
                nombre,
                mime,
                bytes);
    }

    public List<DocumentoDoctorResponseDTO> listarDocumentos(long doctor) {
        return jdbc.list(
                DocumentoDoctorResponseDTO.class,
                """
                SELECT D.ID_DOCUMENTO,D.ID_DOCTOR,D.TIPO_DOCUMENTO,D.NOMBRE_ARCHIVO,D.TIPO_MIME,D.ESTADO,D.FECHA_VALIDACION,
                (SELECT MAX(A.DETALLE) KEEP (DENSE_RANK LAST ORDER BY A.ID_AUDITORIA)
                 FROM AUDITORIA A WHERE A.TABLA_AFECTADA='DOCUMENTO_DOCTOR' AND A.ID_REGISTRO=D.ID_DOCUMENTO AND A.ACCION='RECHAZAR') AS MOTIVO_RECHAZO
                FROM DOCUMENTO_DOCTOR D WHERE D.ID_DOCTOR=? ORDER BY D.ID_DOCUMENTO DESC
                """,
                doctor);
    }

    public List<Documento> obtener(long id) {
        return jdbc.query(
                "SELECT NOMBRE_ARCHIVO,TIPO_MIME,ARCHIVO FROM DOCUMENTO_DOCTOR WHERE"
                    + " ID_DOCUMENTO=?",
                (rs, row) ->
                        new Documento(
                                rs.getString("NOMBRE_ARCHIVO"),
                                rs.getString("TIPO_MIME"),
                                rs.getBytes("ARCHIVO")),
                id);
    }

    public record Documento(String nombre, String mime, byte[] bytes) {}
}

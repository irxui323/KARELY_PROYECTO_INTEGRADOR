package pe.edu.karely.repository.auth;

import pe.edu.karely.repository.OracleJdbc;

import org.springframework.stereotype.Repository;

import pe.edu.karely.dto.auth.RolActivoDTO;

import java.util.List;

@Repository
public class SesionRepository {
    private final OracleJdbc jdbc;

    public SesionRepository(OracleJdbc jdbc) {
        this.jdbc = jdbc;
    }

    public Long abrir(long id) {
        return jdbc.insertReturning(
                "begin insert into SESION_USUARIO(ID_USUARIO) values(?) returning ID_SESION into ?;"
                    + " end;",
                id);
    }

    public void cerrar(long sessionId, long userId) {
        jdbc.update(
                "UPDATE SESION_USUARIO SET ESTADO='CERRADA',FECHA_FIN=SYSTIMESTAMP WHERE"
                    + " ID_SESION=? AND ID_USUARIO=? AND ESTADO='ACTIVA'",
                sessionId,
                userId);
    }

    public List<RolActivoDTO> buscarSesionActiva(long sesion, long usuario) {
        return jdbc.list(
                RolActivoDTO.class,
                """
                SELECT R.NOMBRE AS ROL FROM SESION_USUARIO S JOIN USUARIO U ON U.ID_USUARIO=S.ID_USUARIO
                JOIN ROL R ON R.ID_ROL=U.ID_ROL
                WHERE S.ID_SESION=? AND U.ID_USUARIO=? AND S.ESTADO='ACTIVA'
                AND U.ESTADO='ACTIVO' AND R.ESTADO='ACTIVO' AND S.ULTIMA_ACTIVIDAD >= SYSTIMESTAMP - NUMTODSINTERVAL((SELECT TO_NUMBER(VALOR) FROM PARAMETRO_SISTEMA WHERE NOMBRE='SESION_MINUTOS' AND ESTADO='ACTIVO'), 'MINUTE')\
                """,
                sesion,
                usuario);
    }

    public void actualizarActividad(long sesion) {
        jdbc.update(
                "UPDATE SESION_USUARIO SET ULTIMA_ACTIVIDAD=SYSTIMESTAMP WHERE ID_SESION=?",
                sesion);
    }
}

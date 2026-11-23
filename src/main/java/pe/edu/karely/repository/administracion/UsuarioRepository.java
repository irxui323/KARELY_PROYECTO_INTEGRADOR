package pe.edu.karely.repository.administracion;

import pe.edu.karely.repository.OracleJdbc;

import org.springframework.stereotype.Repository;

import pe.edu.karely.dto.administracion.RolResponseDTO;
import pe.edu.karely.dto.administracion.UsuarioResponseDTO;
import pe.edu.karely.dto.auth.ConteoDTO;
import pe.edu.karely.dto.auth.CredencialesDTO;
import pe.edu.karely.dto.auth.IdRolDTO;
import pe.edu.karely.dto.auth.IdUsuarioDTO;
import pe.edu.karely.dto.auth.RolActivoDTO;

import java.util.List;

@Repository
public class UsuarioRepository {
    public IdRolDTO buscarRolDoctor() {
        return jdbc.one(
                IdRolDTO.class, "SELECT ID_ROL FROM ROL WHERE NOMBRE='DOCTOR' AND ESTADO='ACTIVO'");
    }

    private final OracleJdbc jdbc;

    public UsuarioRepository(OracleJdbc jdbc) {
        this.jdbc = jdbc;
    }

    public List<RolResponseDTO> listarRoles() {
        return jdbc.list(
                RolResponseDTO.class, "SELECT ID_ROL,NOMBRE,ESTADO FROM ROL ORDER BY ID_ROL");
    }

    public List<UsuarioResponseDTO> listarUsuarios() {
        return jdbc.list(
                UsuarioResponseDTO.class,
                "SELECT U.ID_USUARIO,U.USERNAME,U.CORREO,U.ESTADO,U.ULTIMO_ACCESO,R.NOMBRE AS ROL"
                    + " FROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL ORDER BY U.ID_USUARIO DESC"
                    + " FETCH FIRST 200 ROWS ONLY");
    }

    public void asignarRol(long actor, long usuario, Long idUsuario, Long idRol) {
        jdbc.call("SP_CAMBIAR_ROL_USUARIO", actor, usuario, idUsuario, idRol);
    }

    public void cambiarEstado(long actor, long usuario, Long idUsuario, String estado) {
        jdbc.call("SP_CAMBIAR_ESTADO_USUARIO", actor, usuario, idUsuario, estado);
    }

    public RolActivoDTO rolActivo(long actor) {
        return jdbc.one(
                RolActivoDTO.class,
                "SELECT R.NOMBRE AS ROL FROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL WHERE"
                    + " U.ID_USUARIO=? AND U.ESTADO='ACTIVO' AND R.ESTADO='ACTIVO'",
                actor);
    }

    public IdUsuarioDTO buscarDoctorActivo(long usuario) {
        return jdbc.one(
                IdUsuarioDTO.class,
                "SELECT U.ID_USUARIO FROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL WHERE"
                    + " U.ID_USUARIO=? AND U.ESTADO='ACTIVO' AND R.NOMBRE='DOCTOR'",
                usuario);
    }

    public CredencialesDTO buscarCredenciales(String username) {
        return jdbc.one(
                CredencialesDTO.class,
                "SELECT U.ID_USUARIO,U.PASSWORD_HASH,U.ESTADO,U.INTENTOS_FALLIDOS,R.NOMBRE AS ROL"
                    + " FROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL WHERE U.USERNAME=? AND"
                    + " R.ESTADO='ACTIVO'",
                username);
    }

    public CredencialesDTO bloquearCredenciales(long id) {
        var usuario =
                jdbc.one(
                        IdUsuarioDTO.class,
                        "SELECT ID_USUARIO FROM USUARIO WHERE ID_USUARIO=? FOR UPDATE",
                        id);
        if (usuario == null) return null;
        return jdbc.one(
                CredencialesDTO.class,
                "SELECT U.ID_USUARIO,U.PASSWORD_HASH,U.ESTADO,R.NOMBRE AS ROL FROM USUARIO U JOIN"
                    + " ROL R ON R.ID_ROL=U.ID_ROL WHERE U.ID_USUARIO=? AND R.ESTADO='ACTIVO'",
                id);
    }

    public void registrarAcceso(long id) {
        jdbc.update(
                "UPDATE USUARIO SET INTENTOS_FALLIDOS=0,ULTIMO_ACCESO=SYSTIMESTAMP WHERE"
                    + " ID_USUARIO=?",
                id);
    }

    public UsuarioResponseDTO buscarPerfil(long id) {
        return jdbc.one(
                UsuarioResponseDTO.class,
                "SELECT U.ID_USUARIO,U.USERNAME,U.CORREO,U.ESTADO,U.ULTIMO_ACCESO,R.NOMBRE AS ROL"
                    + " FROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL WHERE U.ID_USUARIO=?",
                id);
    }

    public void registrarIntentoFallido(long userId) {
        jdbc.update(
                "UPDATE USUARIO SET INTENTOS_FALLIDOS=INTENTOS_FALLIDOS+1,ESTADO=CASE WHEN"
                    + " INTENTOS_FALLIDOS+1>=5 THEN 'BLOQUEADO' ELSE ESTADO END WHERE ID_USUARIO=?"
                    + " AND ESTADO='ACTIVO'",
                userId);
    }

    public ConteoDTO contarAdministradorasActivas() {
        return jdbc.one(
                ConteoDTO.class,
                "SELECT COUNT(*) AS TOTAL FROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL WHERE"
                    + " R.NOMBRE='ADMINISTRADORA' AND U.ESTADO='ACTIVO'");
    }

    public IdRolDTO buscarRolAdministradora() {
        return jdbc.one(
                IdRolDTO.class,
                "SELECT ID_ROL FROM ROL WHERE NOMBRE='ADMINISTRADORA' AND ESTADO='ACTIVO'");
    }

    public Long crearAdministradoraInicial(Long rol, String usuario, String correo, String hash) {
        return jdbc.insertReturning(
                "begin insert into USUARIO(ID_ROL,USERNAME,CORREO,PASSWORD_HASH) values(?,?,?,?)"
                    + " returning ID_USUARIO into ?; end;",
                rol,
                usuario,
                correo,
                hash);
    }

    public Long crearUsuario(long actor, long rol, String nombre, String correo, String hash) {
        return jdbc.callId(
                "SP_CREAR_USUARIO",
                actor,
                actor,
                rol,
                nombre,
                correo,
                hash,
                OracleJdbc.outNumber());
    }
}

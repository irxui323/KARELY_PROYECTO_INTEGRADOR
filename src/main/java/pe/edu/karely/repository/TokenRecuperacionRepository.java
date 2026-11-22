package pe.edu.karely.repository;

import jakarta.persistence.*;
import org.springframework.stereotype.Repository;
import pe.edu.karely.entity.*;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public class TokenRecuperacionRepository {
    @PersistenceContext private EntityManager em;
    public Optional<Usuario> bloquearUsuarioPorCorreo(String correo) {
        return em.createQuery("select u from Usuario u where lower(u.correo)=:correo",Usuario.class).setParameter("correo",correo).setLockMode(LockModeType.PESSIMISTIC_WRITE).getResultStream().findFirst();
    }
    public Optional<Usuario> bloquearUsuario(Long id) { return Optional.ofNullable(em.find(Usuario.class,id,LockModeType.PESSIMISTIC_WRITE)); }
    public Optional<Long> buscarUsuarioId(String hash) { return em.createQuery("select t.idUsuario from TokenRecuperacion t where t.tokenHash=:hash",Long.class).setParameter("hash",hash).getResultStream().findFirst(); }
    public Optional<TokenRecuperacion> bloquearToken(String hash) { return Optional.ofNullable(em.find(TokenRecuperacion.class,hash,LockModeType.PESSIMISTIC_WRITE)); }
    public void guardar(TokenRecuperacion token) { em.persist(token); }
    public void invalidarTokens(Long id, LocalDateTime now) { em.createQuery("update TokenRecuperacion t set t.fechaUso=:now where t.idUsuario=:id and t.fechaUso is null").setParameter("id",id).setParameter("now",now).executeUpdate(); }
    public void invalidarToken(String hash, LocalDateTime now) { em.createQuery("update TokenRecuperacion t set t.fechaUso=:now where t.tokenHash=:hash and t.fechaUso is null").setParameter("hash",hash).setParameter("now",now).executeUpdate(); }
    public void revocarSesiones(Long id, LocalDateTime now) { em.createQuery("update SesionUsuario s set s.estado='CERRADA',s.fechaFin=:now where s.usuario.idUsuario=:id and s.estado='ACTIVA'").setParameter("id",id).setParameter("now",now).executeUpdate(); }
    public void registrarRestablecimiento(Usuario usuario, LocalDateTime now) {
        Auditoria auditoria=new Auditoria(); auditoria.setUsuario(usuario); auditoria.setTablaAfectada("USUARIO"); auditoria.setIdRegistro(usuario.getIdUsuario()); auditoria.setAccion("RESTABLECER"); auditoria.setDetalle("Contraseña restablecida mediante recuperación por correo"); auditoria.setFechaOperacion(now); auditoria.setOrigen("USUARIO"); em.persist(auditoria);
    }
}


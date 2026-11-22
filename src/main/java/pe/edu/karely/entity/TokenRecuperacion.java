package pe.edu.karely.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="TOKEN_RECUPERACION")
public class TokenRecuperacion {
    @Id @Column(name="TOKEN_HASH",length=64,nullable=false)
    private String tokenHash;
    @Column(name="ID_USUARIO",nullable=false)
    private Long idUsuario;
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(name="ID_USUARIO",insertable=false,updatable=false,nullable=false)
    private Usuario usuario;
    @Column(name="CORREO",length=150,nullable=false)
    private String correo;
    @Column(name="VERSION_CREDENCIAL",length=64,nullable=false)
    private String versionCredencial;
    @Column(name="FECHA_CREACION",nullable=false)
    private LocalDateTime fechaCreacion;
    @Column(name="FECHA_EXPIRACION",nullable=false)
    private LocalDateTime fechaExpiracion;
    @Column(name="FECHA_USO")
    private LocalDateTime fechaUso;
    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String value) { tokenHash=value; }
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long value) { idUsuario=value; }
    public Usuario getUsuario() { return usuario; }
    public String getCorreo() { return correo; }
    public void setCorreo(String value) { correo=value; }
    public String getVersionCredencial() { return versionCredencial; }
    public void setVersionCredencial(String value) { versionCredencial=value; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime value) { fechaCreacion=value; }
    public LocalDateTime getFechaExpiracion() { return fechaExpiracion; }
    public void setFechaExpiracion(LocalDateTime value) { fechaExpiracion=value; }
    public LocalDateTime getFechaUso() { return fechaUso; }
    public void setFechaUso(LocalDateTime value) { fechaUso=value; }
}


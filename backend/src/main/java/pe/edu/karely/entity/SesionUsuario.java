package pe.edu.karely.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "SESION_USUARIO")
public class SesionUsuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_SESION", nullable = false)
    private Long idSesion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_USUARIO", nullable = false)
    private Usuario usuario;

    @Column(name = "FECHA_INICIO", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "FECHA_FIN")
    private LocalDateTime fechaFin;

    @Column(name = "ULTIMA_ACTIVIDAD", nullable = false)
    private LocalDateTime ultimaActividad;

    @Column(name = "IP_ORIGEN", length = 45)
    private String ipOrigen;

    @Column(name = "ESTADO", nullable = false, length = 10)
    private String estado;

    public Long getIdSesion() {
        return idSesion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }

    public LocalDateTime getUltimaActividad() {
        return ultimaActividad;
    }

    public void setUltimaActividad(LocalDateTime ultimaActividad) {
        this.ultimaActividad = ultimaActividad;
    }

    public String getIpOrigen() {
        return ipOrigen;
    }

    public void setIpOrigen(String ipOrigen) {
        this.ipOrigen = ipOrigen;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}

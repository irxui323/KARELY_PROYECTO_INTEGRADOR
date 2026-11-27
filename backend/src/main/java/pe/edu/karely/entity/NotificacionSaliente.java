package pe.edu.karely.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "NOTIFICACION_SALIENTE")
public class NotificacionSaliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_NOTIFICACION", nullable = false)
    private Long idNotificacion;

    @Column(name = "TIPO", nullable = false, length = 30)
    private String tipo;

    @Column(name = "CANAL", nullable = false, length = 12)
    private String canal;

    @Column(name = "DESTINATARIO", length = 200)
    private String destinatario;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "ID_CITA")
    private Cita cita;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "ID_LIQUIDACION")
    private Liquidacion liquidacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "ID_USUARIO_CREACION")
    private Usuario usuarioCreacion;

    @Column(name = "CODIGO_EVENTO", nullable = false, length = 120)
    private String codigoEvento;

    @Column(name = "ESTADO", nullable = false, length = 12)
    private String estado;

    @Column(name = "INTENTOS", nullable = false)
    private Integer intentos;

    @Column(name = "FECHA_CREACION", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "FECHA_PROXIMO_INTENTO", nullable = false)
    private LocalDateTime fechaProximoIntento;

    @Column(name = "FECHA_ENVIO")
    private LocalDateTime fechaEnvio;

    @Column(name = "ULTIMO_ERROR", length = 500)
    private String ultimoError;

    public Long getIdNotificacion() {
        return idNotificacion;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getCanal() {
        return canal;
    }

    public void setCanal(String canal) {
        this.canal = canal;
    }

    public String getDestinatario() {
        return destinatario;
    }

    public void setDestinatario(String destinatario) {
        this.destinatario = destinatario;
    }

    public Cita getCita() {
        return cita;
    }

    public void setCita(Cita cita) {
        this.cita = cita;
    }

    public Liquidacion getLiquidacion() {
        return liquidacion;
    }

    public void setLiquidacion(Liquidacion liquidacion) {
        this.liquidacion = liquidacion;
    }

    public Usuario getUsuarioCreacion() {
        return usuarioCreacion;
    }

    public void setUsuarioCreacion(Usuario usuarioCreacion) {
        this.usuarioCreacion = usuarioCreacion;
    }

    public String getCodigoEvento() {
        return codigoEvento;
    }

    public void setCodigoEvento(String codigoEvento) {
        this.codigoEvento = codigoEvento;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getIntentos() {
        return intentos;
    }

    public void setIntentos(Integer intentos) {
        this.intentos = intentos;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaProximoIntento() {
        return fechaProximoIntento;
    }

    public void setFechaProximoIntento(LocalDateTime fechaProximoIntento) {
        this.fechaProximoIntento = fechaProximoIntento;
    }

    public LocalDateTime getFechaEnvio() {
        return fechaEnvio;
    }

    public void setFechaEnvio(LocalDateTime fechaEnvio) {
        this.fechaEnvio = fechaEnvio;
    }

    public String getUltimoError() {
        return ultimoError;
    }

    public void setUltimoError(String ultimoError) {
        this.ultimoError = ultimoError;
    }
}

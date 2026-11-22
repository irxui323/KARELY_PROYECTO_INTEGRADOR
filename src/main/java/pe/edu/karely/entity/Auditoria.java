package pe.edu.karely.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "AUDITORIA")
public class Auditoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_AUDITORIA", nullable = false)
    private Long idAuditoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "ID_USUARIO")
    private Usuario usuario;

    @Column(name = "TABLA_AFECTADA", nullable = false, length = 40)
    private String tablaAfectada;

    @Column(name = "ID_REGISTRO")
    private Long idRegistro;

    @Column(name = "ACCION", nullable = false, length = 20)
    private String accion;

    @Column(name = "DETALLE", length = 500)
    private String detalle;

    @Column(name = "FECHA_OPERACION", nullable = false)
    private LocalDateTime fechaOperacion;

    @Column(name = "ESTADO_ANTERIOR", length = 30)
    private String estadoAnterior;

    @Column(name = "ESTADO_NUEVO", length = 30)
    private String estadoNuevo;

    @Column(name = "ORIGEN", nullable = false, length = 12)
    private String origen;

    public Long getIdAuditoria() {
        return idAuditoria;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getTablaAfectada() {
        return tablaAfectada;
    }

    public void setTablaAfectada(String tablaAfectada) {
        this.tablaAfectada = tablaAfectada;
    }

    public Long getIdRegistro() {
        return idRegistro;
    }

    public void setIdRegistro(Long idRegistro) {
        this.idRegistro = idRegistro;
    }

    public String getAccion() {
        return accion;
    }

    public void setAccion(String accion) {
        this.accion = accion;
    }

    public String getDetalle() {
        return detalle;
    }

    public void setDetalle(String detalle) {
        this.detalle = detalle;
    }

    public LocalDateTime getFechaOperacion() {
        return fechaOperacion;
    }

    public void setFechaOperacion(LocalDateTime fechaOperacion) {
        this.fechaOperacion = fechaOperacion;
    }

    public String getEstadoAnterior() {
        return estadoAnterior;
    }

    public void setEstadoAnterior(String estadoAnterior) {
        this.estadoAnterior = estadoAnterior;
    }

    public String getEstadoNuevo() {
        return estadoNuevo;
    }

    public void setEstadoNuevo(String estadoNuevo) {
        this.estadoNuevo = estadoNuevo;
    }

    public String getOrigen() {
        return origen;
    }

    public void setOrigen(String origen) {
        this.origen = origen;
    }
}

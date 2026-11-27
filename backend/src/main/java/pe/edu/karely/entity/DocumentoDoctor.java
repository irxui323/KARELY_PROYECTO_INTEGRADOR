package pe.edu.karely.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "DOCUMENTO_DOCTOR")
public class DocumentoDoctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_DOCUMENTO", nullable = false)
    private Long idDocumento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_DOCTOR", nullable = false)
    private Doctor doctor;

    @Column(name = "TIPO_DOCUMENTO", nullable = false, length = 12)
    private String tipoDocumento;

    @Column(name = "NOMBRE_ARCHIVO", nullable = false, length = 255)
    private String nombreArchivo;

    @Column(name = "TIPO_MIME", nullable = false, length = 100)
    private String tipoMime;

    @Lob
    @Column(name = "ARCHIVO", nullable = false)
    private byte[] archivo;

    @Column(name = "HASH", length = 128)
    private String hash;

    @Column(name = "ESTADO", nullable = false, length = 12)
    private String estado;

    @Column(name = "FECHA_VALIDACION")
    private LocalDateTime fechaValidacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "USUARIO_VALIDACION")
    private Usuario usuarioValidacion;

    public Long getIdDocumento() {
        return idDocumento;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public String getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(String tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public String getTipoMime() {
        return tipoMime;
    }

    public void setTipoMime(String tipoMime) {
        this.tipoMime = tipoMime;
    }

    public byte[] getArchivo() {
        return archivo;
    }

    public void setArchivo(byte[] archivo) {
        this.archivo = archivo;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaValidacion() {
        return fechaValidacion;
    }

    public void setFechaValidacion(LocalDateTime fechaValidacion) {
        this.fechaValidacion = fechaValidacion;
    }

    public Usuario getUsuarioValidacion() {
        return usuarioValidacion;
    }

    public void setUsuarioValidacion(Usuario usuarioValidacion) {
        this.usuarioValidacion = usuarioValidacion;
    }
}

package pe.edu.karely.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "REPROGRAMACION_CITA")
public class ReprogramacionCita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_REPROGRAMACION", nullable = false)
    private Long idReprogramacion;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_CITA", nullable = false)
    private Cita cita;

    @Column(name = "FECHA_ORIGINAL", nullable = false)
    private LocalDate fechaOriginal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_FRANJA_ORIGINAL", nullable = false)
    private FranjaHoraria franjaOriginal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_CONSULTORIO_ORIGINAL", nullable = false)
    private Consultorio consultorioOriginal;

    @Column(name = "FECHA_NUEVA", nullable = false)
    private LocalDate fechaNueva;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_FRANJA_NUEVA", nullable = false)
    private FranjaHoraria franjaNueva;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_CONSULTORIO_NUEVO", nullable = false)
    private Consultorio consultorioNuevo;

    @Column(name = "MOTIVO", nullable = false, length = 500)
    private String motivo;

    @Column(name = "ACEPTACION_PACIENTE", nullable = false)
    private Character aceptacionPaciente;

    @Column(name = "FECHA_ACEPTACION", nullable = false)
    private LocalDateTime fechaAceptacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_USUARIO_ACEPTACION", nullable = false)
    private Usuario usuarioAceptacion;

    @Column(name = "FECHA_REGISTRO", nullable = false)
    private LocalDateTime fechaRegistro;

    public Long getIdReprogramacion() {
        return idReprogramacion;
    }

    public Cita getCita() {
        return cita;
    }

    public void setCita(Cita cita) {
        this.cita = cita;
    }

    public LocalDate getFechaOriginal() {
        return fechaOriginal;
    }

    public void setFechaOriginal(LocalDate fechaOriginal) {
        this.fechaOriginal = fechaOriginal;
    }

    public FranjaHoraria getFranjaOriginal() {
        return franjaOriginal;
    }

    public void setFranjaOriginal(FranjaHoraria franjaOriginal) {
        this.franjaOriginal = franjaOriginal;
    }

    public Consultorio getConsultorioOriginal() {
        return consultorioOriginal;
    }

    public void setConsultorioOriginal(Consultorio consultorioOriginal) {
        this.consultorioOriginal = consultorioOriginal;
    }

    public LocalDate getFechaNueva() {
        return fechaNueva;
    }

    public void setFechaNueva(LocalDate fechaNueva) {
        this.fechaNueva = fechaNueva;
    }

    public FranjaHoraria getFranjaNueva() {
        return franjaNueva;
    }

    public void setFranjaNueva(FranjaHoraria franjaNueva) {
        this.franjaNueva = franjaNueva;
    }

    public Consultorio getConsultorioNuevo() {
        return consultorioNuevo;
    }

    public void setConsultorioNuevo(Consultorio consultorioNuevo) {
        this.consultorioNuevo = consultorioNuevo;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public Character getAceptacionPaciente() {
        return aceptacionPaciente;
    }

    public void setAceptacionPaciente(Character aceptacionPaciente) {
        this.aceptacionPaciente = aceptacionPaciente;
    }

    public LocalDateTime getFechaAceptacion() {
        return fechaAceptacion;
    }

    public void setFechaAceptacion(LocalDateTime fechaAceptacion) {
        this.fechaAceptacion = fechaAceptacion;
    }

    public Usuario getUsuarioAceptacion() {
        return usuarioAceptacion;
    }

    public void setUsuarioAceptacion(Usuario usuarioAceptacion) {
        this.usuarioAceptacion = usuarioAceptacion;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}

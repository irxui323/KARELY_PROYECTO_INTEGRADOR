package pe.edu.karely.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "CITA")
public class Cita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_CITA", nullable = false)
    private Long idCita;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_PRE_RESERVA", nullable = false)
    private PreReservaCita preReserva;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_PACIENTE", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_DOCTOR", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_ESPECIALIDAD", nullable = false)
    private Especialidad especialidad;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_CONSULTORIO", nullable = false)
    private Consultorio consultorio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_FRANJA", nullable = false)
    private FranjaHoraria franja;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_PAGO", nullable = false)
    private PagoCita pago;

    @Column(name = "FECHA_CITA", nullable = false)
    private LocalDate fechaCita;

    @Column(name = "MONTO_TOTAL", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoTotal;

    @Column(name = "MONTO_DOCTOR_DEVENGADO", precision = 12, scale = 2)
    private BigDecimal montoDoctorDevengado;

    @Column(name = "MONTO_GESTORA_DEVENGADO", precision = 12, scale = 2)
    private BigDecimal montoGestoraDevengado;

    @Column(name = "ESTADO", nullable = false, length = 20)
    private String estado;

    @Column(name = "REPROGRAMACIONES", nullable = false)
    private Integer reprogramaciones;

    public Long getIdCita() {
        return idCita;
    }

    public PreReservaCita getPreReserva() {
        return preReserva;
    }

    public void setPreReserva(PreReservaCita preReserva) {
        this.preReserva = preReserva;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Especialidad getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(Especialidad especialidad) {
        this.especialidad = especialidad;
    }

    public Consultorio getConsultorio() {
        return consultorio;
    }

    public void setConsultorio(Consultorio consultorio) {
        this.consultorio = consultorio;
    }

    public FranjaHoraria getFranja() {
        return franja;
    }

    public void setFranja(FranjaHoraria franja) {
        this.franja = franja;
    }

    public PagoCita getPago() {
        return pago;
    }

    public void setPago(PagoCita pago) {
        this.pago = pago;
    }

    public LocalDate getFechaCita() {
        return fechaCita;
    }

    public void setFechaCita(LocalDate fechaCita) {
        this.fechaCita = fechaCita;
    }

    public BigDecimal getMontoTotal() {
        return montoTotal;
    }

    public void setMontoTotal(BigDecimal montoTotal) {
        this.montoTotal = montoTotal;
    }

    public BigDecimal getMontoDoctorDevengado() {
        return montoDoctorDevengado;
    }

    public void setMontoDoctorDevengado(BigDecimal montoDoctorDevengado) {
        this.montoDoctorDevengado = montoDoctorDevengado;
    }

    public BigDecimal getMontoGestoraDevengado() {
        return montoGestoraDevengado;
    }

    public void setMontoGestoraDevengado(BigDecimal montoGestoraDevengado) {
        this.montoGestoraDevengado = montoGestoraDevengado;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getReprogramaciones() {
        return reprogramaciones;
    }

    public void setReprogramaciones(Integer reprogramaciones) {
        this.reprogramaciones = reprogramaciones;
    }
}

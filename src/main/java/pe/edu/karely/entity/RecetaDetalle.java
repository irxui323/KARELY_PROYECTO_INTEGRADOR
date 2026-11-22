package pe.edu.karely.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "RECETA_DETALLE")
public class RecetaDetalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_DETALLE", nullable = false)
    private Long idDetalle;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_RECETA", nullable = false)
    private Receta receta;

    @Column(name = "MEDICAMENTO", nullable = false, length = 200)
    private String medicamento;

    @Column(name = "DOSIS", nullable = false, length = 100)
    private String dosis;

    @Column(name = "FRECUENCIA", nullable = false, length = 100)
    private String frecuencia;

    @Column(name = "DURACION", nullable = false, length = 100)
    private String duracion;

    @Column(name = "OBSERVACIONES", length = 500)
    private String observaciones;

    public Long getIdDetalle() {
        return idDetalle;
    }

    public Receta getReceta() {
        return receta;
    }

    public void setReceta(Receta receta) {
        this.receta = receta;
    }

    public String getMedicamento() {
        return medicamento;
    }

    public void setMedicamento(String medicamento) {
        this.medicamento = medicamento;
    }

    public String getDosis() {
        return dosis;
    }

    public void setDosis(String dosis) {
        this.dosis = dosis;
    }

    public String getFrecuencia() {
        return frecuencia;
    }

    public void setFrecuencia(String frecuencia) {
        this.frecuencia = frecuencia;
    }

    public String getDuracion() {
        return duracion;
    }

    public void setDuracion(String duracion) {
        this.duracion = duracion;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}

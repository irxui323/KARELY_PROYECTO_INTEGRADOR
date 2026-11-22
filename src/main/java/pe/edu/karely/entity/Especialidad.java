package pe.edu.karely.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ESPECIALIDAD")
public class Especialidad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ESPECIALIDAD", nullable = false)
    private Long idEspecialidad;

    @Column(name = "NOMBRE", nullable = false, length = 120)
    private String nombre;

    @Column(name = "PRECIO_CONSULTA", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioConsulta;

    @Column(name = "ESTADO", nullable = false, length = 10)
    private String estado = "ACTIVO";

    public Long getIdEspecialidad() {
        return idEspecialidad;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public BigDecimal getPrecioConsulta() {
        return precioConsulta;
    }

    public void setPrecioConsulta(BigDecimal precioConsulta) {
        this.precioConsulta = precioConsulta;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}

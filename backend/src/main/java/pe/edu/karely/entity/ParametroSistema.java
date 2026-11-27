package pe.edu.karely.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "PARAMETRO_SISTEMA")
public class ParametroSistema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PARAMETRO", nullable = false)
    private Long idParametro;

    @Column(name = "NOMBRE", nullable = false, length = 100)
    private String nombre;

    @Column(name = "VALOR", nullable = false, length = 1000)
    private String valor;

    @Column(name = "DESCRIPCION", length = 500)
    private String descripcion;

    @Column(name = "ESTADO", nullable = false, length = 10)
    private String estado = "ACTIVO";

    public Long getIdParametro() {
        return idParametro;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getValor() {
        return valor;
    }

    public void setValor(String valor) {
        this.valor = valor;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}

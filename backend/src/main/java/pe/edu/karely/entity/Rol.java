package pe.edu.karely.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ROL")
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ROL", nullable = false)
    private Long idRol;

    @Column(name = "NOMBRE", nullable = false, length = 40)
    private String nombre;

    @Column(name = "ESTADO", nullable = false, length = 10)
    private String estado = "ACTIVO";

    public Long getIdRol() {
        return idRol;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}

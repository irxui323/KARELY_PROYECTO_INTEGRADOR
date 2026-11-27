package pe.edu.karely.repository.catalogos;

import jakarta.persistence.EntityManager;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.catalogo.ConsultorioResponseDTO;
import pe.edu.karely.entity.Consultorio;
import pe.edu.karely.mapper.ConsultorioMapper;

import java.util.List;

@Repository
@Transactional
public class ConsultorioRepository {
    private final EntityManager entidades;

    public ConsultorioRepository(EntityManager entidades) {
        this.entidades = entidades;
    }

    public List<ConsultorioResponseDTO> listarConsultorios() {
        return entidades
                .createQuery(
                        "SELECT e FROM Consultorio e WHERE e.estado = 'ACTIVO' ORDER BY e.nombre",
                        Consultorio.class)
                .getResultList()
                .stream()
                .map(ConsultorioMapper::respuesta)
                .toList();
    }

    public Long registrarConsultorio(String nombre, String ubicacion) {
        Consultorio registro = new Consultorio();
        registro.setNombre(nombre);
        registro.setUbicacion(ubicacion);
        entidades.persist(registro);
        return registro.getIdConsultorio();
    }

    public int editarConsultorio(long id, String nombre, String ubicacion, String estado) {
        Consultorio registro = entidades.find(Consultorio.class, id);
        if (registro == null) return 0;
        registro.setNombre(nombre);
        registro.setUbicacion(ubicacion);
        registro.setEstado(estado);
        return 1;
    }
}

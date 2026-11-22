package pe.edu.karely.repository;

import jakarta.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.karely.entity.Especialidad;
import pe.edu.karely.mapper.EspecialidadMapper;
import pe.edu.karely.dto.catalogo.EspecialidadResponseDTO;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
@Transactional
public class EspecialidadRepository {
    private final EntityManager entidades;

    public EspecialidadRepository(EntityManager entidades) {
        this.entidades = entidades;
    }
    public List<EspecialidadResponseDTO> listarEspecialidades() {
        return entidades.createQuery("SELECT e FROM Especialidad e WHERE e.estado = 'ACTIVO' ORDER BY e.nombre", Especialidad.class)
                .getResultList().stream().map(EspecialidadMapper::respuesta).toList();
    }
    public Long registrarEspecialidad(String nombre, java.math.BigDecimal precioConsulta) {
        Especialidad registro = new Especialidad();
        registro.setNombre(nombre);
        registro.setPrecioConsulta(precioConsulta);
        entidades.persist(registro);
        return registro.getIdEspecialidad();
    }

    public int editarEspecialidad(long id, String nombre, java.math.BigDecimal precioConsulta, String estado) {
        Especialidad registro = entidades.find(Especialidad.class, id);
        if (registro == null) return 0;
        registro.setNombre(nombre);
        registro.setPrecioConsulta(precioConsulta);
        registro.setEstado(estado);
        return 1;
    }
}

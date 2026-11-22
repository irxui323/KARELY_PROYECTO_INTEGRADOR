package pe.edu.karely.repository;

import jakarta.persistence.EntityManager;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.catalogo.FranjaResponseDTO;
import pe.edu.karely.entity.FranjaHoraria;
import pe.edu.karely.mapper.FranjaMapper;

import java.util.List;

@Repository
@Transactional
public class FranjaHorariaRepository {
    private final EntityManager entidades;

    public FranjaHorariaRepository(EntityManager entidades) {
        this.entidades = entidades;
    }

    public List<FranjaResponseDTO> listarTurnos() {
        return entidades
                .createQuery(
                        "SELECT e FROM FranjaHoraria e WHERE e.estado = 'ACTIVO' ORDER BY"
                            + " e.horaInicio",
                        FranjaHoraria.class)
                .getResultList()
                .stream()
                .map(FranjaMapper::respuesta)
                .toList();
    }

    public Long registrarTurno(String horaInicio, String horaFin) {
        FranjaHoraria registro = new FranjaHoraria();
        registro.setHoraInicio(horaInicio);
        registro.setHoraFin(horaFin);
        entidades.persist(registro);
        return registro.getIdFranja();
    }

    public int editarTurno(long id, String horaInicio, String horaFin, String estado) {
        FranjaHoraria registro = entidades.find(FranjaHoraria.class, id);
        if (registro == null) return 0;
        registro.setHoraInicio(horaInicio);
        registro.setHoraFin(horaFin);
        registro.setEstado(estado);
        return 1;
    }
}

package pe.edu.karely.repository.pacientes;

import jakarta.persistence.EntityManager;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.paciente.PacienteResponseDTO;
import pe.edu.karely.entity.Paciente;
import pe.edu.karely.mapper.PacienteMapper;

import java.util.List;

@Repository
@Transactional
public class PacienteRepository {
    private static final String CONSULTA_CONTAR_PACIENTES =
            "SELECT COUNT(e) FROM Paciente e WHERE LOWER(CONCAT(CONCAT(CONCAT(CONCAT("
                    + "e.numeroDocumento,' '),e.nombres),' '),e.apellidos)) LIKE :q ESCAPE '!'";

    private static final String CONSULTA_LISTAR_PACIENTES =
            "SELECT e FROM Paciente e WHERE LOWER(CONCAT(CONCAT(CONCAT(CONCAT("
                    + "e.numeroDocumento,' '),e.nombres),' '),e.apellidos)) LIKE :q ESCAPE '!' "
                    + "ORDER BY e.idPaciente ASC";

    public pe.edu.karely.dto.PaginaResponseDTO<PacienteResponseDTO> listarPacientesPagina(
            int pagina, int tamanio, String filtro) {
        pe.edu.karely.dto.PaginaResponseDTO.validar(pagina, tamanio);
        String q = filtro == null ? "" : filtro.trim().toLowerCase(java.util.Locale.ROOT);
        if (q.length() > 150)
            throw new IllegalArgumentException("La búsqueda admite hasta 150 caracteres");
        q = "%" + q.replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
        Long total =
                entidades
                        .createQuery(CONSULTA_CONTAR_PACIENTES, Long.class)
                        .setParameter("q", q)
                        .getSingleResult();
        long offset = (long) pagina * tamanio;
        var contenido =
                offset >= total
                        ? java.util.List.<PacienteResponseDTO>of()
                        : entidades
                                .createQuery(CONSULTA_LISTAR_PACIENTES, Paciente.class)
                                .setParameter("q", q)
                                .setFirstResult(Math.toIntExact(offset))
                                .setMaxResults(tamanio)
                                .getResultList()
                                .stream()
                                .map(PacienteMapper::respuesta)
                                .toList();
        return pe.edu.karely.dto.PaginaResponseDTO.crear(contenido, pagina, tamanio, total);
    }

    private final EntityManager entidades;

    public PacienteRepository(EntityManager entidades) {
        this.entidades = entidades;
    }

    public List<PacienteResponseDTO> listarPacientes() {
        return entidades
                .createQuery("SELECT e FROM Paciente e ORDER BY e.idPaciente ASC", Paciente.class)
                .setMaxResults(200)
                .getResultList()
                .stream()
                .map(PacienteMapper::respuesta)
                .toList();
    }

    public Long registrarPaciente(
            String tipoDocumento,
            String numeroDocumento,
            String nombres,
            String apellidos,
            java.sql.Date fechaNacimiento,
            String telefono,
            String correo,
            String direccion) {
        Paciente registro = new Paciente();
        registro.setTipoDocumento(tipoDocumento);
        registro.setNumeroDocumento(numeroDocumento);
        registro.setNombres(nombres);
        registro.setApellidos(apellidos);
        registro.setFechaNacimiento(fechaNacimiento == null ? null : fechaNacimiento.toLocalDate());
        registro.setTelefono(telefono);
        registro.setCorreo(correo);
        registro.setDireccion(direccion);
        entidades.persist(registro);
        return registro.getIdPaciente();
    }

    public int editarPaciente(
            String nombres,
            String apellidos,
            String telefono,
            String correo,
            String direccion,
            String estado,
            Long idPaciente) {
        Paciente registro = entidades.find(Paciente.class, idPaciente);
        if (registro == null) return 0;
        registro.setNombres(nombres);
        registro.setApellidos(apellidos);
        registro.setTelefono(telefono);
        registro.setCorreo(correo);
        registro.setDireccion(direccion);
        registro.setEstado(estado);
        return 1;
    }

    public List<PacienteResponseDTO> buscarPaciente(String tipo, String documento) {
        return entidades
                .createQuery(
                        "SELECT e FROM Paciente e WHERE e.tipoDocumento = :tipo AND"
                                + " e.numeroDocumento = :documento",
                        Paciente.class)
                .setParameter("tipo", tipo.trim().toUpperCase(java.util.Locale.ROOT))
                .setParameter("documento", documento.trim())
                .getResultList()
                .stream()
                .map(PacienteMapper::respuesta)
                .toList();
    }

    public PacienteResponseDTO buscarPorId(long id) {
        Paciente registro = entidades.find(Paciente.class, id);
        return registro == null ? null : PacienteMapper.respuesta(registro);
    }
}

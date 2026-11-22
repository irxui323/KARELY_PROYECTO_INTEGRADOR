package pe.edu.karely.repository;

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
    private final EntityManager entidades;

    public PacienteRepository(EntityManager entidades) {
        this.entidades = entidades;
    }

    public List<PacienteResponseDTO> listarPacientes() {
        return entidades
                .createQuery("SELECT e FROM Paciente e ORDER BY e.idPaciente DESC", Paciente.class)
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

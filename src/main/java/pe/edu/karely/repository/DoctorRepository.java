package pe.edu.karely.repository;

import jakarta.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.karely.entity.Doctor;
import pe.edu.karely.mapper.DoctorMapper;
import pe.edu.karely.entity.Usuario;
import pe.edu.karely.entity.DoctorEspecialidad;
import pe.edu.karely.entity.Especialidad;
import pe.edu.karely.dto.doctor.DoctorResponseDTO;
import java.util.List;
import pe.edu.karely.repository.OracleJdbc;
import org.springframework.stereotype.Repository;

@Repository
@Transactional
public class DoctorRepository {
    public DoctorResponseDTO bloquearDoctor(long id) {
        Doctor registro=entidades.find(Doctor.class,id,jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
        return registro==null?null:DoctorMapper.respuesta(registro);
    }
    public boolean tieneEspecialidad(long id) {
        return entidades.createQuery("SELECT COUNT(e) FROM DoctorEspecialidad e WHERE e.doctor.idDoctor=:id",Long.class)
            .setParameter("id",id).getSingleResult()>0;
    }
    private final EntityManager entidades;
    private final OracleJdbc jdbc;

    public DoctorRepository(EntityManager entidades, OracleJdbc jdbc) {
        this.entidades = entidades;
        this.jdbc = jdbc;
    }
    public List<DoctorResponseDTO> listarDoctoresDelMedico(long usuario) {
        return jdbc.list(DoctorResponseDTO.class, "SELECT ID_DOCTOR, ID_USUARIO, TIPO_DOCUMENTO, NUMERO_DOCUMENTO, NOMBRES, APELLIDOS, TELEFONO, CORREO, ESTADO_DOCUMENTACION, ESTADO FROM DOCTOR WHERE ID_USUARIO=?", usuario);
    }
    public List<DoctorResponseDTO> listarDoctoresParaTesoreria() {
        return jdbc.list(DoctorResponseDTO.class, "SELECT ID_DOCTOR, NULL AS ID_USUARIO, NULL AS TIPO_DOCUMENTO, NULL AS NUMERO_DOCUMENTO, NOMBRES, APELLIDOS, NULL AS TELEFONO, NULL AS CORREO, NULL AS ESTADO_DOCUMENTACION, ESTADO FROM DOCTOR ORDER BY NOMBRES,APELLIDOS");
    }
    public List<DoctorResponseDTO> listarDoctoresGeneral() {
        return entidades.createQuery("SELECT e FROM Doctor e ORDER BY e.idDoctor DESC", Doctor.class)
                .setMaxResults(200)
                .getResultList().stream().map(DoctorMapper::respuesta).toList();
    }
    public Long registrarDoctor(String tipoDocumento, String numeroDocumento, String nombres, String apellidos, String telefono, String correo, Long idUsuario) {
        Doctor registro = new Doctor();
        registro.setTipoDocumento(tipoDocumento);
        registro.setNumeroDocumento(numeroDocumento);
        registro.setNombres(nombres);
        registro.setApellidos(apellidos);
        registro.setTelefono(telefono);
        registro.setCorreo(correo);
        registro.setUsuario(idUsuario == null ? null : entidades.getReference(Usuario.class, idUsuario));
        entidades.persist(registro);
        return registro.getIdDoctor();
    }
    public int editarDoctor(String nombres, String apellidos, String telefono, String correo, String estado, Long idDoctor) {
        Doctor registro = entidades.find(Doctor.class, idDoctor, jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
        if (registro == null) return 0;
        registro.setNombres(nombres);
        registro.setApellidos(apellidos);
        registro.setTelefono(telefono);
        registro.setCorreo(correo);
        registro.setEstado(estado);
        return 1;
    }
    public int vincularUsuarioEnTabla(Long idUsuario, Long idDoctor) {
        Doctor registro = entidades.find(Doctor.class, idDoctor);
        if (registro == null) return 0;
        registro.setUsuario(entidades.getReference(Usuario.class, idUsuario));
        return 1;
    }
    public int asignarEspecialidad(Long idDoctor, Long idEspecialidad) {
        DoctorEspecialidad registro = new DoctorEspecialidad();
        registro.setDoctor(entidades.getReference(Doctor.class, idDoctor));
        registro.setEspecialidad(entidades.getReference(Especialidad.class, idEspecialidad));
        entidades.persist(registro);
        entidades.flush();
        return 1;
    }
    public List<pe.edu.karely.dto.catalogo.EspecialidadResponseDTO> listarEspecialidades(long idDoctor) {
        return jdbc.list(pe.edu.karely.dto.catalogo.EspecialidadResponseDTO.class, """
                SELECT e.ID_ESPECIALIDAD,e.NOMBRE,e.PRECIO_CONSULTA,e.ESTADO
                FROM DOCTOR_ESPECIALIDAD de JOIN ESPECIALIDAD e ON e.ID_ESPECIALIDAD=de.ID_ESPECIALIDAD
                WHERE de.ID_DOCTOR=? ORDER BY e.NOMBRE
                """, idDoctor);
    }
    public boolean especialidadEnUso(long idDoctor,long idEspecialidad) {
        return !jdbc.query("""
                SELECT ID_CITA FROM CITA
                WHERE ID_DOCTOR=? AND ID_ESPECIALIDAD=?
                  AND ESTADO IN ('PROGRAMADA','REPROGRAMADA','EN_ATENCION')
                UNION ALL
                SELECT ID_PRE_RESERVA FROM PRE_RESERVA_CITA
                WHERE ID_DOCTOR=? AND ID_ESPECIALIDAD=? AND ESTADO='BLOQUEADA'
                  AND FECHA_EXPIRACION>SYSTIMESTAMP
                """, (rs,n)->rs.getLong(1),idDoctor,idEspecialidad,idDoctor,idEspecialidad).isEmpty();
    }
    public int quitarEspecialidad(long idDoctor,long idEspecialidad) {
        return entidades.createQuery("DELETE FROM DoctorEspecialidad e WHERE e.doctor.idDoctor=:doctor AND e.especialidad.idEspecialidad=:especialidad")
                .setParameter("doctor",idDoctor).setParameter("especialidad",idEspecialidad).executeUpdate();
    }
    public void validarDocumentacion(long actor, long usuario, Long idDoctor) {
        jdbc.call("SP_VALIDAR_DOCUMENTACION", actor, usuario, idDoctor);
    }


    public void marcarDocumentacionIncompleta(long idDoctor) {
        jdbc.update("UPDATE DOCTOR SET ESTADO_DOCUMENTACION='INCOMPLETO' WHERE ID_DOCTOR=?", idDoctor);
    }

    public List<DoctorResponseDTO> buscarPorDocumento(String documento) {
        return jdbc.list(DoctorResponseDTO.class, """
                SELECT ID_DOCTOR, ID_USUARIO, TIPO_DOCUMENTO, NUMERO_DOCUMENTO, NOMBRES, APELLIDOS, TELEFONO, CORREO, ESTADO_DOCUMENTACION, ESTADO FROM DOCTOR WHERE NUMERO_DOCUMENTO = ? ORDER BY ID_DOCTOR
                """, documento.trim());
    }

    public List<DoctorResponseDTO> listarPendientes() {
        return jdbc.list(DoctorResponseDTO.class, """
                SELECT ID_DOCTOR, ID_USUARIO, TIPO_DOCUMENTO, NUMERO_DOCUMENTO, NOMBRES, APELLIDOS, TELEFONO, CORREO, ESTADO_DOCUMENTACION, ESTADO FROM DOCTOR WHERE ESTADO = 'ACTIVO' AND ESTADO_DOCUMENTACION IN ('INCOMPLETO','RECHAZADO')
                ORDER BY APELLIDOS, NOMBRES, ID_DOCTOR
                """);
    }

    public List<DoctorResponseDTO> listarConDocumentacionCompleta() {
        return jdbc.list(DoctorResponseDTO.class, """
                SELECT ID_DOCTOR, ID_USUARIO, TIPO_DOCUMENTO, NUMERO_DOCUMENTO, NOMBRES, APELLIDOS, TELEFONO, CORREO, ESTADO_DOCUMENTACION, ESTADO FROM DOCTOR WHERE ESTADO = 'ACTIVO' AND ESTADO_DOCUMENTACION = 'COMPLETO'
                ORDER BY APELLIDOS, NOMBRES, ID_DOCTOR
                """);
    }

    public int rechazarDocumentacion(long idDoctor) {
        return jdbc.update("""
                UPDATE DOCTOR SET ESTADO_DOCUMENTACION = 'RECHAZADO'
                WHERE ID_DOCTOR = ? AND ESTADO = 'ACTIVO'
                """, idDoctor);
    }
    public DoctorResponseDTO buscarPorId(long id) {
        Doctor registro = entidades.find(Doctor.class, id);
        return registro == null ? null : DoctorMapper.respuesta(registro);
    }
}

package pe.edu.karely.repository.doctores;

import org.springframework.stereotype.Repository;

import pe.edu.karely.dto.doctor.DisponibilidadResponseDTO;
import pe.edu.karely.repository.OracleJdbc;

import java.util.List;

@Repository
public class DisponibilidadDoctorRepository {
    public pe.edu.karely.dto.PaginaResponseDTO<DisponibilidadResponseDTO> listarHorariosPagina(
            int pagina, int tamanio, String filtro, Long usuario) {
        String sql =
                "SELECT DD.ID_DISPONIBILIDAD,DD.ID_DOCTOR,D.NOMBRES||' '||D.APELLIDOS AS"
                    + " NOMBRE_DOCTOR,DD.FECHA_TURNO,DD.ID_FRANJA,F.HORA_INICIO,F.HORA_FIN,DD.ESTADO,DD.ID_ESPECIALIDAD,E.NOMBRE"
                    + " AS NOMBRE_ESPECIALIDAD FROM DISPONIBILIDAD_DOCTOR DD JOIN DOCTOR D ON"
                    + " D.ID_DOCTOR=DD.ID_DOCTOR JOIN FRANJA_HORARIA F ON F.ID_FRANJA=DD.ID_FRANJA"
                    + " LEFT JOIN ESPECIALIDAD E ON E.ID_ESPECIALIDAD=DD.ID_ESPECIALIDAD";
        if (usuario != null) sql += " WHERE D.ID_USUARIO=?";
        return jdbc.pagina(
                DisponibilidadResponseDTO.class,
                sql,
                "FECHA_TURNO DESC,HORA_INICIO ASC,ID_DISPONIBILIDAD DESC",
                List.of("NOMBRE_DOCTOR", "NOMBRE_ESPECIALIDAD", "ESTADO"),
                pagina,
                tamanio,
                filtro,
                usuario == null ? new Object[] {} : new Object[] {usuario});
    }

    private final OracleJdbc jdbc;

    public DisponibilidadDoctorRepository(OracleJdbc jdbc) {
        this.jdbc = jdbc;
    }

    public List<DisponibilidadResponseDTO> listarHorariosDelMedico(long usuario) {
        return jdbc.list(
                DisponibilidadResponseDTO.class,
                "SELECT DD.ID_DISPONIBILIDAD,DD.ID_DOCTOR,D.NOMBRES||' '||D.APELLIDOS"
                    + " NOMBRE_DOCTOR,DD.FECHA_TURNO,DD.ID_FRANJA,F.HORA_INICIO,F.HORA_FIN,DD.ESTADO,DD.ID_ESPECIALIDAD,E.NOMBRE"
                    + " AS NOMBRE_ESPECIALIDAD FROM DISPONIBILIDAD_DOCTOR DD JOIN DOCTOR D ON"
                    + " D.ID_DOCTOR=DD.ID_DOCTOR JOIN FRANJA_HORARIA F ON F.ID_FRANJA=DD.ID_FRANJA"
                    + " LEFT JOIN ESPECIALIDAD E ON E.ID_ESPECIALIDAD=DD.ID_ESPECIALIDAD WHERE"
                    + " D.ID_USUARIO=? AND DD.FECHA_TURNO>=TRUNC(SYSDATE)-7 ORDER BY"
                    + " DD.FECHA_TURNO,F.HORA_INICIO FETCH FIRST 400 ROWS ONLY",
                usuario);
    }

    public List<DisponibilidadResponseDTO> listarHorariosGeneral() {
        return jdbc.list(
                DisponibilidadResponseDTO.class,
                "SELECT DD.ID_DISPONIBILIDAD,DD.ID_DOCTOR,D.NOMBRES||' '||D.APELLIDOS"
                    + " NOMBRE_DOCTOR,DD.FECHA_TURNO,DD.ID_FRANJA,F.HORA_INICIO,F.HORA_FIN,DD.ESTADO,DD.ID_ESPECIALIDAD,E.NOMBRE"
                    + " AS NOMBRE_ESPECIALIDAD FROM DISPONIBILIDAD_DOCTOR DD JOIN DOCTOR D ON"
                    + " D.ID_DOCTOR=DD.ID_DOCTOR JOIN FRANJA_HORARIA F ON F.ID_FRANJA=DD.ID_FRANJA"
                    + " LEFT JOIN ESPECIALIDAD E ON E.ID_ESPECIALIDAD=DD.ID_ESPECIALIDAD WHERE"
                    + " DD.FECHA_TURNO>=TRUNC(SYSDATE)-7 ORDER BY DD.FECHA_TURNO,F.HORA_INICIO"
                    + " FETCH FIRST 400 ROWS ONLY");
    }

    public Long registrarHorario(
            long actor,
            long usuario,
            Long idDoctor,
            java.time.LocalDate fecha,
            Long idFranja,
            Long idEspecialidad) {
        return jdbc.callId(
                "SP_REGISTRAR_DISPONIBILIDAD",
                actor,
                usuario,
                idDoctor,
                fecha,
                idFranja,
                idEspecialidad,
                OracleJdbc.outNumber());
    }
}

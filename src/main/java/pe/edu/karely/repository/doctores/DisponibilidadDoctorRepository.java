package pe.edu.karely.repository.doctores;

import pe.edu.karely.repository.OracleJdbc;

import org.springframework.stereotype.Repository;

import pe.edu.karely.dto.doctor.DisponibilidadResponseDTO;

import java.util.List;

@Repository
public class DisponibilidadDoctorRepository {
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

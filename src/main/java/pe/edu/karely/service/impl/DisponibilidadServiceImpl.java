package pe.edu.karely.service.impl;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.karely.repository.DisponibilidadDoctorRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.doctor.DisponibilidadRequestDTO;
import pe.edu.karely.dto.doctor.DisponibilidadResponseDTO;
import pe.edu.karely.service.service.DisponibilidadService;
@Service
public class DisponibilidadServiceImpl implements DisponibilidadService {
    private final DisponibilidadDoctorRepository repository;
    private final PermisosUsuario permisos;
    public DisponibilidadServiceImpl(DisponibilidadDoctorRepository repository, PermisosUsuario permisos) {
        this.repository = repository;
        this.permisos = permisos;
    }

@Override
    @Transactional(readOnly = true)
    public List<DisponibilidadResponseDTO> listarHorarios(long actor) {
        String rol = permisos.rol(actor);
        permisos.exigir(actor,"ADMINISTRADORA","RECEPCIONISTA","DOCTOR");
        return rol.equals("DOCTOR") ? repository.listarHorariosDelMedico(actor)
        : repository.listarHorariosGeneral();
    }

@Override
    @Transactional
    public OperacionResponseDTO registrarHorario(long idDoctor, DisponibilidadRequestDTO i, long actor) {
        permisos.exigir(actor,"ADMINISTRADORA","DOCTOR");
        if(i.fecha()==null || i.fecha().isBefore(java.time.LocalDate.now(java.time.ZoneId.of("America/Bogota"))))
            throw new IllegalArgumentException("La fecha del horario no puede ser anterior a hoy");
        if(i.idEspecialidad()==null || i.idEspecialidad()<=0)throw new IllegalArgumentException("Selecciona la especialidad de esta disponibilidad");
        return OperacionResponseDTO.resultado("SP_REGISTRAR_DISPONIBILIDAD", repository.registrarHorario(actor, actor, idDoctor, i.fecha(), i.idFranja(),i.idEspecialidad()));
    }

}

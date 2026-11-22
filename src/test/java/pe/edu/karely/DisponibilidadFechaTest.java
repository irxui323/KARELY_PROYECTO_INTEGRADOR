package pe.edu.karely;

import java.time.LocalDate;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;
import pe.edu.karely.dto.doctor.DisponibilidadRequestDTO;
import pe.edu.karely.repository.DisponibilidadDoctorRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.impl.DisponibilidadServiceImpl;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class DisponibilidadFechaTest {
    @Test void rechazaAyerAntesDeInvocarOracle() {
        var repo=mock(DisponibilidadDoctorRepository.class);
        var servicio=new DisponibilidadServiceImpl(repo,mock(PermisosUsuario.class));
        var ayer=LocalDate.now(ZoneId.of("America/Bogota")).minusDays(1);
        assertThrows(IllegalArgumentException.class,()->servicio.registrarHorario(1,new DisponibilidadRequestDTO(ayer,2L,3L),7));
        verifyNoInteractions(repo);
    }
    @Test void permiteHoyYManana() {
        var repo=mock(DisponibilidadDoctorRepository.class);
        var servicio=new DisponibilidadServiceImpl(repo,mock(PermisosUsuario.class));
        var hoy=LocalDate.now(ZoneId.of("America/Bogota"));
        for(var fecha:java.util.List.of(hoy,hoy.plusDays(1))) {
            servicio.registrarHorario(1,new DisponibilidadRequestDTO(fecha,2L,3L),7);
            verify(repo).registrarHorario(7,7,1L,fecha,2L,3L);
        }
    }
}

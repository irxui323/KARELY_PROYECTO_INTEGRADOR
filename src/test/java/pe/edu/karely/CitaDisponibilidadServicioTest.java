package pe.edu.karely;

import org.junit.jupiter.api.Test;
import pe.edu.karely.repository.CitaRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.impl.CitaServiceImpl;
import pe.edu.karely.dto.cita.*;
import java.time.*;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CitaDisponibilidadServicioTest {
    @Test void agrupaElMesPorFechaYDoctorSinMezclarSusConteos() {
        var repo=mock(CitaRepository.class);
        var permisos=mock(PermisosUsuario.class);
        var mes=LocalDate.of(2099,1,1);
        when(repo.turnosDelMes(2,mes,mes.plusMonths(1),4L)).thenReturn(List.of(
            new TurnoFechaDTO(1L,1L,"08:00","09:00",mes.plusDays(1)),
            new TurnoFechaDTO(1L,2L,"09:00","10:00",mes.plusDays(1)),
            new TurnoFechaDTO(3L,1L,"08:00","09:00",mes.plusDays(1))));
        var result=new CitaServiceImpl(repo,permisos).disponibilidadMes(2,mes,4L,7);
        assertEquals(2L,result.getFirst().total());
        assertEquals(1L,result.get(1).total());
        assertEquals(3L,result.get(1).idDoctor());
        verify(permisos).exigir(7,"ADMINISTRADORA","RECEPCIONISTA");
        assertThrows(IllegalArgumentException.class,()->new CitaServiceImpl(repo,permisos).disponibilidadMes(2,mes.plusDays(1),4L,7));
    }
    @Test void agrupaTurnosPorDoctorYConservaDoctorSinTurnos() {
        var repo=mock(CitaRepository.class);
        var permisos=mock(PermisosUsuario.class);
        var fecha=LocalDate.now(ZoneId.of("America/Bogota")).plusDays(1);
        when(repo.doctoresPorEspecialidad(2)).thenReturn(List.of(new DoctorEspecialidadDTO(1L,"Ana"),new DoctorEspecialidadDTO(3L,"Maria")));
        when(repo.turnosDisponibles(2,fecha,4L)).thenReturn(List.of(new TurnoDisponibleDTO(1L,8L,"08:00","09:00")));
        var result=new CitaServiceImpl(repo,permisos).disponibilidad(2,fecha,4L,7);
        assertEquals(1,result.getFirst().turnos().size());
        assertTrue(result.get(1).turnos().isEmpty());
        verify(permisos).exigir(7,"ADMINISTRADORA","RECEPCIONISTA");
    }
    @Test void sinFechaSoloConsultaDoctoresYFechaPasadaSeRechaza() {
        var repo=mock(CitaRepository.class);
        var servicio=new CitaServiceImpl(repo,mock(PermisosUsuario.class));
        when(repo.doctoresPorEspecialidad(2)).thenReturn(List.of());
        servicio.disponibilidad(2,null,null,7);
        verify(repo,never()).turnosDisponibles(anyLong(),any(),any());
        assertThrows(IllegalArgumentException.class,()->servicio.disponibilidad(2,LocalDate.now(ZoneId.of("America/Bogota")).minusDays(1),null,7));
        assertThrows(IllegalArgumentException.class,()->servicio.disponibilidad(0,null,null,7));
    }
    @Test void consultaNoAutorizadaNoAccedeALaBase() {
        var repo=mock(CitaRepository.class);
        var permisos=mock(PermisosUsuario.class);
        doThrow(new org.springframework.security.access.AccessDeniedException("Sin permiso")).when(permisos).exigir(7,"ADMINISTRADORA","RECEPCIONISTA");
        assertThrows(org.springframework.security.access.AccessDeniedException.class,()->new CitaServiceImpl(repo,permisos).disponibilidad(2,null,null,7));
        verifyNoInteractions(repo);
    }
    @Test void exponeConsultaEnElControllerExistente() throws Exception {
        var service=mock(pe.edu.karely.service.service.CitaService.class);
        when(service.disponibilidad(2,null,4L,7)).thenReturn(List.of(new DoctorDisponibleDTO(1L,"Ana",List.of())));
        var mvc=org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(new pe.edu.karely.controller.CitaController(service)).build();
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/citas/disponibilidad").param("idEspecialidad","2").param("idConsultorio","4")
          .principal(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(7L,null)))
          .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
          .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$[0].nombre").value("Ana"));
    }
}

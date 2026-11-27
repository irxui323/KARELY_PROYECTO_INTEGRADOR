package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;

import pe.edu.karely.dto.doctor.DisponibilidadRequestDTO;
import pe.edu.karely.repository.doctores.DisponibilidadDoctorRepository;
import pe.edu.karely.repository.doctores.DoctorRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.impl.doctores.DisponibilidadServiceImpl;

import java.time.LocalDate;
import java.time.ZoneId;

class DisponibilidadFechaTest {
    private static pe.edu.karely.dto.doctor.DoctorResponseDTO doctorValidado() {
        return new pe.edu.karely.dto.doctor.DoctorResponseDTO(
                1L,
                null,
                "DNI",
                "12345678",
                "Doctor",
                "Validado",
                null,
                null,
                "COMPLETO",
                "ACTIVO");
    }

    @Test
    void rechazaAyerAntesDeInvocarOracle() {
        var repo = mock(DisponibilidadDoctorRepository.class);
        var doctores = mock(DoctorRepository.class);
        var servicio = new DisponibilidadServiceImpl(repo, mock(PermisosUsuario.class), doctores);
        var ayer = LocalDate.now(ZoneId.of("America/Bogota")).minusDays(1);
        assertThrows(
                IllegalArgumentException.class,
                () -> servicio.registrarHorario(1, new DisponibilidadRequestDTO(ayer, 2L, 3L), 7));
        verifyNoInteractions(repo);
    }

    @Test
    void permiteHoyYManana() {
        var repo = mock(DisponibilidadDoctorRepository.class);
        var doctores = mock(DoctorRepository.class);
        when(doctores.bloquearDoctor(1)).thenReturn(doctorValidado());
        var servicio = new DisponibilidadServiceImpl(repo, mock(PermisosUsuario.class), doctores);
        var hoy = LocalDate.now(ZoneId.of("America/Bogota"));
        for (var fecha : java.util.List.of(hoy, hoy.plusDays(1))) {
            servicio.registrarHorario(1, new DisponibilidadRequestDTO(fecha, 2L, 3L), 7);
            verify(repo).registrarHorario(7, 7, 1L, fecha, 2L, 3L);
        }
    }

    @Test
    void rechazaHorarioParaDoctorSinDocumentacionCompleta() {
        var disponibilidad = mock(DisponibilidadDoctorRepository.class);
        var doctores = mock(DoctorRepository.class);
        when(doctores.bloquearDoctor(1))
                .thenReturn(
                        new pe.edu.karely.dto.doctor.DoctorResponseDTO(
                                1L,
                                null,
                                "DNI",
                                "12345678",
                                "Doctor",
                                "Pendiente",
                                null,
                                null,
                                "INCOMPLETO",
                                "ACTIVO"));
        var servicio =
                new DisponibilidadServiceImpl(
                        disponibilidad, mock(PermisosUsuario.class), doctores);

        var error =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                servicio.registrarHorario(
                                        1,
                                        new DisponibilidadRequestDTO(
                                                LocalDate.now(ZoneId.of("America/Bogota")), 2L, 3L),
                                        7));

        assertEquals("Solo se puede registrar disponibilidad para un médico validado", error.getMessage());
        verifyNoInteractions(disponibilidad);
    }
}

package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.karely.dto.doctor.DoctorResponseDTO;
import pe.edu.karely.exception.RecursoNoEncontradoException;
import pe.edu.karely.repository.*;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.impl.DoctorServiceImpl;

class DoctorEspecialidadesTest {
    @Test
    void doctorSoloConsultaSusEspecialidades() {
        when(permisos.rol(7)).thenReturn("DOCTOR");
        when(repo.buscarPorId(1))
                .thenReturn(
                        new DoctorResponseDTO(
                                1L,
                                9L,
                                "DNI",
                                "99000001",
                                "Ana",
                                "Rojas",
                                null,
                                null,
                                "COMPLETO",
                                "ACTIVO"));
        assertThrows(AccessDeniedException.class, () -> service.listarEspecialidades(1, 7));
        verify(repo, never()).listarEspecialidades(anyLong());
        when(permisos.rol(9)).thenReturn("DOCTOR");
        when(repo.listarEspecialidades(1)).thenReturn(java.util.List.of());
        assertTrue(service.listarEspecialidades(1, 9).isEmpty());
    }

    DoctorRepository repo;
    PermisosUsuario permisos;
    AuditoriaRepository auditoria;
    DoctorServiceImpl service;

    @BeforeEach
    void preparar() {
        repo = mock(DoctorRepository.class);
        permisos = mock(PermisosUsuario.class);
        auditoria = mock(AuditoriaRepository.class);
        service =
                new DoctorServiceImpl(
                        repo,
                        permisos,
                        auditoria,
                        mock(UsuarioRepository.class),
                        mock(DocumentoDoctorRepository.class),
                        mock(org.springframework.security.crypto.password.PasswordEncoder.class));
        when(repo.bloquearDoctor(1))
                .thenReturn(
                        new DoctorResponseDTO(
                                1L,
                                9L,
                                "DNI",
                                "99000001",
                                "Ana",
                                "Rojas",
                                null,
                                "ana@example.com",
                                "COMPLETO",
                                "ACTIVO"));
        when(repo.quitarEspecialidad(1, 2)).thenReturn(1);
    }

    @Test
    void quitaSoloVinculoSinAlterarDocumentacionNiUsuario() {
        service.quitarEspecialidad(1, 2, 7);
        var orden = inOrder(permisos, repo, auditoria);
        orden.verify(permisos).exigir(7, "ADMINISTRADORA");
        orden.verify(repo).bloquearDoctor(1);
        orden.verify(repo).especialidadEnUso(1, 2);
        orden.verify(repo).quitarEspecialidad(1, 2);
        verify(auditoria)
                .registrar(eq(7L), eq("DOCTOR_ESPECIALIDAD"), eq(1L), eq("QUITAR"), contains("2"));
        verifyNoMoreInteractions(repo);
    }

    @Test
    void impideQuitarSiHayCitaOReservaPendiente() {
        when(repo.especialidadEnUso(1, 2)).thenReturn(true);
        var error =
                assertThrows(
                        ResponseStatusException.class, () -> service.quitarEspecialidad(1, 2, 7));
        assertEquals(409, error.getStatusCode().value());
        verify(repo, never()).quitarEspecialidad(anyLong(), anyLong());
        verifyNoInteractions(auditoria);
    }

    @Test
    void doctorInexistenteNoEliminaNada() {
        when(repo.bloquearDoctor(1)).thenReturn(null);
        assertThrows(RecursoNoEncontradoException.class, () -> service.quitarEspecialidad(1, 2, 7));
        verify(repo, never()).quitarEspecialidad(anyLong(), anyLong());
    }

    @Test
    void asignacionInexistenteDevuelveNoEncontrado() {
        when(repo.quitarEspecialidad(1, 2)).thenReturn(0);
        assertThrows(RecursoNoEncontradoException.class, () -> service.quitarEspecialidad(1, 2, 7));
        verifyNoInteractions(auditoria);
    }

    @Test
    void doctorNoPuedeQuitarSuEspecialidad() {
        doThrow(new AccessDeniedException("Sin permiso"))
                .when(permisos)
                .exigir(7, "ADMINISTRADORA");
        assertThrows(AccessDeniedException.class, () -> service.quitarEspecialidad(1, 2, 7));
        verifyNoInteractions(repo, auditoria);
    }

    @Test
    void noConfundeUnaClaveForaneaInvalidaConEspecialidadDuplicada() {
        var error =
                new org.springframework.dao.DataIntegrityViolationException(
                        "ORA-02291: integrity constraint (KARELY_BD2.FK_ESPECIALIDAD) violated");
        when(repo.asignarEspecialidad(1L, 2L)).thenThrow(error);
        assertSame(
                error,
                assertThrows(
                        org.springframework.dao.DataIntegrityViolationException.class,
                        () ->
                                service.asignarEspecialidad(
                                        1,
                                        new pe.edu.karely.dto.doctor.AsignarEspecialidadRequestDTO(
                                                2L),
                                        7)));
        verifyNoInteractions(auditoria);
    }

    @Test
    void informaDuplicadoSoloParaLaRestriccionDeDoctorYEspecialidad() {
        when(repo.asignarEspecialidad(1L, 2L))
                .thenThrow(
                        new org.springframework.dao.DataIntegrityViolationException(
                                "Insert rejected",
                                new java.sql.SQLException(
                                        "ORA-00001: unique constraint"
                                            + " (KARELY_BD2.UQ_DOCTOR_ESPECIALIDAD) violated",
                                        "23000",
                                        1)));
        var error =
                assertThrows(
                        ResponseStatusException.class,
                        () ->
                                service.asignarEspecialidad(
                                        1,
                                        new pe.edu.karely.dto.doctor.AsignarEspecialidadRequestDTO(
                                                2L),
                                        7));
        assertEquals(409, error.getStatusCode().value());
        verifyNoInteractions(auditoria);
    }
}

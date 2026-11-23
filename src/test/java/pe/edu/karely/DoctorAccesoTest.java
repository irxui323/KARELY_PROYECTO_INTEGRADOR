package pe.edu.karely;

import pe.edu.karely.repository.OracleJdbc;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import pe.edu.karely.dto.auth.IdRolDTO;
import pe.edu.karely.dto.doctor.*;
import pe.edu.karely.repository.administracion.*;
import pe.edu.karely.repository.atencion.*;
import pe.edu.karely.repository.auth.*;
import pe.edu.karely.repository.catalogos.*;
import pe.edu.karely.repository.citas.*;
import pe.edu.karely.repository.doctores.*;
import pe.edu.karely.repository.finanzas.*;
import pe.edu.karely.repository.pacientes.*;
import pe.edu.karely.repository.reportes.*;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.impl.doctores.DoctorServiceImpl;

import java.util.List;

class DoctorAccesoTest {
    DoctorRepository doctores;
    UsuarioRepository usuarios;
    DocumentoDoctorRepository documentos;
    DoctorServiceImpl service;
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);

    @BeforeEach
    void preparar() {
        doctores = mock(DoctorRepository.class);
        usuarios = mock(UsuarioRepository.class);
        documentos = mock(DocumentoDoctorRepository.class);
        service =
                new DoctorServiceImpl(
                        doctores,
                        mock(PermisosUsuario.class),
                        mock(AuditoriaRepository.class),
                        usuarios,
                        documentos,
                        encoder);
        when(doctores.bloquearDoctor(1)).thenReturn(doctor("COMPLETO", null));
        when(doctores.tieneEspecialidad(1)).thenReturn(true);
        when(usuarios.buscarRolDoctor()).thenReturn(new IdRolDTO(3L));
    }

    DoctorResponseDTO doctor(String estado, Long usuario) {
        return new DoctorResponseDTO(
                1L,
                usuario,
                "DNI",
                "12345678",
                "Ana",
                "Rojas",
                null,
                "ana@example.com",
                estado,
                "ACTIVO");
    }

    @Test
    void generaClaveSeguraYGuardaSolamenteSuHashConRolDoctor() {
        when(usuarios.crearUsuario(eq(7L), eq(3L), eq("ana"), eq("ana@example.com"), anyString()))
                .thenReturn(9L);
        when(doctores.vincularUsuarioEnTabla(9L, 1L)).thenReturn(1);
        var acceso = service.crearAcceso(1, new CrearAccesoRequestDTO(" Ana "), 7);
        assertEquals("ana", acceso.username());
        assertEquals(20, acceso.passwordTemporal().length());
        assertTrue(acceso.passwordTemporal().matches(".*[A-Z].*"));
        assertTrue(acceso.passwordTemporal().matches(".*[a-z].*"));
        assertTrue(acceso.passwordTemporal().matches(".*[0-9].*"));
        var hash = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(usuarios)
                .crearUsuario(eq(7L), eq(3L), eq("ana"), eq("ana@example.com"), hash.capture());
        assertNotEquals(acceso.passwordTemporal(), hash.getValue());
        assertTrue(encoder.matches(acceso.passwordTemporal(), hash.getValue()));
        verify(doctores).vincularUsuarioEnTabla(9L, 1L);
    }

    @Test
    void noCreaCuentaAntesDeAprobarDocumentos() {
        when(doctores.bloquearDoctor(1)).thenReturn(doctor("INCOMPLETO", null));
        assertThrows(
                IllegalArgumentException.class,
                () -> service.crearAcceso(1, new CrearAccesoRequestDTO("ana"), 7));
        verifyNoInteractions(usuarios);
    }

    @Test
    void noCreaCuentaSinEspecialidad() {
        when(doctores.tieneEspecialidad(1)).thenReturn(false);
        assertThrows(
                IllegalArgumentException.class,
                () -> service.crearAcceso(1, new CrearAccesoRequestDTO("ana"), 7));
        verifyNoInteractions(usuarios);
    }

    @Test
    void noDuplicaCuentaDelDoctor() {
        when(doctores.bloquearDoctor(1)).thenReturn(doctor("COMPLETO", 9L));
        assertThrows(
                org.springframework.web.server.ResponseStatusException.class,
                () -> service.crearAcceso(1, new CrearAccesoRequestDTO("ana"), 7));
        verifyNoInteractions(usuarios);
    }

    @Test
    void noValidaSinConformidadHumana() {
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.validarDocumentacion(
                                1, new ValidarDocumentacionRequestDTO(false, true, 10L, 11L), 7));
        verify(doctores, never()).validarDocumentacion(anyLong(), anyLong(), anyLong());
    }

    @Test
    void noValidaUnaVersionDistintaDeLaRevisada() {
        when(documentos.listarDocumentos(1))
                .thenReturn(
                        List.of(
                                new DocumentoDoctorResponseDTO(
                                        12L,
                                        1L,
                                        "DNI",
                                        "dni.pdf",
                                        "application/pdf",
                                        "PENDIENTE",
                                        null,
                                        null),
                                new DocumentoDoctorResponseDTO(
                                        11L,
                                        1L,
                                        "TITULO",
                                        "titulo.pdf",
                                        "application/pdf",
                                        "PENDIENTE",
                                        null,
                                        null)));
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.validarDocumentacion(
                                1, new ValidarDocumentacionRequestDTO(true, true, 10L, 11L), 7));
        verify(doctores, never()).validarDocumentacion(anyLong(), anyLong(), anyLong());
    }

    @Test
    void apruebaSoloLosDocumentosRevisadosYVigentes() {
        when(documentos.listarDocumentos(1))
                .thenReturn(
                        List.of(
                                new DocumentoDoctorResponseDTO(
                                        10L,
                                        1L,
                                        "DNI",
                                        "dni.pdf",
                                        "application/pdf",
                                        "PENDIENTE",
                                        null,
                                        null),
                                new DocumentoDoctorResponseDTO(
                                        11L,
                                        1L,
                                        "TITULO",
                                        "titulo.pdf",
                                        "application/pdf",
                                        "PENDIENTE",
                                        null,
                                        null)));
        service.validarDocumentacion(
                1, new ValidarDocumentacionRequestDTO(true, true, 10L, 11L), 7);
        verify(doctores).validarDocumentacion(7, 7, 1L);
    }

    @Test
    void rechazoRegistraMotivoYMarcaDoctorComoRechazado() {
        when(documentos.listarDocumentos(1))
                .thenReturn(
                        List.of(
                                new DocumentoDoctorResponseDTO(
                                        10L,
                                        1L,
                                        "DNI",
                                        "dni.pdf",
                                        "application/pdf",
                                        "PENDIENTE",
                                        null,
                                        null)));
        when(documentos.rechazar(1, 10, 7)).thenReturn(1);
        service.rechazarDocumento(
                1, 10, new RechazarDocumentoRequestDTO("El nÃºmero no coincide"), 7);
        verify(documentos).rechazar(1, 10, 7);
        verify(doctores).rechazarDocumentacion(1);
    }

    @Test
    void noRechazaUnDocumentoDeOtroDoctor() {
        when(documentos.listarDocumentos(1)).thenReturn(List.of());
        assertThrows(
                pe.edu.karely.exception.RecursoNoEncontradoException.class,
                () ->
                        service.rechazarDocumento(
                                1, 10, new RechazarDocumentoRequestDTO("No corresponde"), 7));
        verify(documentos, never()).rechazar(anyLong(), anyLong(), anyLong());
    }

    @Test
    void restriccionJpaDeEspecialidadSeConvierteEnConflicto() {
        when(doctores.asignarEspecialidad(1L, 2L))
                .thenThrow(
                        new org.springframework.dao.DataIntegrityViolationException("ORA-00001: unique constraint (KARELY_BD2.UQ_DOCTOR_ESPECIALIDAD) violated"));
        var error =
                assertThrows(
                        org.springframework.web.server.ResponseStatusException.class,
                        () ->
                                service.asignarEspecialidad(
                                        1, new AsignarEspecialidadRequestDTO(2L), 7));
        assertEquals(409, error.getStatusCode().value());
    }

    @Test
    void editarDoctorBloqueaLaFilaParaNoSobrescribirUnaRevisionConcurrente() {
        var entidades = mock(jakarta.persistence.EntityManager.class);
        var doctor = new pe.edu.karely.entity.Doctor();
        when(entidades.find(
                        pe.edu.karely.entity.Doctor.class,
                        1L,
                        jakarta.persistence.LockModeType.PESSIMISTIC_WRITE))
                .thenReturn(doctor);
        when(entidades.find(pe.edu.karely.entity.Doctor.class, 1L)).thenReturn(doctor);
        var repo = new DoctorRepository(entidades, mock(pe.edu.karely.repository.OracleJdbc.class));
        repo.editarDoctor("Ana", "Rojas", null, null, "ACTIVO", 1L);
        verify(entidades)
                .find(
                        pe.edu.karely.entity.Doctor.class,
                        1L,
                        jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
    }
}

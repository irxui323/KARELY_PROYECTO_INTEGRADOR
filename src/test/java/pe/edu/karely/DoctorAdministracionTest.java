package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.karely.dto.doctor.AsignarEspecialidadRequestDTO;
import pe.edu.karely.repository.*;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.impl.*;

class DoctorAdministracionTest {
    @Test
    void detalleParaTesoreriaNoExponeDatosPersonales() {
        var repo = mock(DoctorRepository.class);
        var permisos = mock(PermisosUsuario.class);
        when(permisos.rol(7)).thenReturn("TESORERA");
        when(repo.buscarPorId(1))
                .thenReturn(
                        new pe.edu.karely.dto.doctor.DoctorResponseDTO(
                                1L,
                                9L,
                                "DNI",
                                "76543210",
                                "Ana",
                                "Rojas",
                                "999999999",
                                "ana@example.com",
                                "COMPLETO",
                                "ACTIVO"));
        var service =
                new DoctorServiceImpl(
                        repo,
                        permisos,
                        mock(AuditoriaRepository.class),
                        mock(UsuarioRepository.class),
                        mock(DocumentoDoctorRepository.class),
                        mock(org.springframework.security.crypto.password.PasswordEncoder.class));
        var result = service.buscarPorId(1, 7);
        assertNull(result.numeroDocumento());
        assertNull(result.correo());
        assertNull(result.telefono());
        assertNull(result.idUsuario());
        assertEquals("Ana", result.nombres());
    }

    @Test
    void archivoDemasiadoGrandeResponde413() throws Exception {
        var service = mock(pe.edu.karely.service.service.DocumentoDoctorService.class);
        when(service.subir(anyLong(), anyString(), any(), anyLong()))
                .thenThrow(
                        new org.springframework.web.multipart.MaxUploadSizeExceededException(
                                10 * 1024 * 1024));
        var mvc =
                org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(
                                new pe.edu.karely.controller.DoctorController(
                                        mock(pe.edu.karely.service.service.DoctorService.class),
                                        service,
                                        mock(
                                                pe.edu.karely.service.service.DisponibilidadService
                                                        .class)))
                        .setControllerAdvice(new pe.edu.karely.exception.GlobalExceptionHandler())
                        .build();
        mvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                                .multipart("/api/v1/doctores/1/documentos")
                                .file(
                                        new MockMultipartFile(
                                                "archivo",
                                                "dni.pdf",
                                                "application/pdf",
                                                new byte[] {1}))
                                .param("idDoctor", "1")
                                .param("tipo", "DNI")
                                .principal(
                                        new org.springframework.security.authentication
                                                .UsernamePasswordAuthenticationToken(7L, null)))
                .andExpect(
                        org.springframework.test.web.servlet.result.MockMvcResultMatchers.status()
                                .is(413));
    }

    @Test
    void reglaOracleDeDocumentoFaltanteResponde400ConSuDetalle() {
        var error =
                new org.springframework.jdbc.UncategorizedSQLException(
                        "validar",
                        "call",
                        new java.sql.SQLException(
                                "ORA-20004: Falta DNI o titulo vigente", "72000", 20004));
        var response = new pe.edu.karely.exception.GlobalExceptionHandler().sql(error);
        assertEquals(400, response.getStatusCode().value());
        assertTrue(response.getBody().error().contains("Falta DNI o titulo"));
    }

    @Test
    void duplicadoDeCatalogoNoEsErrorInterno() {
        var result =
                new pe.edu.karely.exception.GlobalExceptionHandler()
                        .sql(new DuplicateKeyException("duplicado"));
        assertEquals(409, result.getStatusCode().value());
    }

    @Test
    void configuracionPermiteDocumentosDeDiezMb() {
        var yaml = new org.springframework.beans.factory.config.YamlPropertiesFactoryBean();
        yaml.setResources(new org.springframework.core.io.ClassPathResource("application.yaml"));
        var properties = yaml.getObject();
        assertEquals("10MB", properties.getProperty("spring.servlet.multipart.max-file-size"));
        assertEquals("11MB", properties.getProperty("spring.servlet.multipart.max-request-size"));
    }

    @Test
    void especialidadDuplicadaRespondeConflictoSinRegistrarAuditoria() {
        var repository = mock(DoctorRepository.class);
        var auditoria = mock(AuditoriaRepository.class);
        when(repository.bloquearDoctor(1L))
                .thenReturn(
                        new pe.edu.karely.dto.doctor.DoctorResponseDTO(
                                1L,
                                null,
                                "DNI",
                                "99000001",
                                "Ana",
                                "Rojas",
                                null,
                                null,
                                "INCOMPLETO",
                                "ACTIVO"));
        when(repository.asignarEspecialidad(1L, 2L))
                .thenThrow(new DuplicateKeyException("UQ_DOCTOR_ESPECIALIDAD"));
        var service =
                new DoctorServiceImpl(
                        repository,
                        mock(PermisosUsuario.class),
                        auditoria,
                        mock(UsuarioRepository.class),
                        mock(DocumentoDoctorRepository.class),
                        mock(org.springframework.security.crypto.password.PasswordEncoder.class));
        var error =
                assertThrows(
                        ResponseStatusException.class,
                        () ->
                                service.asignarEspecialidad(
                                        1L, new AsignarEspecialidadRequestDTO(2L), 7));
        assertEquals(409, error.getStatusCode().value());
        assertEquals("El doctor ya tiene asignada esta especialidad", error.getReason());
        verifyNoInteractions(auditoria);
    }

    @Test
    void documentoValidoDeDosMbSeGuardaYMarcaRevision() throws Exception {
        var docs = mock(DocumentoDoctorRepository.class);
        var doctores = mock(DoctorRepository.class);
        when(docs.insertar(eq(1L), eq("DNI"), anyString(), eq("application/pdf"), any()))
                .thenReturn(20L);
        var service = new DocumentoDoctorServiceImpl(docs, doctores, mock(PermisosUsuario.class));
        var result =
                service.subir(
                        1,
                        "DNI",
                        new MockMultipartFile(
                                "archivo", "dni.pdf", "application/pdf", new byte[2 * 1024 * 1024]),
                        7);
        assertEquals(20L, result.id());
        verify(doctores).marcarDocumentacionIncompleta(1);
    }

    @Test
    void documentoVacioNoSeGuarda() {
        var docs = mock(DocumentoDoctorRepository.class);
        var service =
                new DocumentoDoctorServiceImpl(
                        docs, mock(DoctorRepository.class), mock(PermisosUsuario.class));
        assertThrows(
                IllegalArgumentException.class,
                () -> service.subir(1, "DNI", new MockMultipartFile("archivo", new byte[0]), 7));
        verifyNoInteractions(docs);
    }

    @Test
    void archivoMayorADiezMbNoSeGuarda() {
        var docs = mock(DocumentoDoctorRepository.class);
        var service =
                new DocumentoDoctorServiceImpl(
                        docs, mock(DoctorRepository.class), mock(PermisosUsuario.class));
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.subir(
                                1,
                                "DNI",
                                new MockMultipartFile(
                                        "archivo",
                                        "dni.pdf",
                                        "application/pdf",
                                        new byte[10 * 1024 * 1024 + 1]),
                                7));
        verifyNoInteractions(docs);
    }

    @Test
    void archivoEjecutableNoSeGuarda() {
        var docs = mock(DocumentoDoctorRepository.class);
        var service =
                new DocumentoDoctorServiceImpl(
                        docs, mock(DoctorRepository.class), mock(PermisosUsuario.class));
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.subir(
                                1,
                                "DNI",
                                new MockMultipartFile(
                                        "archivo",
                                        "mal.exe",
                                        "application/octet-stream",
                                        new byte[] {1}),
                                7));
        verifyNoInteractions(docs);
    }

    @Test
    void rolAjenoNoPuedeLeerDocumentacion() {
        var permisos = mock(PermisosUsuario.class);
        doThrow(new AccessDeniedException("Sin permiso"))
                .when(permisos)
                .exigir(7L, "ADMINISTRADORA");
        var docs = mock(DocumentoDoctorRepository.class);
        var service = new DocumentoDoctorServiceImpl(docs, mock(DoctorRepository.class), permisos);
        assertThrows(AccessDeniedException.class, () -> service.listar(1, 7));
        verifyNoInteractions(docs);
    }
}

package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;

import pe.edu.karely.dto.atencion.*;
import pe.edu.karely.dto.auth.RolActivoDTO;
import pe.edu.karely.dto.finanzas.PagoDoctorRequestDTO;
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
import pe.edu.karely.service.impl.administracion.*;
import pe.edu.karely.service.impl.atencion.*;
import pe.edu.karely.service.impl.auth.*;
import pe.edu.karely.service.impl.catalogos.*;
import pe.edu.karely.service.impl.citas.*;
import pe.edu.karely.service.impl.doctores.*;
import pe.edu.karely.service.impl.finanzas.*;
import pe.edu.karely.service.impl.pacientes.*;
import pe.edu.karely.service.impl.reportes.*;

import java.math.BigDecimal;
import java.time.LocalDate;

class AdministradoraAccesoTest {
    private PermisosUsuario permisos(String rol) {
        var usuarios = mock(UsuarioRepository.class);
        when(usuarios.rolActivo(7)).thenReturn(new RolActivoDTO(rol));
        return new PermisosUsuario(usuarios);
    }

    @Test
    void administradoraRegistraPagoConSuIdentidad() {
        var repo = mock(LiquidacionRepository.class);
        var service = new LiquidacionServiceImpl(repo, permisos("ADMINISTRADORA"));
        var fecha = LocalDate.now();
        service.pagarDoctor(
                new PagoDoctorRequestDTO(
                        1L, fecha, fecha, new BigDecimal("30"), "EFECTIVO", "OP-2", "BOL-2"),
                7);
        verify(repo)
                .pagarDoctor(
                        eq(7L),
                        eq(7L),
                        eq(1L),
                        eq(fecha),
                        eq(fecha),
                        eq(new BigDecimal("30")),
                        eq("EFECTIVO"),
                        startsWith("OP-"),
                        startsWith("BOL-"));
    }

    @Test
    void administradoraRegistraAsistenciaEIniciaAtencionSinSerDoctor() {
        var citas = mock(CitaRepository.class);
        new CitaServiceImpl(citas, permisos("ADMINISTRADORA")).registrarAsistencia(12, 7);
        verify(citas).registrarAsistencia(7, 7, 12L);
        var atenciones = mock(AtencionMedicaRepository.class);
        new AtencionMedicaServiceImpl(atenciones, permisos("ADMINISTRADORA"))
                .iniciarAtencion(12, 7);
        verify(atenciones).iniciarAtencion(7, 7, 12L);
    }

    @Test
    void recepcionistaNoPuedePagarNiIniciarAtencion() {
        var pagos = mock(LiquidacionRepository.class);
        var atenciones = mock(AtencionMedicaRepository.class);
        assertThrows(
                org.springframework.security.access.AccessDeniedException.class,
                () ->
                        new LiquidacionServiceImpl(pagos, permisos("RECEPCIONISTA"))
                                .pagarDoctor(null, 7));
        assertThrows(
                org.springframework.security.access.AccessDeniedException.class,
                () ->
                        new AtencionMedicaServiceImpl(atenciones, permisos("RECEPCIONISTA"))
                                .iniciarAtencion(12, 7));
        verifyNoInteractions(pagos, atenciones);
    }

    @Test
    void migracionConservaPropiedadDelDoctorYActorDeAuditoria() throws Exception {
        var sql =
                java.nio.file.Files.readString(
                        java.nio.file.Path.of(
                                "../db/migraciones/2026-11-22-administradora-acceso-total.sql"));
        assertEquals(9, sql.split("CREATE OR REPLACE PROCEDURE", -1).length - 1);
        assertEquals(
                7,
                sql.split(
                                        "ID_USUARIO = P_ID_USUARIO OR"
                                            + " FN_ROL_USUARIO\\(P_ID_USUARIO\\) ="
                                            + " 'ADMINISTRADORA'",
                                        -1)
                                .length
                        - 1);
        assertTrue(sql.contains("NOT IN ('TESORERA','ADMINISTRADORA')"));
        assertTrue(sql.contains("NOT IN ('RECEPCIONISTA','ADMINISTRADORA')"));
        assertTrue(sql.contains("p_monto>v_saldo"));
        assertTrue(sql.contains("V_FECHA <> TRUNC(SYSDATE)"));
        assertTrue(sql.contains("P_ID_CITA, V_DOCTOR, CAST(SYSTIMESTAMP AS TIMESTAMP), 'ABIERTA'"));
        assertTrue(sql.contains("P_ID_USUARIO, 'ATENCION_MEDICA'"));
    }

    @Test
    void administradoraOperaTodasLasAccionesClinicas() {
        var repo = mock(AtencionMedicaRepository.class);
        var service = new AtencionMedicaServiceImpl(repo, permisos("ADMINISTRADORA"));
        service.registrarDiagnostico(
                12, new DiagnosticoRequestDTO("Diagnostico", "Observacion"), 7);
        service.registrarReceta(12, new RecetaRequestDTO("Indicaciones"), 7);
        service.agregarMedicamento(
                20,
                new MedicamentoRequestDTO(
                        "Medicamento", "Dosis", "Frecuencia", "Duracion", "Observacion"),
                7);
        service.emitirRecibo(12, new ReciboRequestDTO("RH-1"), 7);
        service.entregarRecibo(12, new EntregaReciboRequestDTO("PRESENCIAL"), 7);
        service.cerrarAtencion(12, 7);
        verify(repo).registrarDiagnostico(7, 7, 12L, "Diagnostico", "Observacion");
        verify(repo).registrarReceta(7, 7, 12L, "Indicaciones");
        verify(repo)
                .agregarMedicamento(
                        7, 7, 20L, "Medicamento", "Dosis", "Frecuencia", "Duracion", "Observacion");
        verify(repo).emitirRecibo(7, 7, 12L, "RH-1");
        verify(repo).entregarRecibo(7, 7, 12L, "PRESENCIAL");
        verify(repo).cerrarAtencion(7, 7, 12L);
    }

    @Test
    void agendaGeneralSoloParaAdministradoraYDoctorConservaFiltroPropio() {
        var repo = mock(CitaRepository.class);
        var fecha = LocalDate.now();
        new CitaServiceImpl(repo, permisos("ADMINISTRADORA")).filtrarAgendaMedica(7, fecha);
        verify(repo).filtrarAgendaGeneral(fecha);
        verify(repo, never()).filtrarAgendaMedica(anyLong(), any());
        new CitaServiceImpl(repo, permisos("DOCTOR")).filtrarAgendaMedica(7, fecha);
        verify(repo).filtrarAgendaMedica(7, fecha);
    }
}

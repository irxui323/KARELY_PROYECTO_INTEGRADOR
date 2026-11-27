package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockingDetails;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;

import pe.edu.karely.dto.atencion.DetalleAtencionResponseDTO;
import pe.edu.karely.dto.atencion.MedicamentoDetalleDTO;
import pe.edu.karely.repository.atencion.AtencionMedicaRepository;
import pe.edu.karely.repository.OracleJdbc;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.impl.atencion.AtencionMedicaServiceImpl;
import pe.edu.karely.service.impl.atencion.ReciboPdf;

class AtencionDetalleTest {
    @Test
    void detalleSeleccionaElIdDeRecetaAntesDeSusIndicaciones() {
        var jdbc = mock(OracleJdbc.class);
        var repository = new AtencionMedicaRepository(jdbc);

        repository.buscarDetalleCerrada(27, 1, "ADMINISTRADORA");

        String consulta =
                mockingDetails(jdbc).getInvocations().stream()
                        .map(invocacion -> invocacion.getArgument(1, String.class))
                        .findFirst()
                        .orElseThrow();
        int posicionIdReceta = consulta.indexOf("R.ID_RECETA");
        int posicionIndicaciones = consulta.indexOf("R.INDICACIONES");
        assertTrue(
                posicionIdReceta >= 0 && posicionIdReceta < posicionIndicaciones,
                "El ID de receta debe preceder a las indicaciones para el mapeo del detalle");
    }

    @Test
    void medicoConsultaElDetalleDeSuAtencionCerrada() {
        var repo = mock(AtencionMedicaRepository.class);
        var permisos = mock(PermisosUsuario.class);
        @SuppressWarnings("unchecked")
        var correos = mock(ObjectProvider.class);
        var detalle = new DetalleAtencionResponseDTO(
                18L, "Lucía Herrera", "Dra. Elena Rojas", "Medicina General",
                LocalDate.of(2026, 11, 23), "10:00", "ATENDIDA", "Control clínico",
                "Sin observaciones", "Descanso", List.of(new MedicamentoDetalleDTO(
                        "Paracetamol", "500 mg", "Cada 8 horas", "3 días", null)),
                "REC-0000000018", "EMAIL");
        when(permisos.rol(7)).thenReturn("DOCTOR");
        when(repo.buscarDetalleCerrada(18, 7, "DOCTOR")).thenReturn(detalle);
        var service = new AtencionMedicaServiceImpl(
                repo, permisos, mock(ReciboPdf.class), correos, "");

        var resultado = service.consultarDetalle(18, 7);

        assertSame(detalle, resultado);
        verify(permisos).exigir(7, "DOCTOR", "ADMINISTRADORA", "RECEPCIONISTA");
        verify(repo).buscarDetalleCerrada(18, 7, "DOCTOR");
    }

    @Test
    void recepcionistaConsultaElDetalleDeUnaAtencionCerrada() {
        var repo = mock(AtencionMedicaRepository.class);
        var permisos = mock(PermisosUsuario.class);
        @SuppressWarnings("unchecked")
        var correos = mock(ObjectProvider.class);
        var detalle = new DetalleAtencionResponseDTO(
                18L, "Lucía Herrera", "Dra. Elena Rojas", "Medicina General",
                LocalDate.of(2026, 11, 23), "10:00", "ATENDIDA", "Control clínico",
                "Sin observaciones", "Descanso", List.of(), "REC-0000000018", "EMAIL");
        when(permisos.rol(9)).thenReturn("RECEPCIONISTA");
        when(repo.buscarDetalleCerrada(18, 9, "RECEPCIONISTA")).thenReturn(detalle);
        var service = new AtencionMedicaServiceImpl(
                repo, permisos, mock(ReciboPdf.class), correos, "");

        assertSame(detalle, service.consultarDetalle(18, 9));

        verify(permisos).exigir(9, "DOCTOR", "ADMINISTRADORA", "RECEPCIONISTA");
        verify(repo).buscarDetalleCerrada(18, 9, "RECEPCIONISTA");
    }
}

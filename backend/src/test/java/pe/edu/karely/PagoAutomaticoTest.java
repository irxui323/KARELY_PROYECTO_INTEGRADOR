package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;

import pe.edu.karely.dto.finanzas.PagoDoctorRequestDTO;
import pe.edu.karely.repository.finanzas.LiquidacionRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.impl.finanzas.LiquidacionServiceImpl;

import java.math.BigDecimal;
import java.time.LocalDate;

class PagoAutomaticoTest {
    @Test
    void generaReferenciasCorrelativasLegiblesSinPedirlasAlUsuario() {
        var repo = mock(LiquidacionRepository.class);
        var service = new LiquidacionServiceImpl(repo, mock(PermisosUsuario.class));
        var fecha = LocalDate.now();
        when(repo.pagarDoctor(
                        anyLong(),
                        anyLong(),
                        anyLong(),
                        any(),
                        any(),
                        any(),
                        anyString(),
                        any(),
                        any()))
                .thenReturn(20L);
        when(repo.siguienteCorrelativo()).thenReturn(25L, 26L);
        var datos =
                new PagoDoctorRequestDTO(1L, fecha, fecha, BigDecimal.TEN, "EFECTIVO", null, null);
        var resultado = service.pagarDoctor(datos, 7);
        service.pagarDoctor(datos, 7);
        var op = org.mockito.ArgumentCaptor.forClass(String.class);
        var boleta = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(repo, times(2))
                .pagarDoctor(
                        eq(7L),
                        eq(7L),
                        eq(1L),
                        eq(fecha),
                        eq(fecha),
                        eq(BigDecimal.TEN),
                        eq("EFECTIVO"),
                        op.capture(),
                        boleta.capture());
        assertEquals("OP-2026-000025", op.getAllValues().get(0));
        assertEquals("BOL-2026-000025", boleta.getAllValues().get(0));
        assertEquals("OP-2026-000026", op.getAllValues().get(1));
        assertEquals("BOL-2026-000026", boleta.getAllValues().get(1));
        assertTrue(resultado.mensaje().contains(boleta.getAllValues().get(0)));
    }
}

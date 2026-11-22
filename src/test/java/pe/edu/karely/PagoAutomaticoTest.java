package pe.edu.karely;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import pe.edu.karely.repository.LiquidacionRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.impl.LiquidacionServiceImpl;
import pe.edu.karely.dto.finanzas.PagoDoctorRequestDTO;
import java.time.LocalDate;
import java.math.BigDecimal;
class PagoAutomaticoTest {
 @Test void generaReferenciasDiferentesEnElServidorSinPedirlasAlUsuario() {
  var repo=mock(LiquidacionRepository.class);
  var service=new LiquidacionServiceImpl(repo,mock(PermisosUsuario.class));
  var fecha=LocalDate.now();
  when(repo.pagarDoctor(anyLong(),anyLong(),anyLong(),any(),any(),any(),anyString(),any(),any())).thenReturn(20L);
  var datos=new PagoDoctorRequestDTO(1L,fecha,fecha,BigDecimal.TEN,"EFECTIVO",null,null);
  var resultado=service.pagarDoctor(datos,7);
  service.pagarDoctor(datos,7);
  var op=org.mockito.ArgumentCaptor.forClass(String.class);
  var boleta=org.mockito.ArgumentCaptor.forClass(String.class);
  verify(repo,times(2)).pagarDoctor(eq(7L),eq(7L),eq(1L),eq(fecha),eq(fecha),eq(BigDecimal.TEN),eq("EFECTIVO"),op.capture(),boleta.capture());
  assertTrue(op.getAllValues().get(0).startsWith("OP-"));
  assertTrue(boleta.getAllValues().get(0).startsWith("BOL-"));
  assertNotEquals(op.getAllValues().get(0),op.getAllValues().get(1));
  assertTrue(resultado.mensaje().contains(boleta.getAllValues().get(0)));
 }
}

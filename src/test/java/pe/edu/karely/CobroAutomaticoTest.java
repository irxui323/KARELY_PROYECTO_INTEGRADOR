package pe.edu.karely;

import org.junit.jupiter.api.Test;
import pe.edu.karely.dto.cita.ConfirmarCitaRequestDTO;
import pe.edu.karely.repository.CitaRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.impl.CitaServiceImpl;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class CobroAutomaticoTest {
    @Test void generaReferenciaParaTodosLosMetodosSinRecibirlaDelCliente() {
        var repo=mock(CitaRepository.class);
        var service=new CitaServiceImpl(repo,mock(PermisosUsuario.class));
        long reserva=20;
        for(String metodo:java.util.List.of("EFECTIVO","TARJETA","YAPE","PLIN","TRANSFERENCIA")) {
            long id=reserva++;
            String referencia="COBRO-"+String.format(java.util.Locale.ROOT,"%06d",id);
            when(repo.registrarCita(7,7,id,metodo,referencia)).thenReturn(50L);
            var respuesta=service.registrarCita(new ConfirmarCitaRequestDTO(id,metodo),7);
            verify(repo).registrarCita(7,7,id,metodo,referencia);
            assertTrue(respuesta.mensaje().contains(referencia));
        }
    }
    @Test void unFalloDeOracleNoDevuelveConfirmacionDeCobro() {
        var repo=mock(CitaRepository.class);
        when(repo.registrarCita(anyLong(),anyLong(),anyLong(),anyString(),anyString())).thenThrow(new IllegalArgumentException("Reserva vencida"));
        var service=new CitaServiceImpl(repo,mock(PermisosUsuario.class));
        assertThrows(IllegalArgumentException.class,()->service.registrarCita(new ConfirmarCitaRequestDTO(1L,"EFECTIVO"),7));
    }
}

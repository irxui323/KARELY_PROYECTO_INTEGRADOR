package pe.edu.karely;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;

import pe.edu.karely.repository.OracleJdbc;
import pe.edu.karely.service.impl.sistema.MantenimientoScheduler;

class MantenimientoSchedulerTest {

    @Test
    void ejecutaElMantenimientoAutomaticoConActorTecnico() {
        var jdbc = mock(OracleJdbc.class);

        new MantenimientoScheduler(jdbc).run();

        verify(jdbc).call("SP_TAREA_MANTENIMIENTO", 0L);
    }
}

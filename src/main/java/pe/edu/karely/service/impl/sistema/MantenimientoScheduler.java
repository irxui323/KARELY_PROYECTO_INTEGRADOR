package pe.edu.karely.service.impl.sistema;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import pe.edu.karely.repository.OracleJdbc;

/** Ejecuta tareas de limpieza y cancelación que corresponden al sistema, no a un usuario. */
@Component
public class MantenimientoScheduler {
    private static final Logger LOG = LoggerFactory.getLogger(MantenimientoScheduler.class);

    private final OracleJdbc jdbc;

    public MantenimientoScheduler(OracleJdbc jdbc) {
        this.jdbc = jdbc;
    }

    @Scheduled(fixedDelayString = "${app.maintenance.poll-ms:60000}")
    public void run() {
        try {
            jdbc.call("SP_TAREA_MANTENIMIENTO", 0L);
        } catch (Exception ex) {
            LOG.warn("No se pudo ejecutar el mantenimiento automático", ex);
        }
    }
}

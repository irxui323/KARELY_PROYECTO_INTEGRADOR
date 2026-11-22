package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.*;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.support.TransactionTemplate;

import pe.edu.karely.repository.DoctorRepository;
import pe.edu.karely.repository.OracleJdbc;

class DoctorEspecialidadPersistenciaTest {
    @Test
    void eliminaSoloLaRelacionIndicadaYRevierteSiFallaLaTransaccion() {
        var fuente =
                new DriverManagerDataSource(
                        "jdbc:h2:mem:especialidad-persistencia;MODE=Oracle;DB_CLOSE_DELAY=-1",
                        "sa",
                        "");
        var factory = new LocalContainerEntityManagerFactoryBean();
        factory.setDataSource(fuente);
        factory.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        factory.setPackagesToScan("pe.edu.karely.entity");
        factory.setJpaPropertyMap(java.util.Map.of("hibernate.hbm2ddl.auto", "create-drop"));
        factory.afterPropertiesSet();
        try {
            var emf = factory.getObject();
            var jdbc = new JdbcTemplate(fuente);
            var repo =
                    new DoctorRepository(
                            SharedEntityManagerCreator.createSharedEntityManager(emf),
                            new OracleJdbc(jdbc, fuente));
            var tx = new TransactionTemplate(new JpaTransactionManager(emf));
            tx.executeWithoutResult(
                    status -> {
                        for (int id = 1; id <= 2; id++) {
                            jdbc.update(
                                    "INSERT INTO"
                                        + " DOCTOR(ID_DOCTOR,TIPO_DOCUMENTO,NUMERO_DOCUMENTO,NOMBRES,APELLIDOS,ESTADO_DOCUMENTACION,ESTADO,FECHA_ALTA)"
                                        + " VALUES(?,'DNI',?,'Ana','Test','COMPLETO','ACTIVO',CURRENT_DATE)",
                                    id,
                                    "9900000" + id);
                            jdbc.update(
                                    "INSERT INTO"
                                        + " ESPECIALIDAD(ID_ESPECIALIDAD,NOMBRE,PRECIO_CONSULTA,ESTADO)"
                                        + " VALUES(?,?,100,'ACTIVO')",
                                    id,
                                    "Especialidad " + id);
                        }
                        repo.asignarEspecialidad(1L, 1L);
                        repo.asignarEspecialidad(1L, 2L);
                        repo.asignarEspecialidad(2L, 1L);
                    });
            assertThrows(
                    IllegalStateException.class,
                    () ->
                            tx.executeWithoutResult(
                                    status -> {
                                        assertEquals(1, repo.quitarEspecialidad(1, 1));
                                        throw new IllegalStateException(
                                                "Fallo simulado de auditoria");
                                    }));
            tx.executeWithoutResult(
                    status -> {
                        assertEquals(2, repo.listarEspecialidades(1).size());
                        assertEquals(1, repo.quitarEspecialidad(1, 1));
                        assertEquals(0, repo.quitarEspecialidad(1, 1));
                        assertEquals(2L, repo.listarEspecialidades(1).getFirst().idEspecialidad());
                        assertEquals(1, repo.listarEspecialidades(2).size());
                        assertEquals("COMPLETO", repo.bloquearDoctor(1).estadoDocumentacion());
                        assertEquals(
                                2,
                                jdbc.queryForObject(
                                        "SELECT COUNT(*) FROM ESPECIALIDAD", Integer.class));
                    });
        } finally {
            factory.destroy();
        }
    }
}

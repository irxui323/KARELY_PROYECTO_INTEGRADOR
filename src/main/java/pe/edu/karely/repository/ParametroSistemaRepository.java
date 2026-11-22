package pe.edu.karely.repository;

import org.springframework.stereotype.Repository;

import pe.edu.karely.dto.administracion.ParametroResponseDTO;

import java.util.List;

@Repository
public class ParametroSistemaRepository {
    private final OracleJdbc jdbc;

    public ParametroSistemaRepository(OracleJdbc jdbc) {
        this.jdbc = jdbc;
    }

    public List<ParametroResponseDTO> listarParametros() {
        return jdbc.list(
                ParametroResponseDTO.class,
                "SELECT ID_PARAMETRO,NOMBRE,VALOR,DESCRIPCION,ESTADO FROM PARAMETRO_SISTEMA ORDER"
                    + " BY NOMBRE");
    }

    public void configurarParametro(long actor, long usuario, String nombre, String valor) {
        jdbc.call("SP_CAMBIAR_PARAMETRO", actor, usuario, nombre, valor);
    }
}

package pe.edu.karely.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceUtils;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.time.LocalDate;
import java.util.*;

import javax.sql.DataSource;

@Component
public class OracleJdbc {
    private static final Logger LOG = LoggerFactory.getLogger(OracleJdbc.class);
    private static final Map<String, String> PROCEDIMIENTOS =
            Map.ofEntries(
                    Map.entry(
                            "SP_AGREGAR_MEDICAMENTO",
                            "{call SP_AGREGAR_MEDICAMENTO(?,?,?,?,?,?,?,?)}"),
                    Map.entry(
                            "SP_CAMBIAR_ESTADO_USUARIO", "{call SP_CAMBIAR_ESTADO_USUARIO(?,?,?)}"),
                    Map.entry("SP_CAMBIAR_PARAMETRO", "{call SP_CAMBIAR_PARAMETRO(?,?,?)}"),
                    Map.entry("SP_CAMBIAR_ROL_USUARIO", "{call SP_CAMBIAR_ROL_USUARIO(?,?,?)}"),
                    Map.entry("SP_CANCELAR_REPROGRAMADA", "{call SP_CANCELAR_REPROGRAMADA(?,?,?)}"),
                    Map.entry("SP_CERRAR_ATENCION", "{call SP_CERRAR_ATENCION(?,?)}"),
                    Map.entry(
                            "SP_CONFIRMAR_CITA_PAGADA",
                            "{call SP_CONFIRMAR_CITA_PAGADA(?,?,?,?,?)}"),
                    Map.entry("SP_CREAR_RECETA", "{call SP_CREAR_RECETA(?,?,?,?)}"),
                    Map.entry("SP_CREAR_USUARIO", "{call SP_CREAR_USUARIO(?,?,?,?,?,?)}"),
                    Map.entry("SP_EMITIR_RECIBO", "{call SP_EMITIR_RECIBO(?,?,?,?)}"),
                    Map.entry(
                            "SP_ENCOLAR_NOTIFICACION_CITA",
                            "{call SP_ENCOLAR_NOTIFICACION_CITA(?,?,?,?)}"),
                    Map.entry("SP_ENTREGAR_RECIBO", "{call SP_ENTREGAR_RECIBO(?,?,?)}"),
                    Map.entry("SP_INICIAR_ATENCION", "{call SP_INICIAR_ATENCION(?,?,?)}"),
                    Map.entry("SP_PAGAR_DOCTOR", "{call SP_PAGAR_DOCTOR(?,?,?,?,?,?,?,?,?)}"),
                    Map.entry(
                            "SP_PRE_RESERVAR_CITA", "{call SP_PRE_RESERVAR_CITA(?,?,?,?,?,?,?,?)}"),
                    Map.entry("SP_REGISTRAR_ASISTENCIA", "{call SP_REGISTRAR_ASISTENCIA(?,?,?)}"),
                    Map.entry(
                            "SP_REGISTRAR_DIAGNOSTICO", "{call SP_REGISTRAR_DIAGNOSTICO(?,?,?,?)}"),
                    Map.entry(
                            "SP_REGISTRAR_DISPONIBILIDAD",
                            "{call SP_REGISTRAR_DISPONIBILIDAD(?,?,?,?,?,?)}"),
                    Map.entry(
                            "SP_REGISTRAR_RESULTADO_ENVIO",
                            "{call SP_REGISTRAR_RESULTADO_ENVIO(?,?,?,?,?)}"),
                    Map.entry("SP_REPROGRAMAR_CITA", "{call SP_REPROGRAMAR_CITA(?,?,?,?,?,?,?)}"),
                    Map.entry("SP_TAREA_MANTENIMIENTO", "{call SP_TAREA_MANTENIMIENTO}"),
                    Map.entry("SP_TOMAR_NOTIFICACION", "{call SP_TOMAR_NOTIFICACION(?,?,?,?,?,?)}"),
                    Map.entry("SP_VALIDAR_DOCUMENTACION", "{call SP_VALIDAR_DOCUMENTACION(?,?)}"));

    private final JdbcTemplate jdbc;
    private final DataSource dataSource;

    public OracleJdbc(JdbcTemplate jdbc, DataSource dataSource) {
        this.jdbc = jdbc;
        this.dataSource = dataSource;
    }

    public <T> List<T> list(Class<T> type, String sql, Object... params) {
        return jdbc.query(
                sql, new org.springframework.jdbc.core.DataClassRowMapper<>(type), convert(params));
    }

    public <T> T one(Class<T> type, String sql, Object... params) {
        return org.springframework.dao.support.DataAccessUtils.singleResult(
                list(type, sql, params));
    }

    @SuppressWarnings("java:S2077")
    public <T> pe.edu.karely.dto.PaginaResponseDTO<T> pagina(
            Class<T> type,
            String consulta,
            String orden,
            List<String> campos,
            int pagina,
            int tamanio,
            String filtro,
            Object... params) {
        pe.edu.karely.dto.PaginaResponseDTO.validar(pagina, tamanio);
        String sql = "SELECT * FROM (" + consulta + ") DATOS";
        var argumentos = new ArrayList<Object>(Arrays.asList(params));
        if (filtro != null && !filtro.isBlank() && !campos.isEmpty()) {
            if (filtro.length() > 150)
                throw new IllegalArgumentException("La búsqueda admite hasta 150 caracteres");
            String busqueda =
                    "%"
                            + filtro.trim()
                                    .toLowerCase(Locale.ROOT)
                                    .replace("!", "!!")
                                    .replace("%", "!%")
                                    .replace("_", "!_")
                            + "%";
            sql +=
                    " WHERE ("
                            + campos.stream()
                                    .map(
                                            c ->
                                                    "LOWER(COALESCE(CAST("
                                                            + c
                                                            + " AS VARCHAR(500)),'')) LIKE ? ESCAPE"
                                                            + " '!' ")
                                    .collect(java.util.stream.Collectors.joining(" OR "))
                            + " OR LOWER("
                            + campos.stream()
                                    .map(c -> "COALESCE(CAST(" + c + " AS VARCHAR(500)),' ')")
                                    .collect(java.util.stream.Collectors.joining(" || ' ' || "))
                            + ") LIKE ? ESCAPE '!')";
            campos.forEach(c -> argumentos.add(busqueda));
            argumentos.add(busqueda);
        }
        Long total =
                jdbc.queryForObject(
                        "SELECT COUNT(*) FROM (" + sql + ") TOTAL",
                        Long.class,
                        convert(argumentos.toArray()));
        argumentos.add((long) pagina * tamanio);
        argumentos.add(tamanio);
        var contenido =
                list(
                        type,
                        sql + " ORDER BY " + orden + " OFFSET ? ROWS FETCH NEXT ? ROWS ONLY",
                        argumentos.toArray());
        return pe.edu.karely.dto.PaginaResponseDTO.crear(
                contenido, pagina, tamanio, total == null ? 0 : total);
    }

    public Long callId(String procedure, long actor, Object... args) {
        return ((Number) call(procedure, actor, args).getFirst()).longValue();
    }

    public int update(String sql, Object... params) {
        return jdbc.update(sql, convert(params));
    }

    public static Object[] convert(Object... params) {
        Object[] result = new Object[params.length];
        for (int i = 0; i < params.length; i++)
            result[i] = params[i] instanceof LocalDate d ? java.sql.Date.valueOf(d) : params[i];
        return result;
    }

    public record Out(int sqlType) {}

    public static Out outNumber() {
        return new Out(Types.NUMERIC);
    }

    public static Out outText() {
        return new Out(Types.VARCHAR);
    }

    public List<Object> call(String procedure, long actor, Object... args) {
        String sql = procedure == null ? null : PROCEDIMIENTOS.get(procedure);
        if (sql == null) throw new IllegalArgumentException("Procedimiento no permitido");
        Connection connection = DataSourceUtils.getConnection(dataSource);
        try {
            try (CallableStatement setId =
                    connection.prepareCall("begin DBMS_SESSION.SET_IDENTIFIER(?); end;")) {
                setId.setString(1, Long.toString(actor));
                setId.execute();
            }
            List<Integer> outputs = new ArrayList<>();
            try (CallableStatement cs = connection.prepareCall(sql)) {
                for (int i = 0; i < args.length; i++) {
                    Object v = args[i];
                    if (v instanceof Out out) {
                        cs.registerOutParameter(i + 1, out.sqlType());
                        outputs.add(i + 1);
                    } else if (v instanceof LocalDate date)
                        cs.setDate(i + 1, java.sql.Date.valueOf(date));
                    else if (v == null) cs.setNull(i + 1, Types.VARCHAR);
                    else cs.setObject(i + 1, v);
                }
                cs.execute();
                List<Object> result = new ArrayList<>();
                for (int idx : outputs) result.add(cs.getObject(idx));
                return result;
            }
        } catch (SQLException ex) {
            throw new org.springframework.jdbc.UncategorizedSQLException(
                    procedure, "{call ...}", ex);
        } finally {
            try (CallableStatement clear =
                    connection.prepareCall("begin DBMS_SESSION.CLEAR_IDENTIFIER; end;")) {
                clear.execute();
            } catch (SQLException ex) {
                LOG.debug("No se pudo limpiar el identificador de sesión de Oracle", ex);
            }
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    public Long insertReturning(String plsql, Object... params) {
        Connection con = DataSourceUtils.getConnection(dataSource);
        try (CallableStatement cs = con.prepareCall(plsql)) {
            for (int i = 0; i < params.length; i++) {
                if (params[i] instanceof byte[] bytes)
                    cs.setBlob(i + 1, new java.io.ByteArrayInputStream(bytes), bytes.length);
                else if (params[i] instanceof LocalDate d)
                    cs.setDate(i + 1, java.sql.Date.valueOf(d));
                else if (params[i] == null) cs.setNull(i + 1, Types.VARCHAR);
                else cs.setObject(i + 1, params[i]);
            }
            cs.registerOutParameter(params.length + 1, Types.NUMERIC);
            cs.execute();
            return cs.getLong(params.length + 1);
        } catch (SQLException e) {
            throw new org.springframework.jdbc.UncategorizedSQLException(
                    "insertReturning", plsql, e);
        } finally {
            DataSourceUtils.releaseConnection(con, dataSource);
        }
    }

    public <T> List<T> query(
            String sql, org.springframework.jdbc.core.RowMapper<T> mapper, Object... params) {
        return jdbc.query(sql, mapper, convert(params));
    }
}

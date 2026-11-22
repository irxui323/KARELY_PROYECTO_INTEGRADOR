package pe.edu.karely.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceUtils;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.time.LocalDate;
import java.util.*;

import javax.sql.DataSource;

@Component
public class OracleJdbc {
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
        if (!procedure.matches("SP_[A-Z0-9_]+"))
            throw new IllegalArgumentException("Procedimiento no permitido");
        Connection connection = DataSourceUtils.getConnection(dataSource);
        try {
            try (CallableStatement setId =
                    connection.prepareCall("begin DBMS_SESSION.SET_IDENTIFIER(?); end;")) {
                setId.setString(1, Long.toString(actor));
                setId.execute();
            }
            List<Integer> outputs = new ArrayList<>();
            String marks = String.join(",", Collections.nCopies(args.length, "?"));
            try (CallableStatement cs =
                    connection.prepareCall("{call " + procedure + "(" + marks + ")}")) {
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

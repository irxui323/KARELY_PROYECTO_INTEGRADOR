package pe.edu.karely.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import pe.edu.karely.dto.ErrorResponseDTO;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final Pattern MENSAJE_ORACLE =
            Pattern.compile("(?m)^\\h*(ORA-20\\d{3}:[^\\r\\n]+)");

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponseDTO> uploadTooLarge(MaxUploadSizeExceededException e) {
        return error(413, "El archivo supera el máximo permitido de 10 MB");
    }

    @ExceptionHandler({
        HttpMessageNotReadableException.class,
        MethodArgumentTypeMismatchException.class,
        ServletRequestBindingException.class,
        MissingServletRequestPartException.class,
        HandlerMethodValidationException.class
    })
    public ResponseEntity<ErrorResponseDTO> malformedRequest(Exception e) {
        return error(400, "Formato de solicitud inválido");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> invalidBody(MethodArgumentNotValidException e) {
        Map<String, String> validationErrors = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(
                field -> validationErrors.put(field.getField(), field.getDefaultMessage()));
        return error(400, "Existen errores de validación", validationErrors);
    }

    @ExceptionHandler({IllegalArgumentException.class, ReglaNegocioException.class})
    public ResponseEntity<ErrorResponseDTO> invalid(RuntimeException e) {
        return error(400, e.getMessage() == null ? "Datos inválidos" : e.getMessage());
    }

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponseDTO> missing(RecursoNoEncontradoException e) {
        return error(404, e.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponseDTO> missingRoute(NoResourceFoundException e) {
        return error(404, "Recurso no encontrado");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDTO> denied(AccessDeniedException e) {
        return error(403, "Acceso no autorizado");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponseDTO> authentication(AuthenticationException e) {
        return error(401, "Credenciales incorrectas");
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponseDTO> status(ResponseStatusException e) {
        String reason = e.getReason();
        return error(
                e.getStatusCode().value(),
                reason == null || reason.isBlank() ? "Solicitud rechazada" : reason);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponseDTO> sql(DataAccessException e) {
        if (e instanceof DuplicateKeyException) {
            return error(
                    409, "Ya existe un registro con esos datos. Revise los registros existentes.");
        }
        for (Throwable cause = e; cause != null; cause = cause.getCause()) {
            if (cause instanceof SQLException sql
                    && sql.getErrorCode() >= 20000
                    && sql.getErrorCode() <= 20999) {
                var message =
                        MENSAJE_ORACLE.matcher(sql.getMessage() == null ? "" : sql.getMessage());
                return error(
                        400,
                        message.find() ? message.group(1).replaceFirst("^ORA-20\\d{3}:\\s*", "").strip() : "No se pudo completar la operación. Revisa los datos ingresados.");
            }
        }
        LOG.error("Fallo interno de base de datos", e);
        return error(500, "No se pudo completar la operación. Inténtalo de nuevo en unos minutos.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> other(Exception e) {
        LOG.error("Fallo del servidor", e);
        return error(500, "No se pudo completar la operación. Inténtalo de nuevo en unos minutos.");
    }

    private ResponseEntity<ErrorResponseDTO> error(int status, String detail) {
        return error(status, detail, null);
    }

    private ResponseEntity<ErrorResponseDTO> error(
            int status, String detail, Map<String, String> validationErrors) {
        var attributes = RequestContextHolder.getRequestAttributes();
        String path = attributes instanceof ServletRequestAttributes servlet
                ? servlet.getRequest().getRequestURI() : null;
        return ResponseEntity.status(status).body(new ErrorResponseDTO(
                LocalDateTime.now(), status, HttpStatus.valueOf(status).getReasonPhrase(),
                detail, path, validationErrors));
    }
}

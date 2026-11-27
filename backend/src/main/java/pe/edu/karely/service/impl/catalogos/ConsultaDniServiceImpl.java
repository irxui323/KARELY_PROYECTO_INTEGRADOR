package pe.edu.karely.service.impl.catalogos;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.edu.karely.dto.catalogo.ConsultaDniResponseDTO;
import pe.edu.karely.exception.RecursoNoEncontradoException;
import pe.edu.karely.exception.ReglaNegocioException;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.catalogos.ConsultaDniService;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class ConsultaDniServiceImpl implements ConsultaDniService {
    private final HttpClient cliente;
    private final ObjectMapper mapper;
    private final PermisosUsuario permisos;
    private final boolean enabled;
    private final String endpoint;
    private final String token;

    @Autowired
    public ConsultaDniServiceImpl(
            PermisosUsuario permisos,
            ObjectMapper mapper,
            @Value("${app.dni.enabled:false}") boolean enabled,
            @Value("${app.dni.endpoint-url:https://api.endpoint.pe/v1/dni}") String endpoint,
            @Value("${app.dni.token:}") String token) {
        this(
                HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build(),
                permisos,
                mapper,
                enabled,
                endpoint,
                token);
    }

    ConsultaDniServiceImpl(
            HttpClient cliente,
            PermisosUsuario permisos,
            ObjectMapper mapper,
            boolean enabled,
            String endpoint,
            String token) {
        this.cliente = cliente;
        this.permisos = permisos;
        this.mapper = mapper;
        this.enabled = enabled;
        int fin = endpoint.length();
        while (fin > 0 && endpoint.charAt(fin - 1) == '/') {
            fin--;
        }
        this.endpoint = endpoint.substring(0, fin);
        this.token = token;
    }

    @Override
    public ConsultaDniResponseDTO consultar(String dni, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA", "RECEPCIONISTA");
        if (!dni.matches("\\d{8}")) {
            throw new ReglaNegocioException("El DNI debe tener 8 dígitos");
        }
        if (!enabled || token.isBlank()) {
            throw new ReglaNegocioException("La consulta DNI no está configurada");
        }
        try {
            var request =
                    HttpRequest.newBuilder(URI.create(endpoint + "/" + dni))
                            .header("Authorization", "Bearer " + token)
                            .header("Accept", "application/json")
                            .timeout(Duration.ofSeconds(8))
                            .GET()
                            .build();
            var response = cliente.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 404) {
                throw new RecursoNoEncontradoException("No se encontró información para este DNI");
            }
            if (response.statusCode() != 200) {
                throw new ReglaNegocioException("No fue posible consultar el DNI en este momento");
            }
            JsonNode data = mapper.readTree(response.body()).path("data");
            if (data.isMissingNode() || data.isNull()) {
                throw new ReglaNegocioException("No fue posible consultar el DNI en este momento");
            }
            return new ConsultaDniResponseDTO(
                    dni,
                    data.path("nombres").asText(),
                    data.path("apellido_paterno").asText(),
                    data.path("apellido_materno").asText());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ReglaNegocioException("La consulta DNI fue interrumpida");
        } catch (IOException e) {
            throw new ReglaNegocioException("No fue posible consultar el DNI en este momento");
        }
    }
}

package pe.edu.karely;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import pe.edu.karely.security.JwtService;

import tools.jackson.databind.json.JsonMapper;

class JwtServiceTest {
    @Test
    void tokenValidoYConFirma() {
        JwtService jwt =
                new JwtService(
                        "este-secret-de-pruebas-unicamente-largo-40",
                        60,
                        JsonMapper.builder().build());
        String token = jwt.issue(11, 22, "DOCTOR");
        assertEquals(11, jwt.verify(token).userId());
        assertEquals(22, jwt.verify(token).sessionId());
        assertEquals("DOCTOR", jwt.verify(token).role());
        assertThrows(IllegalArgumentException.class, () -> jwt.verify(token + "x"));
    }
}

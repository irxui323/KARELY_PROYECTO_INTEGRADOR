package pe.edu.karely.dto.catalogo;

import java.math.BigDecimal;

public record EspecialidadResponseDTO(
        Long idEspecialidad, String nombre, BigDecimal precioConsulta, String estado) {}

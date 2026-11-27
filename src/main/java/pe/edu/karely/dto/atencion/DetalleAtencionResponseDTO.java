package pe.edu.karely.dto.atencion;

import java.time.LocalDate;
import java.util.List;

public record DetalleAtencionResponseDTO(
        Long idCita,
        String paciente,
        String doctor,
        String especialidad,
        LocalDate fechaCita,
        String horaInicio,
        String estadoCita,
        String diagnostico,
        String observaciones,
        String indicacionesReceta,
        List<MedicamentoDetalleDTO> medicamentos,
        String numeroRecibo,
        String medioEntrega) {}

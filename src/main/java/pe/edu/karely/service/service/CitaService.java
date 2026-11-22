package pe.edu.karely.service.service;
import java.util.List;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.cita.CancelarCitaRequestDTO;
import pe.edu.karely.dto.cita.CitaResponseDTO;
import pe.edu.karely.dto.cita.ConfirmarCitaRequestDTO;
import pe.edu.karely.dto.cita.ReprogramarCitaRequestDTO;
import pe.edu.karely.dto.cita.ReservaRequestDTO;
import pe.edu.karely.dto.cita.ReservaResponseDTO;
public interface CitaService {
List<pe.edu.karely.dto.cita.DisponibilidadDiaDTO> disponibilidadMes(long especialidad,java.time.LocalDate mes,Long consultorio,long actor);
List<pe.edu.karely.dto.cita.DoctorDisponibleDTO> disponibilidad(long especialidad,java.time.LocalDate fecha,Long consultorio,long actor);
List<CitaResponseDTO> listarCitas(long actor);
List<ReservaResponseDTO> listarReservas(long actor);
OperacionResponseDTO bloquearTurno(ReservaRequestDTO i, long actor);
OperacionResponseDTO registrarCita(ConfirmarCitaRequestDTO i, long actor);
OperacionResponseDTO reprogramarCita(long idCita, ReprogramarCitaRequestDTO i, long actor);
OperacionResponseDTO registrarAsistencia(long idCita, long actor);
List<CitaResponseDTO> filtrarAgendaMedica(long actor, java.time.LocalDate fecha);
CitaResponseDTO detalleCitaMedica(long actor, long idCita);
OperacionResponseDTO cancelarReprogramada(long idCita, CancelarCitaRequestDTO request, long actor);
}

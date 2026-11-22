package pe.edu.karely.service.service;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.doctor.*;
import pe.edu.karely.dto.doctor.AsignarEspecialidadRequestDTO;
import pe.edu.karely.dto.doctor.DoctorRequestDTO;
import pe.edu.karely.dto.doctor.DoctorResponseDTO;

import java.util.List;

public interface DoctorService {
    List<DoctorResponseDTO> listarDoctores(long actor);

    OperacionResponseDTO registrarDoctor(DoctorRequestDTO i, long actor);

    OperacionResponseDTO editarDoctor(long idDoctor, DoctorRequestDTO i, long actor);

    AccesoDoctorResponseDTO crearAcceso(long idDoctor, CrearAccesoRequestDTO request, long actor);

    OperacionResponseDTO rechazarDocumento(
            long idDoctor, long idDocumento, RechazarDocumentoRequestDTO request, long actor);

    OperacionResponseDTO asignarEspecialidad(
            long idDoctor, AsignarEspecialidadRequestDTO i, long actor);

    List<pe.edu.karely.dto.catalogo.EspecialidadResponseDTO> listarEspecialidades(
            long idDoctor, long actor);

    OperacionResponseDTO quitarEspecialidad(long idDoctor, long idEspecialidad, long actor);

    OperacionResponseDTO validarDocumentacion(
            long idDoctor, ValidarDocumentacionRequestDTO revision, long actor);

    List<DoctorResponseDTO> buscarPorDocumento(String documento, long actor);

    List<DoctorResponseDTO> listarPendientes(long actor);

    List<DoctorResponseDTO> listarConDocumentacionCompleta(long actor);

    DoctorResponseDTO buscarPorId(long id, long actor);
}

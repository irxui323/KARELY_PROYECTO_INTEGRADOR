package pe.edu.karely.service.service;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.administracion.AccesoUsuarioResponseDTO;
import pe.edu.karely.dto.administracion.AsignarRolRequestDTO;
import pe.edu.karely.dto.administracion.EstadoUsuarioRequestDTO;
import pe.edu.karely.dto.administracion.RolResponseDTO;
import pe.edu.karely.dto.administracion.UsuarioRequestDTO;
import pe.edu.karely.dto.administracion.UsuarioResponseDTO;

import java.util.List;

public interface UsuarioService {
    List<RolResponseDTO> listarRoles(long actor);

    List<UsuarioResponseDTO> listarUsuarios(long actor);

    OperacionResponseDTO asignarRol(long idUsuario, AsignarRolRequestDTO i, long actor);

    OperacionResponseDTO cambiarEstado(long idUsuario, EstadoUsuarioRequestDTO i, long actor);

    AccesoUsuarioResponseDTO registrarUsuario(UsuarioRequestDTO i, long actor);
}

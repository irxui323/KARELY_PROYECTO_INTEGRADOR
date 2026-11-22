package pe.edu.karely.service.service;
import java.util.List;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.administracion.AsignarRolRequestDTO;
import pe.edu.karely.dto.administracion.EstadoUsuarioRequestDTO;
import pe.edu.karely.dto.administracion.RolResponseDTO;
import pe.edu.karely.dto.administracion.UsuarioRequestDTO;
import pe.edu.karely.dto.administracion.UsuarioResponseDTO;
public interface UsuarioService {
List<RolResponseDTO> listarRoles(long actor);
List<UsuarioResponseDTO> listarUsuarios(long actor);
OperacionResponseDTO asignarRol(long idUsuario, AsignarRolRequestDTO i, long actor);
OperacionResponseDTO cambiarEstado(long idUsuario, EstadoUsuarioRequestDTO i, long actor);
OperacionResponseDTO registrarUsuario(UsuarioRequestDTO i, long actor);
}

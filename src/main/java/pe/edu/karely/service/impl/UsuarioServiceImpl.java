package pe.edu.karely.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.administracion.AccesoUsuarioResponseDTO;
import pe.edu.karely.dto.administracion.AsignarRolRequestDTO;
import pe.edu.karely.dto.administracion.EstadoUsuarioRequestDTO;
import pe.edu.karely.dto.administracion.RolResponseDTO;
import pe.edu.karely.dto.administracion.UsuarioRequestDTO;
import pe.edu.karely.dto.administracion.UsuarioResponseDTO;
import pe.edu.karely.repository.UsuarioRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.UsuarioService;

import java.util.List;

@Service
public class UsuarioServiceImpl implements UsuarioService {
    private final UsuarioRepository repository;
    private final org.springframework.security.crypto.password.PasswordEncoder encoder;
    private final PermisosUsuario permisos;

    public UsuarioServiceImpl(
            UsuarioRepository repository,
            PermisosUsuario permisos,
            org.springframework.security.crypto.password.PasswordEncoder encoder) {
        this.encoder = encoder;
        this.repository = repository;
        this.permisos = permisos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RolResponseDTO> listarRoles(long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        return repository.listarRoles();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarUsuarios(long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        return repository.listarUsuarios();
    }

    @Override
    @Transactional
    public OperacionResponseDTO asignarRol(long idUsuario, AsignarRolRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        repository.asignarRol(actor, actor, idUsuario, i.idRol());
        return OperacionResponseDTO.resultado("SP_CAMBIAR_ROL_USUARIO", null);
    }

    @Override
    @Transactional
    public OperacionResponseDTO cambiarEstado(
            long idUsuario, EstadoUsuarioRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        repository.cambiarEstado(actor, actor, idUsuario, i.estado());
        return OperacionResponseDTO.resultado("SP_CAMBIAR_ESTADO_USUARIO", null);
    }

    @Override
    @Transactional
    public AccesoUsuarioResponseDTO registrarUsuario(UsuarioRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        var rol =
                repository.listarRoles().stream()
                        .filter(r -> r.idRol().equals(i.idRol()) && "ACTIVO".equals(r.estado()))
                        .findFirst()
                        .orElseThrow(
                                () -> new IllegalArgumentException("Selecciona un rol activo"));
        if ("DOCTOR".equals(rol.nombre()))
            throw new IllegalArgumentException(
                    "Crea el acceso médico desde Doctores después de validar su documentación");
        String password = i.password();
        if (password == null) {
            byte[] bytes = new byte[18];
            new java.security.SecureRandom().nextBytes(bytes);
            password = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        }
        if (password.length() < 12) {
            throw new IllegalArgumentException("Contraseña mínima: 12 caracteres");
        }
        Long id =
                repository.crearUsuario(
                        actor, i.idRol(), i.username(), i.correo(), encoder.encode(password));
        return new AccesoUsuarioResponseDTO(id, i.username(), i.correo(), password);
    }
}

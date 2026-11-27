package pe.edu.karely.service.impl.administracion;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.administracion.ParametroRequestDTO;
import pe.edu.karely.dto.administracion.ParametroResponseDTO;
import pe.edu.karely.repository.administracion.ParametroSistemaRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.service.service.administracion.ParametroSistemaService;

import java.util.List;

@Service
public class ParametroSistemaServiceImpl implements ParametroSistemaService {
    private final ParametroSistemaRepository repository;
    private final PermisosUsuario permisos;

    public ParametroSistemaServiceImpl(
            ParametroSistemaRepository repository, PermisosUsuario permisos) {
        this.repository = repository;
        this.permisos = permisos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParametroResponseDTO> listarParametros(long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        return repository.listarParametros();
    }

    @Override
    @Transactional
    public OperacionResponseDTO configurarParametro(
            String nombre, ParametroRequestDTO i, long actor) {
        permisos.exigir(actor, "ADMINISTRADORA");
        repository.configurarParametro(actor, actor, nombre, i.valor());
        return OperacionResponseDTO.resultado("SP_CAMBIAR_PARAMETRO", null);
    }
}

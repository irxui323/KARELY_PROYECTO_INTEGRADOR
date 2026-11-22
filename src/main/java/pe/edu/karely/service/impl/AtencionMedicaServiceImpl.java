package pe.edu.karely.service.impl;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.karely.repository.AtencionMedicaRepository;
import pe.edu.karely.security.PermisosUsuario;
import pe.edu.karely.dto.OperacionResponseDTO;
import pe.edu.karely.dto.atencion.AtencionResponseDTO;
import pe.edu.karely.dto.atencion.DiagnosticoRequestDTO;
import pe.edu.karely.dto.atencion.EntregaReciboRequestDTO;
import pe.edu.karely.dto.atencion.MedicamentoRequestDTO;
import pe.edu.karely.dto.atencion.RecetaRequestDTO;
import pe.edu.karely.dto.atencion.ReciboRequestDTO;
import pe.edu.karely.service.service.AtencionMedicaService;
@Service
public class AtencionMedicaServiceImpl implements AtencionMedicaService {
    private final AtencionMedicaRepository repository;
    private final PermisosUsuario permisos;
    public AtencionMedicaServiceImpl(AtencionMedicaRepository repository, PermisosUsuario permisos) {
        this.repository = repository;
        this.permisos = permisos;
    }

@Override
    @Transactional(readOnly = true)
    public List<AtencionResponseDTO> listarAtenciones(long actor) {
        String rol = permisos.rol(actor);
        permisos.exigir(actor,"DOCTOR","ADMINISTRADORA");return rol.equals("DOCTOR") ? repository.listarAtencionesDelMedico(actor):repository.listarAtencionesGeneral();
    }

@Override
    @Transactional
    public OperacionResponseDTO iniciarAtencion(long idCita, long actor) {
        permisos.exigir(actor,"DOCTOR","ADMINISTRADORA");
        return OperacionResponseDTO.resultado("SP_INICIAR_ATENCION", repository.iniciarAtencion(actor, actor, idCita));
    }

@Override
    @Transactional
    public OperacionResponseDTO registrarDiagnostico(long idCita, DiagnosticoRequestDTO i, long actor) {
        permisos.exigir(actor,"DOCTOR","ADMINISTRADORA");
        repository.registrarDiagnostico(actor, actor, idCita, i.diagnostico(), i.observaciones());
        return OperacionResponseDTO.resultado("SP_REGISTRAR_DIAGNOSTICO", null);
    }

@Override
    @Transactional
    public OperacionResponseDTO registrarReceta(long idCita, RecetaRequestDTO i, long actor) {
        permisos.exigir(actor,"DOCTOR","ADMINISTRADORA");
        return OperacionResponseDTO.resultado("SP_CREAR_RECETA", repository.registrarReceta(actor, actor, idCita, i.indicaciones()));
    }

@Override
    @Transactional
    public OperacionResponseDTO agregarMedicamento(long idReceta, MedicamentoRequestDTO i, long actor) {
        permisos.exigir(actor,"DOCTOR","ADMINISTRADORA");
        return OperacionResponseDTO.resultado("SP_AGREGAR_MEDICAMENTO", repository.agregarMedicamento(actor, actor, idReceta, i.medicamento(), i.dosis(), i.frecuencia(), i.duracion(), i.observaciones()));
    }

@Override
    @Transactional
    public OperacionResponseDTO emitirRecibo(long idCita, ReciboRequestDTO i, long actor) {
        permisos.exigir(actor,"DOCTOR","ADMINISTRADORA");
        return OperacionResponseDTO.resultado("SP_EMITIR_RECIBO", repository.emitirRecibo(actor, actor, idCita, i.numeroRecibo()));
    }

@Override
    @Transactional
    public OperacionResponseDTO entregarRecibo(long idCita, EntregaReciboRequestDTO i, long actor) {
        permisos.exigir(actor,"DOCTOR","ADMINISTRADORA");
        repository.entregarRecibo(actor, actor, idCita, i.medioEntrega());
        return OperacionResponseDTO.resultado("SP_ENTREGAR_RECIBO", null);
    }

@Override
    @Transactional
    public OperacionResponseDTO cerrarAtencion(long idCita, long actor) {
        permisos.exigir(actor,"DOCTOR","ADMINISTRADORA");
        repository.cerrarAtencion(actor, actor, idCita);
        return OperacionResponseDTO.resultado("SP_CERRAR_ATENCION", null);
    }

}

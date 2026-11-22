package pe.edu.karely.dto.paciente;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
public record PacienteRequestDTO(
    @NotBlank @Size(max=12) String tipoDocumento,
    @NotBlank @Size(max=20) String numeroDocumento,
    @NotBlank @Size(max=100) String nombres,
    @NotBlank @Size(max=100) String apellidos,
    @Size(max=20) String telefono,
    @Email @Size(max=150) String correo,
    @Size(max=250) String direccion,
    @Pattern(regexp="ACTIVO|INACTIVO") String estado,
    LocalDate fechaNacimiento
) {
    public PacienteRequestDTO {
        tipoDocumento = tipoDocumento == null ? null : tipoDocumento.trim();
        numeroDocumento = numeroDocumento == null ? null : numeroDocumento.trim();
        nombres = nombres == null ? null : nombres.trim();
        apellidos = apellidos == null ? null : apellidos.trim();
        telefono = telefono == null ? null : telefono.trim();
        correo = correo == null ? null : correo.trim();
        direccion = direccion == null ? null : direccion.trim();
        estado = estado == null ? "ACTIVO" : estado.trim();
    }
}

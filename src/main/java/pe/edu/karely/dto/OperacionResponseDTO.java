package pe.edu.karely.dto;

public record OperacionResponseDTO(String accion, Long id, String mensaje) {
    public static OperacionResponseDTO resultado(String accion, Long id) {
        return new OperacionResponseDTO(accion, id, "Operación realizada correctamente");
    }
}

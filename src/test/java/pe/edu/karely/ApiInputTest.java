package pe.edu.karely;
import org.junit.jupiter.api.Test;
import jakarta.validation.Validation;
import pe.edu.karely.dto.finanzas.PagoDoctorRequestDTO;
import static org.junit.jupiter.api.Assertions.*;
class ApiInputTest {
 @Test void pagoRequiereIdentificadorFechasEImporte(){
  try(var factory=Validation.buildDefaultValidatorFactory()){
   assertFalse(factory.getValidator().validate(new PagoDoctorRequestDTO(null,null,null,null,null,null,null)).isEmpty());
  }
 }
}

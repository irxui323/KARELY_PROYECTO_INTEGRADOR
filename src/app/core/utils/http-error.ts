import type { FormGroup } from "@angular/forms";

const fieldLabels: Record<string, string> = {
  tipoDocumento: "Tipo de documento", numeroDocumento: "Número de documento",
  nombres: "Nombres", apellidos: "Apellidos", telefono: "Teléfono", correo: "Correo",
  direccion: "Dirección", estado: "Estado", fechaNacimiento: "Fecha de nacimiento",
  username: "Usuario", idRol: "Rol",
};

export function formErrorText(form: FormGroup): string {
  const messages = Object.entries(form.controls).filter(([, control]) => control.invalid)
    .map(([field, control]) => {
      const label = fieldLabels[field] || field;
      if (control.hasError("required")) return `${label}: completa este campo`;
      if (control.hasError("email")) return `${label}: ingresa un correo válido`;
      if (control.hasError("maxlength")) return `${label}: máximo ${control.getError("maxlength").requiredLength} caracteres`;
      if (control.hasError("fechaFutura")) return `${label}: no puede ser futura`;
      return `${label}: revisa el valor ingresado`;
    });
  return messages.join("; ") || "Revisa los datos del formulario.";
}

export function errorText(error: unknown): string {
  const value = error as {
    error?: { error?: string; detail?: string; message?: string; validationErrors?: Record<string, string> };
    message?: string;
  } | null;
  const fields = value?.error?.validationErrors;
  if (fields && Object.keys(fields).length) {
    return [...new Set(Object.values(fields))].join("; ");
  }
  return (
    value?.error?.message ||
    value?.error?.detail ||
    value?.error?.error ||
    value?.message ||
    "No se pudo completar la operación."
  );
}

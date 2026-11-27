import type { FormGroup } from "@angular/forms";

const fieldLabels: Record<string, string> = {
  tipoDocumento: "Tipo de documento",
  numeroDocumento: "Número de documento",
  nombres: "Nombres",
  apellidos: "Apellidos",
  telefono: "Teléfono",
  correo: "Correo",
  direccion: "Dirección",
  estado: "Estado",
  fechaNacimiento: "Fecha de nacimiento",
  username: "Usuario",
  idRol: "Rol",
};

export function formErrorText(form: FormGroup): string {
  const messages = Object.entries(form.controls)
    .filter(([, control]) => control.invalid)
    .map(([field, control]) => {
      const label = fieldLabels[field] || field;
      if (control.hasError("required")) return `${label}: completa este campo`;
      if (control.hasError("email"))
        return `${label}: ingresa un correo válido`;
      if (control.hasError("maxlength"))
        return `${label}: máximo ${control.getError("maxlength").requiredLength} caracteres`;
      if (control.hasError("fechaFutura"))
        return `${label}: no puede ser futura`;
      return `${label}: revisa el valor ingresado`;
    });
  return messages[0] || "Revisa los datos del formulario.";
}

export function errorText(error: unknown): string {
  const value = error as {
    status?: number;
    error?: {
      error?: string;
      detail?: string;
      message?: string;
      validationErrors?: Record<string, string>;
    };
    message?: string;
  } | null;
  if (value?.status === 0)
    return "No se pudo conectar con el sistema. Revisa tu conexión e inténtalo de nuevo.";
  if (value?.status && value.status >= 500)
    return "No se pudo completar la operación. Inténtalo de nuevo en unos minutos.";
  const fields = value?.error?.validationErrors;
  if (fields && Object.keys(fields).length) {
    const message = Object.values(fields).find(
      (text) => typeof text === "string" && text.trim(),
    );
    return mensajeClaro(message || "Revisa los datos del formulario.");
  }
  const message =
    value?.error?.message ||
    value?.error?.detail ||
    value?.error?.error ||
    value?.message ||
    "No se pudo completar la operación.";
  if (value?.status === 403)
    return "Tu cuenta no tiene permiso para realizar esta acción.";
  if (value?.status === 401)
    return /credenciales|contraseña|password/i.test(message)
      ? "Usuario o contraseña incorrectos."
      : "Tu sesión no es válida. Vuelve a iniciar sesión.";
  return mensajeClaro(message);
}

function mensajeClaro(message: string): string {
  if (typeof message !== "string") return "No se pudo completar la operación.";
  let text = message
    .replace(/\u00c3\u00b3/g, "ó")
    .replace(/\u00c3\u00a1/g, "á")
    .replace(/\u00c3\u00a9/g, "é")
    .replace(/\u00c3\u00ad/g, "í")
    .replace(/\u00c3\u00ba/g, "ú")
    .replace(/\u00c3\u00b1/g, "ñ");
  text = text
    .split(/\r?\n/)[0]
    .replace(/^\s*ORA-20\d{3}:\s*/, "")
    .trim();
  if (
    /ORA-\d|SQL(?:Exception|STATE)|\bSELECT\b.+\bFROM\b|constraint|Http failure|https?:\/\/|\b(?:TypeError|NullPointerException|Bad Request|Internal Server Error|Unauthorized|Forbidden)\b/i.test(
      text,
    )
  )
    return "No se pudo completar la operación. Inténtalo de nuevo.";
  if (
    /must (?:not|be|match)|size must|length must|not a well-formed/i.test(text)
  )
    return "Revisa los datos ingresados y completa los campos obligatorios.";
  return text || "No se pudo completar la operación.";
}

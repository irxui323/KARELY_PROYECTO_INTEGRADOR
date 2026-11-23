const fieldLabels = {
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
export function formErrorText(form) {
    const messages = Object.entries(form.controls)
        .filter(([, control]) => control.invalid)
        .map(([field, control]) => {
        const label = fieldLabels[field] || field;
        if (control.hasError("required"))
            return `${label}: completa este campo`;
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
export function errorText(error) {
    const value = error;
    if (value?.status === 0)
        return "No se pudo conectar con el sistema. Revisa tu conexión e inténtalo de nuevo.";
    if (value?.status && value.status >= 500)
        return "No se pudo completar la operación. Inténtalo de nuevo en unos minutos.";
    const fields = value?.error?.validationErrors;
    if (fields && Object.keys(fields).length) {
        const message = Object.values(fields).find((text) => typeof text === "string" && text.trim());
        return mensajeClaro(message || "Revisa los datos del formulario.");
    }
    const message = value?.error?.message ||
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
function mensajeClaro(message) {
    if (typeof message !== "string")
        return "No se pudo completar la operación.";
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
    if (/ORA-\d|SQL(?:Exception|STATE)|\bSELECT\b.+\bFROM\b|constraint|Http failure|https?:\/\/|\b(?:TypeError|NullPointerException|Bad Request|Internal Server Error|Unauthorized|Forbidden)\b/i.test(text))
        return "No se pudo completar la operación. Inténtalo de nuevo.";
    if (/must (?:not|be|match)|size must|length must|not a well-formed/i.test(text))
        return "Revisa los datos ingresados y completa los campos obligatorios.";
    return text || "No se pudo completar la operación.";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1lcnJvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL2NvcmUvdXRpbHMvIiwic291cmNlcyI6WyJodHRwLWVycm9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sV0FBVyxHQUEyQjtJQUMxQyxhQUFhLEVBQUUsbUJBQW1CO0lBQ2xDLGVBQWUsRUFBRSxxQkFBcUI7SUFDdEMsT0FBTyxFQUFFLFNBQVM7SUFDbEIsU0FBUyxFQUFFLFdBQVc7SUFDdEIsUUFBUSxFQUFFLFVBQVU7SUFDcEIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsU0FBUyxFQUFFLFdBQVc7SUFDdEIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsZUFBZSxFQUFFLHFCQUFxQjtJQUN0QyxRQUFRLEVBQUUsU0FBUztJQUNuQixLQUFLLEVBQUUsS0FBSztDQUNiLENBQUM7QUFFRixNQUFNLFVBQVUsYUFBYSxDQUFDLElBQWU7SUFDM0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1NBQzNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztTQUN4QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFO1FBQ3hCLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUM7UUFDMUMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztZQUFFLE9BQU8sR0FBRyxLQUFLLHVCQUF1QixDQUFDO1FBQ3pFLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7WUFDM0IsT0FBTyxHQUFHLEtBQUssNEJBQTRCLENBQUM7UUFDOUMsSUFBSSxPQUFPLENBQUMsUUFB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RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBGb3JtR3JvdXAgfSBmcm9tIFwiQGFuZ3VsYXIvZm9ybXNcIjtcblxuY29uc3QgZmllbGRMYWJlbHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gIHRpcG9Eb2N1bWVudG86IFwiVGlwbyBkZSBkb2N1bWVudG9cIixcbiAgbnVtZXJvRG9jdW1lbnRvOiBcIk7Dum1lcm8gZGUgZG9jdW1lbnRvXCIsXG4gIG5vbWJyZXM6IFwiTm9tYnJlc1wiLFxuICBhcGVsbGlkb3M6IFwiQXBlbGxpZG9zXCIsXG4gIHRlbGVmb25vOiBcIlRlbMOpZm9ub1wiLFxuICBjb3JyZW86IFwiQ29ycmVvXCIsXG4gIGRpcmVjY2lvbjogXCJEaXJlY2Npw7NuXCIsXG4gIGVzdGFkbzogXCJFc3RhZG9cIixcbiAgZmVjaGFOYWNpbWllbnRvOiBcIkZlY2hhIGRlIG5hY2ltaWVudG9cIixcbiAgdXNlcm5hbWU6IFwiVXN1YXJpb1wiLFxuICBpZFJvbDogXCJSb2xcIixcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtRXJyb3JUZXh0KGZvcm06IEZvcm1Hcm91cCk6IHN0cmluZyB7XG4gIGNvbnN0IG1lc3NhZ2VzID0gT2JqZWN0LmVudHJpZXMoZm9ybS5jb250cm9scylcbiAgICAuZmlsdGVyKChbLCBjb250cm9sXSkgPT4gY29udHJvbC5pbnZhbGlkKVxuICAgIC5tYXAoKFtmaWVsZCwgY29udHJvbF0pID0+IHtcbiAgICAgIGNvbnN0IGxhYmVsID0gZmllbGRMYWJlbHNbZmllbGRdIHx8IGZpZWxkO1xuICAgICAgaWYgKGNvbnRyb2wuaGFzRXJyb3IoXCJyZXF1aXJlZFwiKSkgcmV0dXJuIGAke2xhYmVsfTogY29tcGxldGEgZXN0ZSBjYW1wb2A7XG4gICAgICBpZiAoY29udHJvbC5oYXNFcnJvcihcImVtYWlsXCIpKVxuICAgICAgICByZXR1cm4gYCR7bGFiZWx9OiBpbmdyZXNhIHVuIGNvcnJlbyB2w6FsaWRvYDtcbiAgICAgIGlmIChjb250cm9sLmhhc0Vycm9yKFwibWF4bGVuZ3RoXCIpKVxuICAgICAgICByZXR1cm4gYCR7bGFiZWx9OiBtw6F4aW1vICR7Y29udHJvbC5nZXRFcnJvcihcIm1heGxlbmd0aFwiKS5yZXF1aXJlZExlbmd0aH0gY2FyYWN0ZXJlc2A7XG4gICAgICBpZiAoY29udHJvbC5oYXNFcnJvcihcImZlY2hhRnV0dXJhXCIpKVxuICAgICAgICByZXR1cm4gYCR7bGFiZWx9OiBubyBwdWVkZSBzZXIgZnV0dXJhYDtcbiAgICAgIHJldHVybiBgJHtsYWJlbH06IHJldmlzYSBlbCB2YWxvciBpbmdyZXNhZG9gO1xuICAgIH0pO1xuICByZXR1cm4gbWVzc2FnZXNbMF0gfHwgXCJSZXZpc2EgbG9zIGRhdG9zIGRlbCBmb3JtdWxhcmlvLlwiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JUZXh0KGVycm9yOiB1bmtub3duKTogc3RyaW5nIHtcbiAgY29uc3QgdmFsdWUgPSBlcnJvciBhcyB7XG4gICAgc3RhdHVzPzogbnVtYmVyO1xuICAgIGVycm9yPzoge1xuICAgICAgZXJyb3I/OiBzdHJpbmc7XG4gICAgICBkZXRhaWw/OiBzdHJpbmc7XG4gICAgICBtZXNzYWdlPzogc3RyaW5nO1xuICAgICAgdmFsaWRhdGlvbkVycm9ycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gICAgfTtcbiAgICBtZXNzYWdlPzogc3RyaW5nO1xuICB9IHwgbnVsbDtcbiAgaWYgKHZhbHVlPy5zdGF0dXMgPT09IDApXG4gICAgcmV0dXJuIFwiTm8gc2UgcHVkbyBjb25lY3RhciBjb24gZWwgc2lzdGVtYS4gUmV2aXNhIHR1IGNvbmV4acOzbiBlIGludMOpbnRhbG8gZGUgbnVldm8uXCI7XG4gIGlmICh2YWx1ZT8uc3RhdHVzICYmIHZhbHVlLnN0YXR1cyA+PSA1MDApXG4gICAgcmV0dXJuIFwiTm8gc2UgcHVkbyBjb21wbGV0YXIgbGEgb3BlcmFjacOzbi4gSW50w6ludGFsbyBkZSBudWV2byBlbiB1bm9zIG1pbnV0b3MuXCI7XG4gIGNvbnN0IGZpZWxkcyA9IHZhbHVlPy5lcnJvcj8udmFsaWRhdGlvbkVycm9ycztcbiAgaWYgKGZpZWxkcyAmJiBPYmplY3Qua2V5cyhmaWVsZHMpLmxlbmd0aCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBPYmplY3QudmFsdWVzKGZpZWxkcykuZmluZChcbiAgICAgICh0ZXh0KSA9PiB0eXBlb2YgdGV4dCA9PT0gXCJzdHJpbmdcIiAmJiB0ZXh0LnRyaW0oKSxcbiAgICApO1xuICAgIHJldHVybiBtZW5zYWplQ2xhcm8obWVzc2FnZSB8fCBcIlJldmlzYSBsb3MgZGF0b3MgZGVsIGZvcm11bGFyaW8uXCIpO1xuICB9XG4gIGNvbnN0IG1lc3NhZ2UgPVxuICAgIHZhbHVlPy5lcnJvcj8ubWVzc2FnZSB8fFxuICAgIHZhbHVlPy5lcnJvcj8uZGV0YWlsIHx8XG4gICAgdmFsdWU/LmVycm9yPy5lcnJvciB8fFxuICAgIHZhbHVlPy5tZXNzYWdlIHx8XG4gICAgXCJObyBzZSBwdWRvIGNvbXBsZXRhciBsYSBvcGVyYWNpw7NuLlwiO1xuICBpZiAodmFsdWU/LnN0YXR1cyA9PT0gNDAzKVxuICAgIHJldHVybiBcIlR1IGN1ZW50YSBubyB0aWVuZSBwZXJtaXNvIHBhcmEgcmVhbGl6YXIgZXN0YSBhY2Npw7NuLlwiO1xuICBpZiAodmFsdWU/LnN0YXR1cyA9PT0gNDAxKVxuICAgIHJldHVybiAvY3JlZGVuY2lhbGVzfGNvbnRyYXNlw7FhfHBhc3N3b3JkL2kudGVzdChtZXNzYWdlKVxuICAgICAgPyBcIlVzdWFyaW8gbyBjb250cmFzZcOxYSBpbmNvcnJlY3Rvcy5cIlxuICAgICAgOiBcIlR1IHNlc2nDs24gbm8gZXMgdsOhbGlkYS4gVnVlbHZlIGEgaW5pY2lhciBzZXNpw7NuLlwiO1xuICByZXR1cm4gbWVuc2FqZUNsYXJvKG1lc3NhZ2UpO1xufVxuXG5mdW5jdGlvbiBtZW5zYWplQ2xhcm8obWVzc2FnZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSBcInN0cmluZ1wiKSByZXR1cm4gXCJObyBzZSBwdWRvIGNvbXBsZXRhciBsYSBvcGVyYWNpw7NuLlwiO1xuICBsZXQgdGV4dCA9IG1lc3NhZ2VcbiAgICAucmVwbGFjZSgvXFx1MDBjM1xcdTAwYjMvZywgXCLDs1wiKVxuICAgIC5yZXBsYWNlKC9cXHUwMGMzXFx1MDBhMS9nLCBcIsOhXCIpXG4gICAgLnJlcGxhY2UoL1xcdTAwYzNcXHUwMGE5L2csIFwiw6lcIilcbiAgICAucmVwbGFjZSgvXFx1MDBjM1xcdTAwYWQvZywgXCLDrVwiKVxuICAgIC5yZXBsYWNlKC9cXHUwMGMzXFx1MDBiYS9nLCBcIsO6XCIpXG4gICAgLnJlcGxhY2UoL1xcdTAwYzNcXHUwMGIxL2csIFwiw7FcIik7XG4gIHRleHQgPSB0ZXh0XG4gICAgLnNwbGl0KC9cXHI/XFxuLylbMF1cbiAgICAucmVwbGFjZSgvXlxccypPUkEtMjBcXGR7M306XFxzKi8sIFwiXCIpXG4gICAgLnRyaW0oKTtcbiAgaWYgKFxuICAgIC9PUkEtXFxkfFNRTCg/OkV4Y2VwdGlvbnxTVEFURSl8XFxiU0VMRUNUXFxiLitcXGJGUk9NXFxifGNvbnN0cmFpbnR8SHR0cCBmYWlsdXJlfGh0dHBzPzpcXC9cXC98XFxiKD86VHlwZUVycm9yfE51bGxQb2ludGVyRXhjZXB0aW9ufEJhZCBSZXF1ZXN0fEludGVybmFsIFNlcnZlciBFcnJvcnxVbmF1dGhvcml6ZWR8Rm9yYmlkZGVuKVxcYi9pLnRlc3QoXG4gICAgICB0ZXh0LFxuICAgIClcbiAgKVxuICAgIHJldHVybiBcIk5vIHNlIHB1ZG8gY29tcGxldGFyIGxhIG9wZXJhY2nDs24uIEludMOpbnRhbG8gZGUgbnVldm8uXCI7XG4gIGlmIChcbiAgICAvbXVzdCAoPzpub3R8YmV8bWF0Y2gpfHNpemUgbXVzdHxsZW5ndGggbXVzdHxub3QgYSB3ZWxsLWZvcm1lZC9pLnRlc3QodGV4dClcbiAgKVxuICAgIHJldHVybiBcIlJldmlzYSBsb3MgZGF0b3MgaW5ncmVzYWRvcyB5IGNvbXBsZXRhIGxvcyBjYW1wb3Mgb2JsaWdhdG9yaW9zLlwiO1xuICByZXR1cm4gdGV4dCB8fCBcIk5vIHNlIHB1ZG8gY29tcGxldGFyIGxhIG9wZXJhY2nDs24uXCI7XG59XG4iXX0=
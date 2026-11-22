import { AbstractControl, ValidationErrors } from "@angular/forms";

export function fechaActual(): string {
  const partes = new Intl.DateTimeFormat("en", {
    timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const valor = (tipo: string) => partes.find(parte => parte.type === tipo)!.value;
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

export function fechaNoPasada(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (!valor) return null;
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return { fechaInvalida: true };
  const fecha = new Date(valor + "T00:00:00Z");
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0,10) !== valor) return { fechaInvalida: true };
  return valor < fechaActual() ? { fechaPasada: true } : null;
}

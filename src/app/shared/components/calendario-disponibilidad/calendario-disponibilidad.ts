import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-calendario-disponibilidad",
  standalone: true,
  templateUrl: "./calendario-disponibilidad.html",
  styleUrl: "./calendario-disponibilidad.css",
})
export class CalendarioDisponibilidad {
  @Input() mes = "";
  @Input() minima = "";
  @Input() seleccionada = "";
  @Input() cantidades: Record<string, number> = {};
  @Input() cargando = false;
  @Input() error = "";
  @Output() fechaChange = new EventEmitter<string>();
  @Output() mesChange = new EventEmitter<string>();
  readonly semana = ["L", "M", "X", "J", "V", "S", "D"];
  get titulo() {
    return new Intl.DateTimeFormat("es", {
      month: "long",
      year: "numeric",
    }).format(new Date(this.mes + "-01T12:00:00"));
  }
  get celdas(): string[] {
    const [year, month] = this.mes.split("-").map(Number);
    if (!year || !month) return [];
    const inicio = (new Date(year, month - 1, 1).getDay() + 6) % 7;
    const dias = new Date(year, month, 0).getDate();
    const total = Math.ceil((inicio + dias) / 7) * 7;
    return Array.from({ length: total }, (_, i) =>
      i < inicio || i >= inicio + dias
        ? ""
        : `${this.mes}-${String(i - inicio + 1).padStart(2, "0")}`,
    );
  }
  estado(fecha: string) {
    const n = this.cantidades[fecha] ?? 0;
    return n === 0 ? "sin-turnos" : n <= 3 ? "pocos" : "disponible";
  }
  bloqueado(fecha: string) {
    return (
      !fecha ||
      fecha < this.minima ||
      !this.cantidades[fecha] ||
      this.cargando ||
      !!this.error
    );
  }
  elegir(fecha: string) {
    if (!this.bloqueado(fecha)) this.fechaChange.emit(fecha);
  }
  cambiarMes(delta: number) {
    const [year, month] = this.mes.split("-").map(Number);
    const fecha = new Date(year, month - 1 + delta, 1, 12);
    const nuevo = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    if (nuevo >= this.minima.slice(0, 7)) this.mesChange.emit(nuevo);
  }
  etiqueta(fecha: string) {
    const n = this.cantidades[fecha] ?? 0;
    return `${fecha}: ${n} ${n === 1 ? "turno disponible" : "turnos disponibles"}`;
  }
}

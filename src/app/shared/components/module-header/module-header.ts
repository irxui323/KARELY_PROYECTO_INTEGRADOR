import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "header[appModuleHeader]",
  standalone: true,
  templateUrl: "./module-header.html",
  styleUrl: "./module-header.css",
})
export class ModuleHeader {
  @Input({ required: true }) contexto = "";
  @Input({ required: true }) titulo = "";
  @Input({ required: true }) descripcion = "";
  @Input() textoActualizar = "";
  @Input() actualizacionDeshabilitada = false;
  @Output() readonly actualizar = new EventEmitter<void>();
}

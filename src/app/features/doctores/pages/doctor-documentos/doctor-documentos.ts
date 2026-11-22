import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import { Doctor, DocumentoDoctor } from "../../models/doctores.model";
import { DoctorService } from "../../services/doctores-service";

@Component({
  standalone: true,
  imports: [FormsModule, FeatureNav],
  templateUrl: "./doctor-documentos.html",
  styleUrl: "./doctor-documentos.css",
})
export class DoctorDocumentos implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  guardando = false;
  private readonly route = inject(ActivatedRoute, { optional: true });

  private doctoresService = inject(DoctorService);
  doctores: Doctor[] = [];
  documentos: DocumentoDoctor[] = [];
  error = "";
  exito = "";
  selectedDoctor = 0;
  readonly tipos = ["DNI", "TITULO"];
  archivos: Record<string, File | null> = {};
  motivos: Record<number, string> = {};
  dniConforme = false;
  tituloConforme = false;
  abiertos = new Set<number>();
  private carga = 0;
  resetRevision() {
    this.dniConforme = false;
    this.tituloConforme = false;
    this.abiertos.clear();
  }
  ultimo(tipo: string) {
    return this.documentos
      .filter((d) => d.tipoDocumento === tipo)
      .sort((a, b) => b.idDocumento - a.idDocumento)[0];
  }
  get puedeAprobar() {
    return (
      this.tipos.every((tipo) => {
        const d = this.ultimo(tipo);
        return (
          !!d &&
          ["PENDIENTE", "VALIDADO"].includes(d.estado) &&
          this.abiertos.has(d.idDocumento)
        );
      }) &&
      this.dniConforme &&
      this.tituloConforme
    );
  }
  async verDocumento(d: DocumentoDoctor) {
    const doctor = this.selectedDoctor;
    const ventana = window.open("", "_blank");
    try {
      const blob = await firstValueFrom(
        this.doctoresService.descargarDocumento(doctor, d.idDocumento),
      );
      if (this.selectedDoctor !== doctor) {
        ventana?.close();
        return;
      }
      const url = URL.createObjectURL(blob);
      if (ventana) {
        ventana.location.href = url;
        this.abiertos.add(d.idDocumento);
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      ventana?.close();
      this.error = errorText(e);
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async rechazarDocumento(d: DocumentoDoctor) {
    if (this.guardando) return;
    const motivo = this.motivos[d.idDocumento]?.trim();
    if (!motivo) {
      this.error = "Escribe el motivo del rechazo";
      return;
    }
    this.guardando = true;
    this.error = "";
    this.exito = "";
    const doctor = this.selectedDoctor;
    this.resetRevision();
    try {
      await firstValueFrom(
        this.doctoresService.rechazarDocumento(doctor, d.idDocumento, motivo),
      );
      if (doctor === this.selectedDoctor) {
        this.exito = "Documento rechazado";
        await this.cargarDocumentos();
      }
      await this.cargar();
    } catch (e) {
      this.error = errorText(e);
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
  get doctorSeleccionado() {
    return this.doctores.find((d) => d.idDoctor === this.selectedDoctor);
  }
  get guardadoPendiente() {
    return Object.values(this.archivos).some(Boolean);
  }
  ngOnInit() {
    const id = Number(this.route?.snapshot.queryParamMap.get("doctor"));
    if (id > 0) this.selectedDoctor = id;
    void this.cargar();
    if (id > 0) void this.cargarDocumentos();
  }
  async cargar() {
    try {
      try {
        this.doctores = await firstValueFrom(this.doctoresService.listar());
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async cargarDocumentos(preservarRevision = false, preservarArchivos = false) {
    const carga = ++this.carga;
    if (!preservarRevision) this.resetRevision();
    if (!preservarArchivos && !preservarRevision) this.archivos = {};
    try {
      const doctor = this.selectedDoctor;
      this.documentos = [];
      if (!doctor) return;
      try {
        const documentos = await firstValueFrom(
          this.doctoresService.documentos(doctor),
        );
        if (this.selectedDoctor === doctor && carga === this.carga)
          this.documentos = documentos;
      } catch (e) {
        if (this.selectedDoctor === doctor && carga === this.carga)
          this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  cambiarArchivo(e: Event, tipo: string) {
    this.archivos[tipo] = (e.target as HTMLInputElement).files?.item(0) || null;
  }
  async subirDocumento(tipo: string) {
    if (this.guardando) return;
    const archivo = this.archivos[tipo];
    this.resetRevision();
    this.guardando = true;
    try {
      this.error = "";
      this.exito = "";
      if (!archivo || !this.selectedDoctor) return;
      if (archivo.size > 10 * 1024 * 1024) {
        this.error = "El archivo supera el máximo de 10 MB";
        return;
      }
      try {
        await firstValueFrom(
          this.doctoresService.subir(this.selectedDoctor, tipo, archivo),
        );
        this.exito = "Documento recibido";
        this.archivos[tipo] = null;
        await this.cargarDocumentos(false, true);
        await this.cargar();
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
  async aprobarDoctor() {
    if (this.guardando) return;
    this.guardando = true;
    try {
      this.error = "";
      this.exito = "";
      const doctor = this.selectedDoctor;
      if (!doctor) {
        this.error = "Selecciona un doctor";
        return;
      }
      await this.cargarDocumentos(true);
      if (this.error || this.selectedDoctor !== doctor) return;
      const faltantes = ["DNI", "TITULO"].filter((tipo) => {
        const ultimo = this.documentos
          .filter((d) => d.tipoDocumento === tipo)
          .sort((a, b) => Number(b.idDocumento) - Number(a.idDocumento))[0];
        return !ultimo || !["PENDIENTE", "VALIDADO"].includes(ultimo.estado);
      });
      if (faltantes.length) {
        this.error =
          "Adjunta un DNI y un título profesional vigentes antes de validar. Falta o fue rechazado: " +
          faltantes
            .map((tipo) => (tipo === "TITULO" ? "Título profesional" : tipo))
            .join(", ");
        return;
      }
      if (!this.puedeAprobar) {
        this.error =
          "Abre, revisa y confirma el DNI y el título antes de validar";
        return;
      }
      try {
        await firstValueFrom(
          this.doctoresService.validarDocumentacion(doctor, {
            dniConforme: this.dniConforme,
            tituloConforme: this.tituloConforme,
            idDni: this.ultimo("DNI")!.idDocumento,
            idTitulo: this.ultimo("TITULO")!.idDocumento,
          }),
        );
        this.exito = "Documentación validada";
        await this.cargar();
      } catch (e) {
        this.error = errorText(e);
      }
      if (!this.error && this.selectedDoctor === doctor)
        await this.cargarDocumentos();
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
}

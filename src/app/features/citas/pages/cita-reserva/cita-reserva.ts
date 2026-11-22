import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { errorText } from "../../../../core/utils/http-error";
import { fechaActual, fechaNoPasada } from "../../../../core/utils/fecha";
import { ControlDisabled } from "../../../../shared/directives/control-disabled";
import { FeatureNav } from "../../../../shared/components/feature-nav/feature-nav";
import {
  Consultorio,
  Especialidad,
} from "../../../catalogos/models/catalogos.model";
import { CatalogoService } from "../../../catalogos/services/catalogos-service";
import { Paciente } from "../../../pacientes/models/pacientes.model";
import { PacienteService } from "../../../pacientes/services/pacientes-service";
import { CitaRequest, DoctorDisponible, DisponibilidadDia } from "../../models/citas.model";
import { CalendarioDisponibilidad } from "../../../../shared/components/calendario-disponibilidad/calendario-disponibilidad";
import { CitaService } from "../../services/citas-service";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FeatureNav, ControlDisabled, CalendarioDisponibilidad],
  templateUrl: "./cita-reserva.html",
  styleUrl: "./cita-reserva.css",
})
export class CitaReserva implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  guardando = false;

  private readonly router = inject(Router);
  constructor() {
    this.reserva = {};
  }
  private pacientesService = inject(PacienteService);
  private citasService = inject(CitaService);
  private catalogoService = inject(CatalogoService);
  error = "";
  exito = "";
  pacientes: Paciente[] = [];
  especialidades: Especialidad[] = [];
  consultorios: Consultorio[] = [];
  doctoresDisponibles: DoctorDisponible[] = [];
  consultando = false;
  private consulta = 0;
  calendarioAbierto=false;
  mesCalendario=fechaActual().slice(0,7);
  diasDisponibles:DisponibilidadDia[]=[];
  cargandoCalendario=false;
  errorCalendario='';
  private consultaMes=0;
  get cantidadesCalendario() {
    const cantidades:Record<string,number>={};
    for(const dia of this.diasDisponibles) {
      if(!this.reserva.idDoctor || dia.idDoctor===this.reserva.idDoctor)
        cantidades[dia.fecha]=(cantidades[dia.fecha]??0)+dia.total;
    }
    return cantidades;
  }
  get fechaMostrada() { return this.reserva.fecha ? this.reserva.fecha.split('-').reverse().join('/') : 'Selecciona una fecha'; }
  async abrirCalendario() {
    this.calendarioAbierto=!this.calendarioAbierto;
    if(this.calendarioAbierto) await this.cargarMes();
  }
  async cargarMes(mes=this.mesCalendario) {
    const consulta=++this.consultaMes;
    this.mesCalendario=mes;
    this.diasDisponibles=[];
    this.errorCalendario='';
    const {idEspecialidad,idConsultorio}=this.reserva;
    if(!idEspecialidad) { this.cargandoCalendario=false; return; }
    this.cargandoCalendario=true;
    try {
      const dias=await firstValueFrom(this.citasService.disponibilidadMes(idEspecialidad,mes,idConsultorio));
      if(consulta===this.consultaMes) this.diasDisponibles=dias;
    } catch(e) {
      if(consulta===this.consultaMes) this.errorCalendario=errorText(e);
    } finally {
      if(consulta===this.consultaMes) this.cargandoCalendario=false;
      this.changeDetector.markForCheck();
    }
  }
  async seleccionarFecha(fecha:string) {
    this.reservaGroup.controls.fecha.setValue(fecha);
    this.calendarioAbierto=false;
    await this.actualizarDisponibilidad();
  }
  cambiarDoctor() {
    this.reservaGroup.controls.idFranja.reset(null);
  }
  get fechaMinima() { return fechaActual(); }
  get turnosDisponibles() {
    return this.doctoresDisponibles.find(d=>d.idDoctor===this.reserva.idDoctor)?.turnos ?? [];
  }
  estadoTurnos(doctor:DoctorDisponible) {
    if(!this.reserva.fecha) return 'Selecciona una fecha';
    const n=doctor.turnos.length;
    return n===0?'Sin turnos':n===1?'Queda 1 turno':n<=3?`Quedan ${n} turnos`:`${n} turnos disponibles`;
  }
  async actualizarDisponibilidad(cambioEspecialidad=false) {
    const consulta=++this.consulta;
    this.reservaGroup.controls.idFranja.reset(null);
    if(cambioEspecialidad) this.reservaGroup.controls.idDoctor.reset(null);
    if(this.calendarioAbierto) void this.cargarMes();
    this.doctoresDisponibles=[];
    this.error='';
    this.reservaGroup.controls.fecha.updateValueAndValidity();
    const {idEspecialidad,fecha,idConsultorio}=this.reserva;
    if(!idEspecialidad || (fecha && this.reservaGroup.controls.fecha.invalid)) {
      this.consultando=false;
      if(fecha && this.reservaGroup.controls.fecha.invalid) this.error='Selecciona una fecha válida que no sea anterior a hoy.';
      this.changeDetector.markForCheck();
      return;
    }
    this.consultando=true;
    try {
      const doctores=await firstValueFrom(this.citasService.disponibilidad(idEspecialidad,fecha,idConsultorio));
      if(consulta!==this.consulta) return;
      this.doctoresDisponibles=doctores;
      if(!doctores.some(d=>d.idDoctor===this.reserva.idDoctor)) this.reservaGroup.controls.idDoctor.reset(null);
    } catch(e) {
      if(consulta===this.consulta) this.error=errorText(e);
    } finally {
      if(consulta===this.consulta) this.consultando=false;
      this.changeDetector.markForCheck();
    }
  }
  readonly reservaGroup = new FormGroup({
    idPaciente: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idDoctor: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idEspecialidad: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idConsultorio: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idFranja: new FormControl<number | null | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fecha: new FormControl<string | undefined | null>(undefined, {
      nonNullable: true,
      validators: [Validators.required, fechaNoPasada],
    }),
  });
  get reserva(): CitaRequest {
    return this.reservaGroup.getRawValue();
  }
  set reserva(value: CitaRequest) {
    this.reservaGroup.reset(value);
  }
  ngOnInit() {
    void this.cargar();
  }
  async cargar() {
    try {
      try {
        [
          this.pacientes,
          this.especialidades,
          this.consultorios,
        ] = await Promise.all([
          firstValueFrom(this.pacientesService.listar()),
          firstValueFrom(this.catalogoService.especialidades()),
          firstValueFrom(this.catalogoService.consultorios()),
        ]);
        this.pacientes=this.pacientes.filter(p=>p.estado==='ACTIVO');
        this.especialidades=this.especialidades.filter(e=>e.estado==='ACTIVO');
        this.consultorios=this.consultorios.filter(c=>c.estado==='ACTIVO');
        await this.actualizarDisponibilidad();
      } catch (e) {
        this.error = errorText(e);
      }
    } finally {
      this.changeDetector.markForCheck();
    }
  }
  async preReservar() {
    if (this.guardando || this.consultando) return;
    this.guardando = true;
    try {
      this.reservaGroup.controls.fecha.updateValueAndValidity();
      if (this.reservaGroup.invalid || !this.reserva.idPaciente || !this.reserva.idDoctor || !this.reserva.idConsultorio || !this.reserva.idFranja || !this.reserva.idEspecialidad || !this.reserva.fecha) {
        this.reservaGroup.markAllAsTouched();
        this.exito = "";
        this.error = "Completa los datos obligatorios de la reserva.";
        return;
      }
      if(!this.turnosDisponibles.some(t=>t.idFranja===this.reserva.idFranja)) {
        this.error='El turno ya no está disponible. Actualiza y selecciona otro horario.';
        return;
      }
      this.error = "";
      try {
        const r = await firstValueFrom(
          this.citasService.ejecutar("prereserva-crear", this.reserva),
        );
        void this.router.navigate(["/citas/confirmar"], {
          queryParams: { reserva: r.id },
        });
      } catch (e) {
        const mensaje=errorText(e);
        await this.actualizarDisponibilidad();
        this.error=mensaje;
      }
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }
}

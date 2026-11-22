import { TestBed } from "@angular/core/testing";
import { ChangeDetectorRef } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting, HttpTestingController } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { DoctorHorarios } from "./doctor-horarios";
import { DisponibilidadForm } from "../../../atencion/pages/disponibilidad-form/disponibilidad-form";

describe("Fecha de disponibilidad",()=>{
  beforeEach(()=>{
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-23T01:00:00Z"));
    TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting(),provideRouter([]),
      {provide:ChangeDetectorRef,useValue:{markForCheck(){}}}]});
  });
  afterEach(()=>{TestBed.inject(HttpTestingController).verify();vi.useRealTimers();});
  it('carga solo especialidades asignadas y conserva la selección más reciente',async()=>{
    const pagina=TestBed.runInInjectionContext(()=>new DoctorHorarios());
    const http=TestBed.inject(HttpTestingController);
    pagina.horario={idDoctor:1,idEspecialidad:9};
    const primera=pagina.cargarEspecialidades();
    const anterior=http.expectOne('/api/v1/doctores/1/especialidades');
    expect(pagina.horario.idEspecialidad).toBeNull();
    pagina.horarioGroup.controls.idDoctor.setValue(2);
    const segunda=pagina.cargarEspecialidades();
    http.expectOne('/api/v1/doctores/2/especialidades').flush([{idEspecialidad:3,nombre:'Dermatologia',estado:'ACTIVO'},{idEspecialidad:4,nombre:'Inactiva',estado:'INACTIVO'}]);
    await segunda;
    anterior.flush([{idEspecialidad:8,nombre:'Anterior',estado:'ACTIVO'}]);
    await primera;
    expect(pagina.especialidades.map(e=>e.idEspecialidad)).toEqual([3]);
  });
  it('envía la especialidad seleccionada al registrar disponibilidad administrativa',async()=>{
    const pagina=TestBed.runInInjectionContext(()=>new DoctorHorarios());
    vi.spyOn(pagina,'cargar').mockResolvedValue();
    pagina.horario={idDoctor:1,idEspecialidad:3,fecha:'2026-11-23',idFranja:2};
    const envio=pagina.registrarHorario();
    const request=TestBed.inject(HttpTestingController).expectOne('/api/v1/doctores/1/disponibilidades');
    expect(request.request.body).toEqual({idEspecialidad:3,fecha:'2026-11-23',idFranja:2});
    request.flush({id:1});
    await envio;
  });
  it('el doctor debe elegir su especialidad antes de enviar su turno',async()=>{
    const pagina=TestBed.runInInjectionContext(()=>new DisponibilidadForm());
    pagina.doctor={idDoctor:1,idUsuario:7,estado:'ACTIVO',estadoDocumentacion:'COMPLETO',tipoDocumento:'DNI',numeroDocumento:'99000001',nombres:'Ana',apellidos:'Test'};
    pagina.horario={idDoctor:1,fecha:'2026-11-23',idFranja:2};
    await pagina.guardarHorario();
    TestBed.inject(HttpTestingController).expectNone(r=>r.method==='POST');
    expect(pagina.error).toContain('especialidad');
    vi.spyOn(pagina,'cargar').mockResolvedValue();
    pagina.horarioGroup.controls.idEspecialidad.setValue(3);
    const envio=pagina.guardarHorario();
    const request=TestBed.inject(HttpTestingController).expectOne('/api/v1/doctores/1/disponibilidades');
    expect(request.request.body.idEspecialidad).toBe(3);
    request.flush({id:1});
    await envio;
  });
  it("administración rechaza ayer aunque se escriba manualmente",async()=>{
    const pagina=TestBed.runInInjectionContext(()=>new DoctorHorarios());
    pagina.horario={idDoctor:1,fecha:"2026-11-21",idFranja:2};
    await pagina.registrarHorario();
    TestBed.inject(HttpTestingController).expectNone(r=>r.method==="POST");
    expect(pagina.error).toContain("anterior");
    expect(pagina.horarioGroup.controls.fecha.invalid).toBe(true);
  });
  it("el doctor tampoco envía un turno de ayer",async()=>{
    const pagina=TestBed.runInInjectionContext(()=>new DisponibilidadForm());
    pagina.doctor={idDoctor:1,idUsuario:7,estado:"ACTIVO",estadoDocumentacion:"COMPLETO",tipoDocumento:"DNI",numeroDocumento:"99000001",nombres:"Ana",apellidos:"Test"};
    pagina.horario={idDoctor:1,fecha:"2026-11-21",idFranja:2};
    await pagina.guardarHorario();
    TestBed.inject(HttpTestingController).expectNone(r=>r.method==="POST");
    expect(pagina.error).toContain("anterior");
  });
  it("acepta hoy y mañana según Bogotá aunque UTC ya sea el día siguiente",()=>{
    const pagina=TestBed.runInInjectionContext(()=>new DoctorHorarios());
    expect(pagina.fechaMinima).toBe("2026-11-22");
    for(const fecha of ["2026-11-22","2026-11-23"]) {
      pagina.horarioGroup.controls.fecha.setValue(fecha);
      expect(pagina.horarioGroup.controls.fecha.valid).toBe(true);
    }
  });
});

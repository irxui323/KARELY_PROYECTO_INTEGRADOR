import { TestBed } from "@angular/core/testing";
import { ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { AtencionForm } from "./atencion-form";
import { AuthService } from "../../../../core/auth/auth-service";
import { CitaService } from "../../../citas/services/citas-service";
import { DoctorService } from "../../../doctores/services/doctores-service";
import { AtencionService } from "../../services/atencion-service";
describe("Receta automática de la consulta",()=>{
 function pagina(){
  TestBed.configureTestingModule({providers:[
   {provide:ChangeDetectorRef,useValue:{markForCheck(){}}},
   {provide:Router,useValue:{}},
   {provide:AuthService,useValue:{session:()=>({rol:"DOCTOR",idUsuario:7})}},
   {provide:DoctorService,useValue:{listar:()=>of([{idDoctor:1,idUsuario:7}])}},
   {provide:CitaService,useValue:{listar:()=>of([{idCita:12,estadoCita:"EN_ATENCION"},{idCita:13,estadoCita:"EN_ATENCION"}])}},
   {provide:AtencionService,useValue:{listar:()=>of([{idAtencion:1,idCita:12,estado:"ABIERTA",idReceta:25,indicacionesReceta:"Reposo"},{idAtencion:2,idCita:13,estado:"ABIERTA",idReceta:null}])}},
  ]});
  return TestBed.runInInjectionContext(()=>new AtencionForm());
 }
 it("recupera la receta guardada al cargar sin pedir el ID",async()=>{
  const p=pagina();p.medico={idCita:12};await p.cargar();
  expect(p.medico.idReceta).toBe(25);expect(p.medico.indicaciones).toBe("Reposo");
 });
 it("restaura la receta al elegir la cita y no la mezcla con otra",async()=>{
  const p=pagina();await p.cargar();p.medico={idCita:12};p.limpiarDetalleConsulta();expect(p.medico.idReceta).toBe(25);
  p.medicoGroup.controls.idCita.setValue(13);p.limpiarDetalleConsulta();expect(p.medico.idReceta).toBeFalsy();
 });
});

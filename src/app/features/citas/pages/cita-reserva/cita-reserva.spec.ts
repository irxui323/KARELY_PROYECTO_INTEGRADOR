import { TestBed } from "@angular/core/testing";
import { ChangeDetectorRef } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { provideRouter, Router } from "@angular/router";
import { CitaReserva } from "./cita-reserva";

describe("CitaReserva validación", () => {
  function preparar() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
      ],
    });
    return {
      page: TestBed.runInInjectionContext(() => new CitaReserva()),
      http: TestBed.inject(HttpTestingController),
    };
  }
  it("cambia especialidad, limpia selección y ofrece solo doctores correspondientes", async () => {
    const { page, http } = preparar();
    page.reserva = { idEspecialidad: 2, idDoctor: 8, idFranja: 9 };
    const carga = page.actualizarDisponibilidad(true);
    expect(page.reserva.idDoctor).toBeNull();
    expect(page.reserva.idFranja).toBeNull();
    http
      .expectOne(
        (r) =>
          r.url.endsWith("/citas/disponibilidad") &&
          r.params.get("idEspecialidad") === "2",
      )
      .flush([{ idDoctor: 1, nombre: "Ana", turnos: [] }]);
    await carga;
    expect(page.doctoresDisponibles.map((d) => d.idDoctor)).toEqual([1]);
    http.verify();
  });
  it("descarta respuesta anterior y calcula pocos turnos para el doctor actual", async () => {
    const { page, http } = preparar();
    page.reserva = {
      idEspecialidad: 1,
      fecha: "2099-01-01",
      idConsultorio: 1,
      idDoctor: 1,
      idFranja: 8,
    };
    const primera = page.actualizarDisponibilidad();
    const anterior = http.expectOne(
      (r) => r.params.get("fecha") === "2099-01-01",
    );
    page.reservaGroup.controls.fecha.setValue("2099-01-02");
    const segunda = page.actualizarDisponibilidad();
    http
      .expectOne((r) => r.params.get("fecha") === "2099-01-02")
      .flush([
        {
          idDoctor: 1,
          nombre: "Ana",
          turnos: [
            { idDoctor: 1, idFranja: 2, horaInicio: "10:00", horaFin: "11:00" },
          ],
        },
      ]);
    await segunda;
    anterior.flush([{ idDoctor: 99, nombre: "Anterior", turnos: [] }]);
    await primera;
    expect(page.turnosDisponibles.map((t) => t.idFranja)).toEqual([2]);
    expect(page.estadoTurnos(page.doctoresDisponibles[0])).toContain("Queda 1");
    expect(page.reserva.idFranja).toBeNull();
    http.verify();
  });
  it("no envía un turno que ya no figura disponible", async () => {
    const { page, http } = preparar();
    page.reserva = {
      idPaciente: 1,
      idEspecialidad: 1,
      idDoctor: 1,
      idConsultorio: 1,
      idFranja: 99,
      fecha: "2099-01-01",
    };
    await page.preReservar();
    http.expectNone((r) => r.method === "POST");
    expect(page.error).toContain("disponible");
    http.verify();
  });
  it("reserva el turno ofrecido y abre la confirmación", async () => {
    const { page, http } = preparar();
    const navegar = vi
      .spyOn(TestBed.inject(Router), "navigate")
      .mockResolvedValue(true);
    page.reserva = {
      idPaciente: 1,
      idEspecialidad: 1,
      idDoctor: 1,
      idConsultorio: 1,
      idFranja: 2,
      fecha: "2099-01-01",
    };
    page.doctoresDisponibles = [
      {
        idDoctor: 1,
        nombre: "Ana",
        turnos: [
          { idDoctor: 1, idFranja: 2, horaInicio: "10:00", horaFin: "11:00" },
        ],
      },
    ];
    const envio = page.preReservar();
    const request = http.expectOne("/api/v1/citas/reservas");
    expect(request.request.body.idFranja).toBe(2);
    request.flush({ id: 42 });
    await envio;
    expect(navegar).toHaveBeenCalledWith(["/citas/confirmar"], {
      queryParams: { reserva: 42 },
    });
    http.verify();
  });
  it("refresca opciones si otra persona ocupa el turno al reservar", async () => {
    const { page, http } = preparar();
    page.reserva = {
      idPaciente: 1,
      idEspecialidad: 1,
      idDoctor: 1,
      idConsultorio: 1,
      idFranja: 2,
      fecha: "2099-01-01",
    };
    page.doctoresDisponibles = [
      {
        idDoctor: 1,
        nombre: "Ana",
        turnos: [
          { idDoctor: 1, idFranja: 2, horaInicio: "10:00", horaFin: "11:00" },
        ],
      },
    ];
    const envio = page.preReservar();
    http
      .expectOne("/api/v1/citas/reservas")
      .flush(
        { error: "El turno está bloqueado temporalmente" },
        { status: 400, statusText: "Bad Request" },
      );
    await Promise.resolve();
    http
      .expectOne((r) => r.url.endsWith("/citas/disponibilidad"))
      .flush([{ idDoctor: 1, nombre: "Ana", turnos: [] }]);
    await envio;
    expect(page.reserva.idFranja).toBeNull();
    expect(page.turnosDisponibles).toEqual([]);
    expect(page.error).toContain("bloqueado");
    http.verify();
  });
  it("actualiza las opciones desde el cambio real del selector y distingue los conteos", async () => {
    preparar();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(CitaReserva);
    const cargaAutomatica = vi
      .spyOn(fixture.componentInstance, "cargar")
      .mockResolvedValue();
    fixture.detectChanges();
    cargaAutomatica.mockRestore();
    const cargaInicial = fixture.componentInstance.cargar();
    http.expectOne("/api/v1/pacientes").flush([
      {
        idPaciente: 1,
        nombres: "Paciente",
        apellidos: "Activo",
        estado: "ACTIVO",
      },
      { idPaciente: 2, nombres: "Inactivo", estado: "INACTIVO" },
    ]);
    http
      .expectOne("/api/v1/especialidades")
      .flush([
        {
          idEspecialidad: 1,
          nombre: "Medicina",
          precioConsulta: 100,
          estado: "ACTIVO",
        },
      ]);
    http
      .expectOne("/api/v1/consultorios")
      .flush([{ idConsultorio: 1, nombre: "Consultorio", estado: "ACTIVO" }]);
    await cargaInicial;
    fixture.detectChanges();
    expect(fixture.componentInstance.pacientes).toHaveLength(1);
    const selects = fixture.nativeElement.querySelectorAll(
      "select",
    ) as NodeListOf<HTMLSelectElement>;
    selects[1].selectedIndex = 1;
    selects[1].dispatchEvent(new Event("change"));
    http
      .expectOne((r) => r.url.endsWith("/citas/disponibilidad"))
      .flush([{ idDoctor: 1, nombre: "Ana", turnos: [] }]);
    await Promise.resolve();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(selects[2].textContent).toContain("Ana");
    const seleccionar =
      fixture.componentInstance.seleccionarFecha("2099-01-01");
    const turno = {
      idDoctor: 1,
      idFranja: 1,
      horaInicio: "09:00",
      horaFin: "10:00",
    };
    http
      .expectOne((r) => r.params.get("fecha") === "2099-01-01")
      .flush([
        {
          idDoctor: 1,
          nombre: "Ana",
          turnos: [turno, { ...turno, idFranja: 2 }],
        },
        { idDoctor: 2, nombre: "Luis", turnos: [] },
        {
          idDoctor: 3,
          nombre: "Maria",
          turnos: Array.from({ length: 5 }, (_, i) => ({
            ...turno,
            idFranja: i + 1,
            idDoctor: 3,
          })),
        },
      ]);
    await seleccionar;
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Quedan 2 turnos");
    expect(fixture.nativeElement.textContent).toContain("Sin turnos");
    expect(fixture.nativeElement.textContent).toContain("5 turnos disponibles");
    expect(selects[2].options[2].disabled).toBe(true);
    http.verify();
  });
  it("carga el mes una vez y cambia los conteos al seleccionar doctor", async () => {
    const { page, http } = preparar();
    page.reserva = { idEspecialidad: 1, idConsultorio: 2 };
    const abrir = page.abrirCalendario();
    http
      .expectOne(
        (r) =>
          r.url.endsWith("/citas/disponibilidad-mes") &&
          r.params.get("idConsultorio") === "2",
      )
      .flush([
        { fecha: "2099-01-02", idDoctor: 1, total: 2 },
        { fecha: "2099-01-02", idDoctor: 3, total: 5 },
      ]);
    await abrir;
    expect(page.cantidadesCalendario["2099-01-02"]).toBe(7);
    page.reservaGroup.controls.idDoctor.setValue(1);
    expect(page.cantidadesCalendario["2099-01-02"]).toBe(2);
    http.verify();
  });
  it("ignora un mes anterior si su respuesta llega tarde", async () => {
    const { page, http } = preparar();
    page.reserva = { idEspecialidad: 1 };
    const primera = page.cargarMes("2099-01");
    const anterior = http.expectOne(
      (r) => r.params.get("mes") === "2099-01-01",
    );
    const segunda = page.cargarMes("2099-02");
    http
      .expectOne((r) => r.params.get("mes") === "2099-02-01")
      .flush([{ fecha: "2099-02-01", idDoctor: 1, total: 2 }]);
    await segunda;
    anterior.flush([{ fecha: "2099-01-01", idDoctor: 1, total: 9 }]);
    await primera;
    expect(page.cantidadesCalendario).toEqual({ "2099-02-01": 2 });
    http.verify();
  });
  it("rechaza controles inválidos antes de enviar HTTP", async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const page = TestBed.runInInjectionContext(() => new CitaReserva());
    expect(page.reservaGroup.invalid).toBe(true);
    const saving = page.preReservar();
    http.expectNone((request) => request.method === "POST");
    await saving;
    expect(page.error).not.toBe("");
    expect(page.reservaGroup.touched).toBe(true);
    http.verify();
  });
});

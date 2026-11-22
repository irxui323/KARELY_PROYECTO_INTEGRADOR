import { TestBed } from "@angular/core/testing";
import { ChangeDetectorRef } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { CitaReprogramacion } from "./cita-reprogramacion";

describe("CitaReprogramacion validación", () => {
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
    const page = TestBed.runInInjectionContext(() => new CitaReprogramacion());
    expect(page.reproGroup.invalid).toBe(true);
    const saving = page.reprogramar();
    http.expectNone((request) => request.method === "POST");
    await saving;
    expect(page.error).not.toBe("");
    expect(page.reproGroup.touched).toBe(true);
    http.verify();
  });
});

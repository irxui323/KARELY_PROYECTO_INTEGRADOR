import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth-service";

describe("AuthService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it("activa el aviso un minuto antes del vencimiento", () => {
    const expiraEn = Date.now() + 61_000;
    sessionStorage.setItem(
      "karely_session",
      JSON.stringify({
        token: `a.${btoa(JSON.stringify({ exp: Math.floor(expiraEn / 1000) }))}.c`,
        usuario: "doctor",
        rol: "DOCTOR",
        idUsuario: 1,
      }),
    );

    const auth = TestBed.inject(AuthService);

    vi.advanceTimersByTime(2_000);

    expect(auth.porVencer()).toBe(true);
  });
});

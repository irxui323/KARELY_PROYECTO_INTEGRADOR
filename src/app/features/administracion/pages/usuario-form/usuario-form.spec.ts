import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { AuthService } from "../../../../core/auth/auth-service";
import { of, throwError } from "rxjs";
import { UsuarioForm } from "./usuario-form";
import { AdministracionService } from "../../services/administracion-service";

describe("Alta breve de trabajadores", () => {
  const acceso = {
    idUsuario: 10,
    username: "recepcion",
    correo: "recepcion@example.com",
    password: "GeneradaSegura2026!",
  };
  function preparar(falla = false) {
    const api = {
      roles: vi.fn(() =>
        of([
          { idRol: 2, nombre: "RECEPCIONISTA", estado: "ACTIVO" },
          { idRol: 3, nombre: "DOCTOR", estado: "ACTIVO" },
          { idRol: 9, nombre: "CAJERA", estado: "INACTIVO" },
        ]),
      ),
      crearUsuario: vi.fn(() =>
        falla
          ? throwError(() => ({ error: { error: "Usuario duplicado" } }))
          : of(acceso),
      ),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            session: () => ({ rol: "ADMINISTRADORA" }),
            tienePermiso: () => true,
          },
        },
        { provide: AdministracionService, useValue: api },
      ],
    });
    const fixture = TestBed.createComponent(UsuarioForm);
    return { pagina: fixture.componentInstance, api };
  }
  it("ofrece trabajadores activos y conserva el proceso separado de doctores", async () => {
    const { pagina } = preparar();
    await pagina.cargar();
    expect(pagina.roles.map((r) => r.nombre)).toEqual(["RECEPCIONISTA"]);
  });
  it("registra sin solicitar contraseña y muestra las credenciales sin redirigir", async () => {
    const { pagina, api } = preparar();
    pagina.nuevo = {
      idRol: 2,
      username: "recepcion",
      correo: "recepcion@example.com",
    };
    await pagina.crearUsuario();
    expect(api.crearUsuario).toHaveBeenCalledWith({
      idRol: 2,
      username: "recepcion",
      correo: "recepcion@example.com",
    });
    expect(pagina.acceso).toEqual(acceso);
    expect(pagina.nuevo.username).toBeFalsy();
  });
  it("rechaza correo inválido antes de enviar", async () => {
    const { pagina, api } = preparar();
    pagina.nuevo = { idRol: 2, username: "recepcion", correo: "incorrecto" };
    await pagina.crearUsuario();
    expect(api.crearUsuario).not.toHaveBeenCalled();
  });
  it("no muestra credenciales cuando falla el registro", async () => {
    const { pagina } = preparar(true);
    pagina.nuevo = {
      idRol: 2,
      username: "recepcion",
      correo: "recepcion@example.com",
    };
    await pagina.crearUsuario();
    expect(pagina.acceso).toBeNull();
    expect(pagina.error).toBeTruthy();
  });
});

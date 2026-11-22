import { TestBed } from "@angular/core/testing";
import { ChangeDetectorRef } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting, HttpTestingController } from "@angular/common/http/testing";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { AuthService } from "../../../core/auth/auth-service";
import { RecuperarPassword } from "./recuperar-password/recuperar-password";
import { RestablecerPassword } from "./restablecer-password/restablecer-password";
describe("Recuperación de contraseña", () => {
    let http: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
                { provide: ChangeDetectorRef, useValue: { markForCheck() { } } },
                { provide: ActivatedRoute, useValue: { snapshot: { fragment: "token=sssssssssssssssssssssssssssssssssssssssssss" } } }
            ] });
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => http.verify());
    it("rechaza correo inválido sin enviar HTTP", async () => {
        const page = TestBed.runInInjectionContext(() => new RecuperarPassword());
        page.form.controls.correo.setValue("invalido");
        await page.enviar();
        http.expectNone(() => true);
        expect(page.error).not.toBe("");
    });
    it("envía correo una vez y muestra respuesta genérica y bandeja", async () => {
        const page = TestBed.runInInjectionContext(() => new RecuperarPassword());
        page.form.controls.correo.setValue("persona@example.com");
        const pending = page.enviar();
        await page.enviar();
        const req = http.expectOne(r => r.url.endsWith("/auth/recuperacion"));
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual({ correo: "persona@example.com" });
        req.flush({ mensaje: "Si el correo corresponde a una cuenta, recibirás instrucciones para restablecer tu contraseña" }, { status: 202, statusText: "Accepted" });
        await pending;
        expect(page.enviado).toBe(true);
        expect(page.loading).toBe(false);
    });
    it("permite reintentar un error de recuperación sin filtrar datos del servidor", async () => {
        const page = TestBed.runInInjectionContext(() => new RecuperarPassword());
        page.form.controls.correo.setValue("persona@example.com");
        const pending = page.enviar();
        http.expectOne(r => r.url.endsWith("/auth/recuperacion")).flush({ message: "dato privado" }, { status: 500, statusText: "Error" });
        await pending;
        expect(page.error).not.toContain("dato privado");
        expect(page.loading).toBe(false);
        expect(page.enviado).toBe(false);
    });
    it("extrae token del fragmento y lo limpia de la URL", () => {
        history.replaceState(null, "", "/restablecer-password#token=sssssssssssssssssssssssssssssssssssssssssss");
        TestBed.runInInjectionContext(() => new RestablecerPassword());
        expect(location.hash).toBe("");
    });
    it("rechaza enlace sin token", async () => {
        (TestBed.inject(ActivatedRoute).snapshot as unknown as {
            fragment: string | null;
        }).fragment = null;
        const page = TestBed.runInInjectionContext(() => new RestablecerPassword());
        expect(page.enlaceInvalido).toBe(true);
        await page.enviar();
        http.expectNone(() => true);
    });
    it("valida longitud y coincidencia antes de enviar HTTP", async () => {
        const page = TestBed.runInInjectionContext(() => new RestablecerPassword());
        for (const password of ["corta", "x".repeat(73)]) {
            page.form.setValue({ password, confirmacionPassword: password });
            expect(page.form.invalid).toBe(true);
        }
        page.form.setValue({ password: "NuevaPassword123", confirmacionPassword: "distinta" });
        await page.enviar();
        expect(page.form.invalid).toBe(true);
        http.expectNone(() => true);
    });
    it("muestra opción de nuevo enlace tras error 400 y conserva formulario", async () => {
        const fixture = TestBed.createComponent(RestablecerPassword);
        fixture.detectChanges();
        const page = fixture.componentInstance;
        page.form.setValue({ password: "NuevaPassword123", confirmacionPassword: "NuevaPassword123" });
        const pending = page.enviar();
        http.expectOne(r => r.url.endsWith("/auth/restablecer-password")).flush({}, { status: 400, statusText: "Bad Request" });
        await pending;
        fixture.detectChanges();
        expect(page.enlaceInvalido).toBe(false);
        expect(page.loading).toBe(false);
        expect(page.form.controls.password.value).toBe("NuevaPassword123");
        expect(fixture.nativeElement.querySelector('a[href="/recuperar-password"]')).not.toBeNull();
        expect(fixture.nativeElement.textContent).toContain("Comprueba que la contraseña sea nueva");
    });
    it("reintenta después de un 400 con el mismo token y otra contraseña", async () => {
        const page = TestBed.runInInjectionContext(() => new RestablecerPassword());
        page.form.setValue({ password: "NuevaPassword123", confirmacionPassword: "NuevaPassword123" });
        const pending = page.enviar();
        const first = http.expectOne(r => r.url.endsWith("/auth/restablecer-password"));
        const token = first.request.body.token;
        first.flush({}, {status:400,statusText:"Bad Request"});
        await pending;
        page.form.setValue({ password: "OtraPassword456", confirmacionPassword: "OtraPassword456" });
        const retry = page.enviar();
        const second = http.expectOne(r => r.url.endsWith("/auth/restablecer-password"));
        expect(second.request.body.token).toBe(token);
        expect(second.request.body.password).toBe("OtraPassword456");
        second.flush({mensaje:"Contraseña actualizada"});
        await retry;
        expect(page.exito).toBe(true);
    });
    it("rechaza contraseña mayor de 72 bytes UTF-8 sin solicitud HTTP", async () => {
        const page = TestBed.runInInjectionContext(() => new RestablecerPassword());
        const password = "á".repeat(40);
        page.form.setValue({password,confirmacionPassword:password});
        expect(page.form.invalid).toBe(true);
        await page.enviar();
        http.expectNone(() => true);
    });
    it("rechaza token con formato inválido al abrir", () => {
        (TestBed.inject(ActivatedRoute).snapshot as unknown as {fragment:string}).fragment = "token=invalido";
        const page = TestBed.runInInjectionContext(() => new RestablecerPassword());
        expect(page.enlaceInvalido).toBe(true);
    });
    it("restablece una vez y limpia sesión sin iniciar sesión ni redirigir", async () => {
        const page = TestBed.runInInjectionContext(() => new RestablecerPassword());
        const auth = TestBed.inject(AuthService);
        sessionStorage.setItem("karely_session", "anterior");
        page.form.setValue({ password: "NuevaPassword123", confirmacionPassword: "NuevaPassword123" });
        const pending = page.enviar();
        await page.enviar();
        const req = http.expectOne(r => r.url.endsWith("/auth/restablecer-password"));
        expect(req.request.body).toEqual({ token: "sssssssssssssssssssssssssssssssssssssssssss", password: "NuevaPassword123", confirmacionPassword: "NuevaPassword123" });
        req.flush({ mensaje: "Contraseña actualizada" });
        await pending;
        expect(page.exito).toBe(true);
        expect(auth.session()).toBeNull();
        expect(sessionStorage.getItem("karely_session")).toBeNull();
        await page.enviar();
        http.expectNone(() => true);
    });
    it("muestra formulario correo con enlace público de retorno", async () => {
        const fixture = TestBed.createComponent(RecuperarPassword);
        fixture.detectChanges();
        const element: HTMLElement = fixture.nativeElement;
        expect(element.querySelector('input[type="email"]')).not.toBeNull();
        expect(element.querySelector('a[href="/login"]')).not.toBeNull();
    });
    it("muestra formulario de contraseñas y reemplaza por éxito al completar", async () => {
        const fixture = TestBed.createComponent(RestablecerPassword);
        fixture.detectChanges();
        const page = fixture.componentInstance;
        const element: HTMLElement = fixture.nativeElement;
        expect(element.querySelectorAll('input[type="password"]').length).toBe(2);
        page.form.setValue({ password: "NuevaPassword123", confirmacionPassword: "NuevaPassword123" });
        const pending = page.enviar();
        http.expectOne(r => r.url.endsWith("/auth/restablecer-password")).flush({ mensaje: "Contraseña actualizada" });
        await pending;
        fixture.detectChanges();
        expect(element.querySelector('input')).toBeNull();
        expect(element.textContent).toContain("Contraseña actualizada");
        expect(element.querySelector('a[href="/login"]')).not.toBeNull();
    });
    it("mantiene formulario para reintentar un fallo del servidor al restablecer", async () => {
        const page = TestBed.runInInjectionContext(() => new RestablecerPassword());
        page.form.setValue({ password: "NuevaPassword123", confirmacionPassword: "NuevaPassword123" });
        const pending = page.enviar();
        http.expectOne(r => r.url.endsWith("/auth/restablecer-password")).flush({ message: "dato privado" }, { status: 500, statusText: "Error" });
        await pending;
        expect(page.enlaceInvalido).toBe(false);
        expect(page.exito).toBe(false);
        expect(page.loading).toBe(false);
        expect(page.error).not.toContain("dato privado");
    });
});

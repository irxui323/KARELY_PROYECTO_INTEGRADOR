import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig } from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { routes } from "./app.routes";
import { authInterceptor } from "./core/interceptors/auth-interceptor";
import { errorInterceptor } from "./core/interceptors/error-interceptor";
import { csrfInterceptor } from "./core/interceptors/csrf-interceptor";
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, csrfInterceptor])),
  ],
};

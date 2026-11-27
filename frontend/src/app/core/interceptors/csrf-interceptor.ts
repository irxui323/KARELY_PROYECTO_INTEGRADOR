import { HttpClient, HttpInterceptorFn, HttpXsrfTokenExtractor } from "@angular/common/http";
import { inject } from "@angular/core";
import { switchMap, throwError } from "rxjs";
import { environment } from "../../../environments/environment";
import { isApiRequest } from "./api-request";

export const csrfInterceptor: HttpInterceptorFn = (request, next) => {
  if (!isApiRequest(request.url) || ["GET", "HEAD", "OPTIONS", "TRACE"].includes(request.method)) {
    return next(request);
  }
  const extractor = inject(HttpXsrfTokenExtractor);
  const http = inject(HttpClient);
  const send = () => {
    const token = extractor.getToken();
    if (!token) return throwError(() => new Error("No se pudo verificar la seguridad de la solicitud. Recarga la página."));
    return next(request.clone({ setHeaders: { "X-XSRF-TOKEN": token } }));
  };
  return extractor.getToken()
    ? send()
    : http.get(`${environment.apiUrl}/health`).pipe(switchMap(send));
};

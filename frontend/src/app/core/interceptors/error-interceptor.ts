import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { AuthService } from "../auth/auth-service";
import { isApiRequest } from "./api-request";
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        isApiRequest(request.url) &&
        error.status === 401 &&
        !request.url.endsWith("/auth/login")
      )
        auth.clear();
      return throwError(() => error);
    }),
  );
};

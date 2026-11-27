import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../auth/auth-service";
import { isApiRequest } from "./api-request";
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthService).session();
  return next(
    session && isApiRequest(request.url)
      ? request.clone({
          setHeaders: { Authorization: "Bearer " + session.token },
        })
      : request,
  );
};

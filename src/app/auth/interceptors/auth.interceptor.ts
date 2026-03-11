import { HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { AuthService } from "../auth.service";
import { inject } from "@angular/core";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  // Inject the current `AuthService` and use it to get an authentication token:
  const token = inject(AuthService).token();
  console.log(token);
  const newReq = req.clone({
    headers: req.headers.append('Authorization', ` Bearer ${token}`),
  });
  return next(newReq);
}

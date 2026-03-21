import { inject } from "@angular/core";
import { CanMatchFn, Route, Router, UrlSegment } from "@angular/router";
import { AuthService } from "../auth.service";
import { firstValueFrom } from "rxjs";

export const IsAdminGuard: CanMatchFn = async (
  route: Route,
  segmemts: UrlSegment[]
) => {
  const authService = inject(AuthService);

  await firstValueFrom(authService.checkStatus())

  return authService.isAdmin();
}

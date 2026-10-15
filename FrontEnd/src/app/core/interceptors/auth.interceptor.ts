import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const isLoginRequest = req.url.includes('/api/auth/login');

  // Login must never receive a stale bearer token.
  const request = token && !isLoginRequest
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 && !isLoginRequest) {
          const returnUrl = router.url;
          authService.logout();
          void router.navigate(['/login'], {
            queryParams: returnUrl && !returnUrl.startsWith('/login')
              ? { returnUrl }
              : undefined
          });
        } else if (error.status === 403 && router.url !== '/acceso-denegado') {
          void router.navigateByUrl('/acceso-denegado');
        }
      }

      return throwError(() => error);
    })
  );
};

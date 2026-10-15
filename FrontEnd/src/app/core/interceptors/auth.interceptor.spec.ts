import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['getToken', 'logout']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl'], {
      url: '/admin/jugadores/42?tab=medical#history'
    });
    router.navigate.and.resolveTo(true);
    router.navigateByUrl.and.resolveTo(true);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('clears the session and redirects a 401 while preserving the full current URL', async () => {
    auth.getToken.and.returnValue('token');
    const error = new HttpErrorResponse({ status: 401 });

    await expectAsync(firstValueFrom(TestBed.runInInjectionContext(() =>
      authInterceptor(
        new HttpRequest('GET', '/api/jugadores'),
        () => throwError(() => error)
      )
    ))).toBeRejectedWith(error);

    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/admin/jugadores/42?tab=medical#history' }
    });
  });

  it('redirects a 403 to the access-denied page without clearing the session', async () => {
    auth.getToken.and.returnValue('token');
    const error = new HttpErrorResponse({ status: 403 });

    await expectAsync(firstValueFrom(TestBed.runInInjectionContext(() =>
      authInterceptor(
        new HttpRequest('PATCH', '/api/fichas-medicas/42', {}),
        () => throwError(() => error)
      )
    ))).toBeRejectedWith(error);

    expect(auth.logout).not.toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/acceso-denegado');
  });

  it('does not attach a stale token to login requests', async () => {
    auth.getToken.and.returnValue('stale-token');
    let captured: HttpRequest<unknown> | undefined;

    await firstValueFrom(TestBed.runInInjectionContext(() =>
      authInterceptor(new HttpRequest('POST', '/api/auth/login', {}), (request) => {
        captured = request;
        return of(new HttpResponse({ status: 200 }));
      })
    ));

    expect(captured?.headers.has('Authorization')).toBeFalse();
  });
});

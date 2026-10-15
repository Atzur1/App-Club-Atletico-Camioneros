import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('posts the browser login payload to the backend host allowed by CORS', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);

    service.login({ email: 'cacc.test.dt@example.test', password: 'temporary-password' }).subscribe();

    const request = http.expectOne('http://127.0.0.1:5191/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'cacc.test.dt@example.test',
      password: 'temporary-password',
    });
    request.flush({});
    http.verify();
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ClubPortalApiService } from './club-portal-api.service';

describe('ClubPortalApiService', () => {
  let service: ClubPortalApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ClubPortalApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the browser API origin consistently for shared player reads', () => {
    service.getPlayer(42).subscribe();
    const request = http.expectOne('http://127.0.0.1:5191/api/jugadores/42');
    expect(request.request.method).toBe('GET');
    request.flush({ idJugador: 42, nombre: 'Ana', apellido: 'Paz', dni: '1' });
  });

  it('encodes category roster mutations behind typed methods', () => {
    service.addPlayerToCategory(3, 42).subscribe();
    const request = http.expectOne('http://127.0.0.1:5191/api/categorias/3/jugadores');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ idJugador: 42 });
    request.flush(null);
  });
});


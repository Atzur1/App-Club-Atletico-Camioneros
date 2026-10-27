import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { SharedMedicalRecordComponent } from './shared-medical-record.component';

describe('SharedMedicalRecordComponent', () => {
  let http: HttpTestingController;

  function create(role: string) {
    TestBed.configureTestingModule({
      imports: [SharedMedicalRecordComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '42' }) } } },
        { provide: AuthService, useValue: { getRol: () => role } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(SharedMedicalRecordComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => http.verify());

  it('loads the player and medical record using the real API routes', () => {
    const component = create('Médico');
    http.expectOne('/api/jugadores/42').flush({ idJugador: 42, nombre: 'Ana', apellido: 'Pérez' });
    http.expectOne('/api/fichas-medicas/jugador/42').flush({ idFichaMedica: 7, idJugador: 42 });
    expect(component.player?.idJugador).toBe(42);
    expect(component.record?.idFichaMedica).toBe(7);
    expect(component.canEdit).toBeTrue();
  });

  it('sends PUT for an editable medical role', () => {
    const component = create('Administrador (Tesorero)');
    http.expectOne('/api/jugadores/42').flush({ idJugador: 42, nombre: 'Ana', apellido: 'Pérez' });
    http.expectOne('/api/fichas-medicas/jugador/42').flush({ idFichaMedica: 7, idJugador: 42 });
    component.save();
    const request = http.expectOne('/api/fichas-medicas/7');
    expect(request.request.method).toBe('PUT');
    request.flush({});
  });

  it('is read-only for coordinator and does not send PUT', () => {
    const component = create('Coordinador');
    http.expectOne('/api/jugadores/42').flush({ idJugador: 42, nombre: 'Ana', apellido: 'Pérez' });
    http.expectOne('/api/fichas-medicas/jugador/42').flush({ idFichaMedica: 7, idJugador: 42 });
    expect(component.canEdit).toBeFalse();
    component.save();
    http.expectNone('/api/fichas-medicas/7');
  });
});

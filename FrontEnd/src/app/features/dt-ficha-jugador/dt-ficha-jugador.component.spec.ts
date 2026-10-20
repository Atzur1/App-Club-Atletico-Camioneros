import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { RolePlayerViewService } from '../../shared/services/role-player-view.service';
import { DtFichaJugadorComponent } from './dt-ficha-jugador.component';

describe('DtFichaJugadorComponent', () => {
  it('keeps the DT profile read-only without an edit affordance', () => {
    TestBed.configureTestingModule({
      imports: [DtFichaJugadorComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '42' }) } } },
        { provide: RolePlayerViewService, useValue: { profile: () => of({ historialPartidos: [], lesiones: [] }) } },
      ],
    });

    const fixture = TestBed.createComponent(DtFichaJugadorComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.card-header-with-icon')?.getAttribute('style')).toBeNull();
    expect(element.querySelector('.card-header-with-icon svg.pencil-icon')).toBeNull();
    expect('editarHistorial' in fixture.componentInstance).toBeFalse();
    expect(element.textContent).toContain('FICHA MEDICA');
    expect(element.querySelector('aside.sidebar')).toBeNull();
    expect(element.querySelector('header.top-header')).toBeNull();
    expect(element.querySelector('button[title*="Editar"], a[title*="Editar"]')).toBeNull();
    expect(element.querySelector('.attendance-history-button')?.textContent).toContain('Historial de asistencia');
  });
});

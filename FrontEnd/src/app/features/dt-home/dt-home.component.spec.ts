import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { RolePlayerRow, RolePlayerViewService } from '../../shared/services/role-player-view.service';
import { DtHomeComponent } from './dt-home.component';

describe('DtHomeComponent', () => {
  let fixture: ComponentFixture<DtHomeComponent>;
  let views: jasmine.SpyObj<RolePlayerViewService>;
  const assignedPlayers: RolePlayerRow[] = [
    {
      id: 7,
      nombreCompleto: 'Jugador Asignado',
      dni: '40111222',
      categoria: 'Sub 15',
      fechaNacimiento: '01/01/2011',
      posicion: 'VOLANTE',
      edad: '15 AÑOS',
    },
  ];
  beforeEach(async () => {
    views = jasmine.createSpyObj<RolePlayerViewService>('RolePlayerViewService', [
      'players',
      'categories',
      'profile',
    ]);
    views.players.and.returnValue(of(assignedPlayers));
    views.categories.and.returnValue(
      of([{ id: 2, nombre: 'Sub 15', cantidadJugadores: '1', asociacion: '' }]),
    );

    await TestBed.configureTestingModule({
      imports: [DtHomeComponent],
      providers: [
        { provide: RolePlayerViewService, useValue: views },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DtHomeComponent);
    fixture.detectChanges();
  });

  it('uses the canonically scoped player collection for the dashboard counter and table', () => {
    const component = fixture.componentInstance;

    expect(views.players).toHaveBeenCalledTimes(1);
    expect(component.players).toEqual(assignedPlayers);
    expect(component.cantidadJugadores).toBe(1);
    expect(component.filteredPlayers).toEqual(assignedPlayers);
  });

  it('does not infer current injuries from historical medical records', () => {
    expect(fixture.componentInstance.estadoMedicoActual).toBe('Sin dato');
    expect(views.profile).not.toHaveBeenCalled();
  });
});

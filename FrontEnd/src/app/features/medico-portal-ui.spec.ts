import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MainLayout } from '../layout/main-layout/main-layout';
import { AuthService } from '../shared/services/auth.service';
import { RolePlayerViewService } from '../shared/services/role-player-view.service';
import { MedicoCategoriaJugadoresComponent } from './medico-categoria-jugadores/medico-categoria-jugadores.component';
import { MedicoFichaJugadorComponent } from './medico-ficha-jugador/medico-ficha-jugador.component';

class MedicoAuthStub {
  logout = jasmine.createSpy('logout');
  getRol(): string { return 'Médico'; }
  getToken(): string | null { return 'token'; }
  obtenerDatosUsuario(): { email: string; rol: string } {
    return { email: 'medico@camioneros.test', rol: 'Médico' };
  }
}

class PlayerViewsStub {
  categoryPlayers = jasmine.createSpy('categoryPlayers').and.returnValue(of([]));
  profile = jasmine.createSpy('profile').and.returnValue(of({}));
}

describe('Médico portal shell', () => {
  let fixture: ComponentFixture<MainLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [provideRouter([]), { provide: AuthService, useClass: MedicoAuthStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    fixture.detectChanges();
  });

  it('exposes only the canonical read-oriented Médico menu', () => {
    const component = fixture.componentInstance;

    expect(component.navItems.map((item) => item.path)).toEqual([
      '/medico', '/medico/jugadores', '/medico/categorias',
    ]);
    expect(component.navItems.some((item) => item.label === 'Staff')).toBeFalse();
    expect(fixture.nativeElement.querySelectorAll('.sidebar').length).toBe(1);
  });
});

describe('Médico roster actions', () => {
  let fixture: ComponentFixture<MedicoCategoriaJugadoresComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicoCategoriaJugadoresComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '7' } } } },
        { provide: RolePlayerViewService, useClass: PlayerViewsStub },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(MedicoCategoriaJugadoresComponent);
    fixture.detectChanges();
    fixture.componentInstance.players = [{ id: 42, nombreCompleto: 'Jugador', dni: '123', posicion: 'ARQUERO', edad: '20' }];
    fixture.detectChanges();
  });

  it('keeps the roster read-only and renders no duplicate portal shell', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Ver ficha');
    expect(text).not.toContain('Editar Jugador');
    expect(fixture.nativeElement.querySelector('.sidebar')).toBeNull();
    expect(fixture.nativeElement.querySelector('.top-header')).toBeNull();
  });

  it('opens the canonical Médico player profile', () => {
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);

    fixture.componentInstance.verFicha(42);

    expect(navigate).toHaveBeenCalledOnceWith(['/medico/jugadores', 42]);
  });
});

describe('Médico profile actions', () => {
  it('routes the only edit action to the canonical medical record editor', () => {
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const route = { params: of({ id: '42' }) } as unknown as ActivatedRoute;
    const views = { profile: () => of({}) } as unknown as RolePlayerViewService;
    const component = new MedicoFichaJugadorComponent(route, router, views);
    component.playerId = 42;

    component.editarFicha();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/medico/jugadores', 42, 'ficha-medica']);
  });
});

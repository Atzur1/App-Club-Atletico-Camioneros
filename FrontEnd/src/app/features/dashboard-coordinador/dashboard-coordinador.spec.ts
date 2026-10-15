import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { DashboardCoordinador } from './dashboard-coordinador';

describe('DashboardCoordinador', () => {
  it('uses the canonical categories route and logs out through AuthService', () => {
    const logout = jasmine.createSpy('logout');
    TestBed.configureTestingModule({
      imports: [DashboardCoordinador],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout } },
      ],
    });
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);
    const fixture = TestBed.createComponent(DashboardCoordinador);
    const component = fixture.componentInstance;
    expect(component.navItems.find((item) => item.label === 'Categorias')?.route).toBe('/coordinador/categorias');
    component.logout();
    expect(logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});

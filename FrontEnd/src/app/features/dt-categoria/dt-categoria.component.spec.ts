import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RolePlayerViewService } from '../../shared/services/role-player-view.service';
import { DtCategoriaComponent } from './dt-categoria.component';

describe('DtCategoriaComponent', () => {
  it('requests assigned categories only and exposes no edit controls', () => {
    const views = jasmine.createSpyObj<RolePlayerViewService>('RolePlayerViewService', ['categories']);
    views.categories.and.returnValue(of([{ id: 7, nombre: 'Sub 17', cantidadJugadores: '20', asociacion: 'AFA' }]));
    TestBed.configureTestingModule({ imports: [DtCategoriaComponent], providers: [provideRouter([]), { provide: RolePlayerViewService, useValue: views }] });

    const fixture = TestBed.createComponent(DtCategoriaComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(views.categories).toHaveBeenCalledOnceWith(true);
    expect(element.textContent).toContain('Sub 17');
    expect(element.textContent).not.toContain('Editar');
    expect(element.textContent).not.toContain('Eliminar');
    expect(element.querySelector('aside.sidebar')).toBeNull();
  });
});

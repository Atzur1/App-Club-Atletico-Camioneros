import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { SemaforoQrComponent } from './semaforo-qr';
import { AsistenciaService } from '../../shared/services/asistencia.service';
import { AuthService } from '../../shared/services/auth.service';

describe('SemaforoQrComponent', () => {
  let fixture: ComponentFixture<SemaforoQrComponent>;
  const registrar = jasmine.createSpy('registrar');

  beforeEach(async () => {
    registrar.calls.reset();
    await TestBed.configureTestingModule({
      imports: [SemaforoQrComponent],
      providers: [
        { provide: AsistenciaService, useValue: { registrar } },
        { provide: AuthService, useValue: { logout: jasmine.createSpy('logout') } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(SemaforoQrComponent);
  });

  it('announces and focuses an idempotently registered result', fakeAsync(() => {
    registrar.and.returnValue(of({ accesoPermitido: true, estadoAcceso: 'PERMITIDO', asistenciaRegistrada: true, yaRegistrada: true, mensaje: 'Ya registrada', deudaTotal: 0, cuotasVencidas: 0 }));
    fixture.componentInstance.dni = '40111222';
    fixture.componentInstance.submitManual();
    expect(registrar).toHaveBeenCalledWith('40111222', 'DNI_MANUAL');
    fixture.detectChanges();
    tick();
    const result = fixture.nativeElement.querySelector('[role="status"].result-card') as HTMLElement;
    const heading = result.querySelector('h1') as HTMLElement;
    expect(result.getAttribute('aria-live')).toBe('assertive');
    expect(result.classList).toContain('green');
    expect(document.activeElement).toBe(heading);
  }));

  it('does not show green or yellow without backend attendance confirmation', () => {
    registrar.and.returnValue(of({ accesoPermitido: true, estadoAcceso: 'PERMITIDO', asistenciaRegistrada: false, yaRegistrada: false, mensaje: 'No confirmada', deudaTotal: 0, cuotasVencidas: 0 }));
    fixture.componentInstance.dni = '40111222';
    fixture.componentInstance.submitManual();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.result-card')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('no confirmó');
  });

  it('shows a recorded denied attempt as the red semaphore result', () => {
    registrar.and.returnValue(of({ accesoPermitido: false, estadoAcceso: 'DENEGADO', asistenciaRegistrada: true, yaRegistrada: false, mensaje: 'Acceso denegado. El intento de ingreso fue registrado.', deudaTotal: 2000, cuotasVencidas: 2 }));
    fixture.componentInstance.dni = '99000002';
    fixture.componentInstance.submitManual();
    fixture.detectChanges();
    const result = fixture.nativeElement.querySelector('.result-card') as HTMLElement;
    expect(result.classList).toContain('red');
    expect(result.textContent).toContain('Jugador inhabilitado');
    expect(result.textContent).toContain('intento de ingreso fue registrado');
  });

  it('marks camera payloads as QR credential reads', () => {
    registrar.and.returnValue(of({ accesoPermitido: true, estadoAcceso: 'PERMITIDO', asistenciaRegistrada: true, yaRegistrada: false, mensaje: 'Registrada', deudaTotal: 0, cuotasVencidas: 0 }));
    (fixture.componentInstance as any).processPayload('99000001', 'QR');
    expect(registrar).toHaveBeenCalledWith('99000001', 'QR');
  });
});

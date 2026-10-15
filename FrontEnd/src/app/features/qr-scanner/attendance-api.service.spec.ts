import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AttendanceApiService } from './attendance-api.service';

describe('AttendanceApiService', () => {
  let service: AttendanceApiService; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]}); service=TestBed.inject(AttendanceApiService); http=TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('sends opaque QR token through the same-origin API path', () => { service.registerByQr('opaque.token').subscribe(); const req=http.expectOne('/api/asistencias/registrar-por-qr'); expect(req.request.body).toEqual({qrToken:'opaque.token'}); req.flush({accesoPermitido:true,mensaje:'ok',deudaTotal:0,cuotasVencidas:0}); });
  it('uses the same-origin manual DNI endpoint', () => { service.registerManually('12345678','QR no legible').subscribe(); const req=http.expectOne('/api/asistencias/registrar-manual'); expect(req.request.body).toEqual({dni:'12345678',reason:'QR no legible'}); req.flush({accesoPermitido:true,mensaje:'ok',deudaTotal:0,cuotasVencidas:0}); });
});

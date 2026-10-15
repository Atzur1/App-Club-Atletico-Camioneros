import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface IngresoResult { accesoPermitido: boolean; asistenciaRegistrada: boolean; yaRegistrada: boolean; mensaje: string; deudaTotal: number; cuotasVencidas: number; }
@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://127.0.0.1:5191/api/asistencias/verificar-y-registrar';
  registrar(dni: string): Observable<IngresoResult> { return this.http.post<IngresoResult>(this.url, { dni }); }
}

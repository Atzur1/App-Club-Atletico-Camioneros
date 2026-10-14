import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
export interface AttendanceResult { accesoPermitido:boolean; mensaje:string; deudaTotal:number; cuotasVencidas:number; }
@Injectable({providedIn:'root'})
export class AttendanceApiService {
 private readonly http=inject(HttpClient); private readonly base='/api/asistencias';
 registerByQr(qrToken:string):Observable<AttendanceResult>{return this.http.post<AttendanceResult>(`${this.base}/registrar-por-qr`,{qrToken});}
 registerManually(dni:string,reason?:string):Observable<AttendanceResult>{return this.http.post<AttendanceResult>(`${this.base}/registrar-manual`,{dni,reason});}
}

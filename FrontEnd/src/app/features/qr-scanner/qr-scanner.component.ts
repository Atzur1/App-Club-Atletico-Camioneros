import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { finalize } from 'rxjs';
import { AttendanceApiService, AttendanceResult } from './attendance-api.service';
@Component({selector:'app-qr-scanner',standalone:true,imports:[CommonModule,ReactiveFormsModule],templateUrl:'./qr-scanner.component.html',styleUrl:'./qr-scanner.component.css'})
export class QrScannerComponent implements OnDestroy {
 @ViewChild('preview') private preview?:ElementRef<HTMLVideoElement>;
 readonly dni=new FormControl('',{nonNullable:true,validators:[Validators.required,Validators.pattern(/^\d{7,8}$/)]});
 readonly cameraState=signal<'idle'|'starting'|'active'>('idle'); readonly busy=signal(false); readonly message=signal(''); readonly result=signal<AttendanceResult|null>(null); readonly torchAvailable=signal(false); readonly torchEnabled=signal(false);
 private readonly browser=isPlatformBrowser(inject(PLATFORM_ID)); private readonly api=inject(AttendanceApiService); private reader?:BrowserQRCodeReader; private controls?:IScannerControls; private lastToken=''; private lastReadAt=0;
 async openCamera(){if(!this.browser||this.cameraState()!=='idle'||!this.preview)return;this.clear();this.cameraState.set('starting');try{this.reader??=new BrowserQRCodeReader(undefined,{delayBetweenScanAttempts:250});this.controls=await this.reader.decodeFromConstraints({audio:false,video:{facingMode:{ideal:'environment'}}},this.preview.nativeElement,(r,e)=>{if(r)this.detected(r.getText());if(e&&!(e instanceof NotFoundException))this.message.set('No se pudo interpretar la imagen de la cámara.');});this.cameraState.set('active');this.detectTorch();}catch(e){this.closeCamera();this.message.set(e instanceof DOMException&&e.name==='NotAllowedError'?'El permiso de cámara fue rechazado. Habilitalo en el navegador.':'No fue posible iniciar la cámara. Usá HTTPS o localhost.');}}
 closeCamera(){this.controls?.stop();this.controls=undefined;const stream=this.preview?.nativeElement.srcObject as MediaStream|null;stream?.getTracks().forEach(t=>t.stop());if(this.preview)this.preview.nativeElement.srcObject=null;this.cameraState.set('idle');this.torchAvailable.set(false);this.torchEnabled.set(false);}
 async toggleTorch(){const track=(this.preview?.nativeElement.srcObject as MediaStream|null)?.getVideoTracks()[0];if(!track||!this.torchAvailable())return;const next=!this.torchEnabled();try{await track.applyConstraints({advanced:[{torch:next} as MediaTrackConstraintSet]});this.torchEnabled.set(next);}catch{this.message.set('La linterna no está disponible en este dispositivo.');}}
 registerManually(){this.dni.markAsTouched();if(this.dni.invalid||this.busy())return;this.submit(this.api.registerManually(this.dni.value,'QR no legible'),true);}
 scanNext(){this.clear();void this.openCamera();} ngOnDestroy(){this.closeCamera();}
 private detected(token:string){const now=Date.now();if(this.busy()||(token===this.lastToken&&now-this.lastReadAt<5000))return;this.lastToken=token;this.lastReadAt=now;this.closeCamera();this.submit(this.api.registerByQr(token),false);}
 private submit(req:ReturnType<AttendanceApiService['registerByQr']>,clearDni:boolean){this.busy.set(true);this.clear();req.pipe(finalize(()=>this.busy.set(false))).subscribe({next:v=>{this.result.set(v);if(clearDni)this.dni.reset();},error:(e:HttpErrorResponse)=>this.message.set(e.error?.message??'No se pudo registrar el ingreso.')});}
 private detectTorch(){const track=(this.preview?.nativeElement.srcObject as MediaStream|null)?.getVideoTracks()[0];const caps=track?.getCapabilities?.() as MediaTrackCapabilities&{torch?:boolean};this.torchAvailable.set(caps?.torch===true);}
 private clear(){this.message.set('');this.result.set(null);}
}

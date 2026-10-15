import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PortalAccessService } from '../../shared/auth/portal-access.service';
import { SharedMedicalRecordComponent } from '../shared-medical-record/shared-medical-record.component';

@Component({
  selector: 'app-admin-medical-page', standalone: true,
  imports: [CommonModule, SharedMedicalRecordComponent],
  templateUrl: './admin-medical-page.html', styleUrl: './admin-medical-page.css',
})
export class AdminMedicalPage {
  private readonly access = inject(PortalAccessService);
  readonly readOnly = !this.access.capabilities.canEditMedicalRecord;
  readonly roleLabel = this.access.role === 'coordinador' ? 'COORDINACIÓN' : 'ADMINISTRACIÓN';
}

import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ROLE_CAPABILITIES } from '../../shared/auth/role-capabilities';
import { SharedMedicalRecordComponent } from '../shared-medical-record/shared-medical-record.component';

@Component({
  selector: 'app-coordinador-medical-page', standalone: true,
  imports: [RouterLink, RouterLinkActive, SharedMedicalRecordComponent],
  templateUrl: './coordinador-medical-page.html', styleUrl: './coordinador-medical-page.css',
})
export class CoordinadorMedicalPage {
  readonly readOnly = !ROLE_CAPABILITIES.coordinador.canEditMedicalRecord;
  private readonly auth = inject(AuthService); private readonly router = inject(Router);
  logout(): void { this.auth.logout(); this.router.navigate(['/login']); }
}

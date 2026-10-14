import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Capability } from '../auth/roles';
import { AuthService } from '../../shared/services/auth.service';

export const capabilityGuard: CanActivateFn = route => {
  const auth = inject(AuthService);
  const required = (route.data?.['capabilities'] ?? []) as Capability[];
  return required.some(capability => auth.puede(capability))
    ? true : inject(Router).createUrlTree(['/sin-autorizacion']);
};

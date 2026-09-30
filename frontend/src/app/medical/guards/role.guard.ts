import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data['roles'] || [];
  const userRole = authService.getRole();

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  if (authService.isMedecin())      router.navigate(['/medical/patients']);
  else if (authService.isPatient()) router.navigate(['/medical/patient/dashboard']);
  else                              router.navigate(['/medical/dashboard']);

  return false;
};

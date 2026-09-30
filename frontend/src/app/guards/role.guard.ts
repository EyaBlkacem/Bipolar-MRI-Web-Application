import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (expectedRole: string) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser();

  if (user?.role === expectedRole) {
    return true;
  }

  if (user?.role === 'user') {
    return router.createUrlTree(['/user-dashboard']);
  }

  return router.createUrlTree(['/login']);
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  debugger;
  console.log('Auth Guard activated');
  const router = inject(Router);

  const isLoggedIn = localStorage.getItem('auth_token');
  if (isLoggedIn != null) {
    return true;
  } else {

    router.navigateByUrl('login');
    return false;
  }
}
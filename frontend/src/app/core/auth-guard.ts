import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Auth } from './auth';

/** Lets logged-in users through and sends everybody else to the login page, also if the check fails. */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(Auth)
    .me()
    .pipe(
      catchError(() => of(null)),
      map((user) => user !== null || router.createUrlTree(['/login'])),
    );
};

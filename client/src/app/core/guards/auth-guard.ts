import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UserService } from '../services/user.service';
import { AuthSessionService } from '../services/auth-session.service';

export const authGuard: CanActivateFn = (route, state) => {
  const userSer = inject(UserService);
  const router = inject(Router);
  const authSession = inject(AuthSessionService);

  if (!userSer.isLoggedIn()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  return userSer.getProfile().pipe(
    map(user => {
      if (!user.isActive) {
        console.log('User account is inactive. Logging out.');
        return router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: state.url },
        });
      }
      return true;
    }),
    catchError(() => {
      authSession.clearSession();
      return of(
        router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: state.url },
        })
      );
    })
  );
};

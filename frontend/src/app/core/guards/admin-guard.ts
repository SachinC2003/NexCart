import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UserService } from '../services/user.service';

export const adminGuard: CanActivateChildFn = (route, state) => {
  const userSer = inject(UserService);
  const router = inject(Router);
  const role = userSer.getUserRole;

  if (role === 'admin') {
    return true;
  }

  if (!userSer.isLoggedIn()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  return userSer.getProfile().pipe(
    map((user) => {
      if (user.role === 'admin') {
        return true;
      }

      return router.createUrlTree(['/'], {
        queryParams: { returnUrl: state.url },
      });
    }),
    catchError(() =>
      of(
        router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: state.url },
        })
      )
    )
  );
};

import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AuthSessionService } from '../services/auth-session.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authSession = inject(AuthSessionService);
  const token = authSession.getAccessToken();
  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const shouldSkipRefresh = isRefreshExcludedRoute(req.url);
  const request = token && isApiRequest ? attachAccessToken(req, token) : req;
  const requestWithCredentials = isApiRequest ? request.clone({ withCredentials: true }) : request;

  return next(requestWithCredentials).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        !isApiRequest ||
        shouldSkipRefresh
      ) {
        return throwError(() => error);
      }

      return authSession.refreshAccessToken().pipe(
        switchMap((nextToken) => next(attachAccessToken(req, nextToken))),
        catchError((refreshError) => {
          authSession.clearSession();
          return throwError(() => refreshError);
        })
      );
    })
  );
};

function attachAccessToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    withCredentials: true,
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function isRefreshExcludedRoute(url: string): boolean {
  const excludedRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/refresh',
    '/auth/logout',
  ];

  return excludedRoutes.some((route) => url.includes(route));
}

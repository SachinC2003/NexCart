import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, finalize, map, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AuthResponse } from '../../types/auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly storageKey = 'access_token';
  private readonly http = inject(HttpClient);

  private accessToken: string | null = null;
  private refreshRequest$: Observable<string> | null = null;

  constructor() {
    this.accessToken = this.readStoredToken();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isLoggedIn(): boolean {
    return this.hasValidAccessToken();
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
    this.persistToken(token);
  }

  clearSession(): void {
    this.setAccessToken(null);
  }

  refreshAccessToken(): Observable<string> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.refreshRequest$ = this.http
      .post<AuthResponse>(
        `${environment.apiUrl}/auth/refresh`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((response) => response.accessToken),
        tap((token) => {
          this.setAccessToken(token);
        }),
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay(1)
      );

    return this.refreshRequest$;
  }

  private readStoredToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedToken = sessionStorage.getItem(this.storageKey);

    if (!storedToken || this.isTokenExpired(storedToken)) {
      sessionStorage.removeItem(this.storageKey);
      return null;
    }

    return storedToken;
  }

  private persistToken(token: string | null): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (token) {
      sessionStorage.setItem(this.storageKey, token);
      return;
    }

    sessionStorage.removeItem(this.storageKey);
  }

  private hasValidAccessToken(): boolean {
    if (!this.accessToken) {
      return false;
    }

    if (this.isTokenExpired(this.accessToken)) {
      this.clearSession();
      return false;
    }

    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const [, payload] = token.split('.');

      if (!payload) {
        return true;
      }

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(atob(normalizedPayload)) as { exp?: number };

      if (!decodedPayload.exp) {
        return true;
      }

      return decodedPayload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}

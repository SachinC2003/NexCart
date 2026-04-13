import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { AuthResponse, AuthSessionsResponse } from '../../types/auth.types';
import { MessageResponse } from '../../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
   private readonly http = inject(HttpClient);
   constructor(){}

    register(name: string, email: string, password: string, phoneNumber: string, deviceName?: string){
      return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
        name,
        email,
        password,
        phoneNumber,
        ...(deviceName ? { deviceName } : {})
      }, {
        withCredentials: true
      });
    }

    login(email: string, password: string, deviceName?: string){
      return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
        ...(deviceName ? { deviceName } : {})
      },{
         withCredentials: true
      });
    }

    logout(){
      return this.http.post<MessageResponse>(`${environment.apiUrl}/auth/logout`, {}, {
        withCredentials: true
      });
    }

    getSessions(){
      return this.http.get<AuthSessionsResponse>(`${environment.apiUrl}/auth/sessions`);
    }

    revokeSession(sessionId: string){
      return this.http.delete<MessageResponse>(`${environment.apiUrl}/auth/sessions/${sessionId}`);
    }

    revokeOtherSessions(){
      return this.http.delete<MessageResponse>(`${environment.apiUrl}/auth/sessions/others`);
    }

    forgotPassword(email: string){
      return this.http.post<MessageResponse>(`${environment.apiUrl}/auth/forgot-password`, {
        email
      });
    }

    resetPassword(token: string | null , password: string){
      return this.http.post<MessageResponse>(`${environment.apiUrl}/auth/reset-password/${token}`, {
        token,
        password
      });
    }
}

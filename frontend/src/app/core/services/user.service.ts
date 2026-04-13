import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { User } from '../../types/auth.types';
import { environment } from '../../../environments/environment.development';
import { MessageResponse } from '../../types/api.types';
import { AuthSessionService } from './auth-session.service';

export interface UpdateUserStatusResponse extends MessageResponse {
  user: User & { isActive?: boolean };
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
   private http = inject(HttpClient);
   private authSession = inject(AuthSessionService);
    constructor(){}

    userRole : string | null = null;

    isLoggedIn(): boolean{
        return this.authSession.isLoggedIn();
    }

    get getUserRole(): string | null{
        return this.userRole;
    }
    getProfile(): Observable<User> {
      return this.http.get<{message: string, user: User}>(`${environment.apiUrl}/user`).pipe(
        map(response => {this.userRole = response.user.role; return response.user})
      );
    }

    updateProfile(updatedData: Partial<User>): Observable<User>{
       return this.http.put<{message: string, user: User}>(`${environment.apiUrl}/user`, updatedData).pipe(
        map(response => response.user)
       );
    }

    updateStatus(email: string): Observable<UpdateUserStatusResponse>{
        return this.http.post<UpdateUserStatusResponse>(`${environment.apiUrl}/admin/update-status`, { email });
    }

    changePassword(currentPassword: string, newPassword: string): Observable<MessageResponse>{
        return this.http.post<MessageResponse>(`${environment.apiUrl}/user/change-password`, {currentPassword, newPassword})
    }
}

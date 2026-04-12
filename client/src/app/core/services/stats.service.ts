import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { StatsResponse } from '../../types/entityTypes';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private http = inject(HttpClient);
    constructor(){}
    getStats(): Observable<StatsResponse>{
        return this.http.get<StatsResponse>(`${environment.apiUrl}/admin/stats`);
    }
}

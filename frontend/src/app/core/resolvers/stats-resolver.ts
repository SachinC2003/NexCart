import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { StatsService } from '../services/stats.service';
import { StatsResponse } from '../../types/entityTypes';

@Injectable({ providedIn: 'root'})
export class StatsResolver implements Resolve<StatsResponse>{
  constructor(private statsSer: StatsService){}

  resolve(): Observable<StatsResponse>{
     return this.statsSer.getStats();
  }
}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Observable } from 'rxjs';
import { Product, ProductResponse } from '../../types/entityTypes';

@Injectable({ providedIn: 'root'})
export class ProductResolver implements Resolve<Product | ProductResponse>{
  constructor(private productSer: ProductService){}

  resolve(route: ActivatedRouteSnapshot): Observable<Product | ProductResponse>{
     const id = Number(route.paramMap.get('id'));
     return this.productSer.getProductbyId(id!);
  }
}

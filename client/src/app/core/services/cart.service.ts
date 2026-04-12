import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { CartResponse } from '../../types/entityTypes';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class CartService {
    private http = inject(HttpClient)
    constructor(){}

    addTocart(productId: number, quantity: number){
        return this.http.post(`${environment.apiUrl}/cart/addToCart`, { productId, quantity });
    }

    getCartItems(): Observable<CartResponse>{
         return this.http.get<CartResponse>(`${environment.apiUrl}/cart`)
    }

    clearCart(){
        return this.http.delete(`${environment.apiUrl}/cart/clearCart`)
    }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Order, OrdersResponse } from '../../types/entityTypes';
import { SelectedItem } from '../../features/carts/carts';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
    private http = inject(HttpClient)

    createOrder(paymentMethod: string, location: string, totalAmount: number, orderItems: SelectedItem[]): Observable<any>{
        return this.http.post(`${environment.apiUrl}/order`, {paymentMethod, location, totalAmount, orderItems})
    }

    getOrders(page: number, limit: number, status: string): Observable<any>{
       return this.http.get<any>(`${environment.apiUrl}/order?status=${status}&page=${page}&limit=${limit}`);
    }

    getAdminOrders(page: number, limit: number, status: string): Observable<any>{
       return this.http.get<any>(`${environment.apiUrl}/admin/orders?status=${status}&page=${page}&limit=${limit}`);
    }

    updateOrderStatus(orderId: number, status: string): Observable<any>{
        console.log('order id in ser ', orderId)
        return this.http.patch(`${environment.apiUrl}/order/${orderId}/update`, { status });
    }
}

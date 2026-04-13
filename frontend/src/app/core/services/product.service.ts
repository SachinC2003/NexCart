import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { MessageResponse } from '../../types/api.types';
import {
  Product,
  ProductFIlterData,
  ProductListResponse,
  ProductResponse,
  Review,
  TaxonomyResponse,
} from '../../types/entityTypes';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  constructor() {}

  addProduct(productData: FormData): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${environment.apiUrl}/admin/addProduct`, productData);
  }

  getProducts(page: number, limit: number, filterData: ProductFIlterData): Observable<ProductListResponse> {
    const params ={
       ...filterData,
       page: page.toString(),
       limit: limit.toString()
    }
    return this.http.get<ProductListResponse>(`${environment.apiUrl}/geast/products`, {params});
  }

  getProductbyId(productId: number): Observable<ProductResponse | Product> {
    return this.http.get<ProductResponse | Product>(`${environment.apiUrl}/geast/${productId}`);
  }

  deleteProduct(productId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${environment.apiUrl}/admin/${productId}`);
  }

  updateProduct(productId: number, productData: FormData): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${environment.apiUrl}/admin/${productId}`, productData);
  }

  getTaxonomy(): Observable<TaxonomyResponse> {
    return this.http.get<TaxonomyResponse>(`${environment.apiUrl}/taxonomy/getTaxonomy`);
  }

  giveFeedback(productId: number, rating: number, comment: string): Observable<Review>{
      return this.http.post<Review>(`${environment.apiUrl}/review`, {productId, rating, comment})
  }

  getReview(productId: number): Observable<Review>{
      return this.http.get<Review>(`${environment.apiUrl}/review/${productId}`)
  }
}

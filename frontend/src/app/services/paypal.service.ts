import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config/environment';
import { Producto } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class PaypalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/paypal`;

  crearOrden(payload: { items: Producto[]; total: number }) {
    return this.http.post<{ id: string; status: string }>(`${this.apiUrl}/crearOrden`, payload);
  }

  capturarOrden(orderId: string) {
    return this.http.post<any>(`${this.apiUrl}/capturarOrden`, { orderId });
  }
}




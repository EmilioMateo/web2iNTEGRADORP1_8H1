import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';
import { Producto, ProductoPayload } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/producto`;

  obtenerTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  crear(producto: ProductoPayload | FormData): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.apiUrl, producto);
  }

  actualizarStock(id: number, enStock: number): Observable<{ message: string; id: string; enStock: number }> {
    return this.http.put<{ message: string; id: string; enStock: number }>(`${this.apiUrl}/${id}/stock`, { enStock });
  }

  eliminar(id: number): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.apiUrl}/${id}`);
  }
}



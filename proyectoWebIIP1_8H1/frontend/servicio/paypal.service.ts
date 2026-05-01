import {Injectable, inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../enviroments/enviroment';

@Injectable ({
    providedIn: 'root'
})

export class PaypalService{
    private http = inject(HttpClient);
    private apiUrl = `${enviroment.apiUrl}/paypal`;

    crearOrden(payload:{items: any[]; total:number}){
        return this.http.post<{id:string; status:string}>(`${this.apiUrl}/crearOrden`, payload);
    }

    capturarOrden(orderId:string){
        return this.http.post<any>(`${this.apiUrl}/capturarOrden`, {orderId});
    }
}
import { Component, Input, inject, signal } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { CarritoService } from '../../services/carrito.service';
import { NgClass, CurrencyPipe, CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-producto-card',
  standalone: true,
  imports: [NgClass, CurrencyPipe, CommonModule, FormsModule],
  template: `
    <article class="tarjeta">
      <div class="img-container">
        <img [src]="item.imagenUrl" [alt]="item.nombre"/>
        <span class="categoria-badge">{{item.categoria}}</span>
      </div>
      
      <div class="contenido">
        <div class="cabecera">
          <h3>{{item.nombre}}</h3>
          <span class="precio">{{item.precio | currency:'MXN'}}</span>
        </div>
        
        <p class="desc">{{item.descripcion}}</p>
        
        <p [class]="item.enStock > 0 ? 'stock' : 'stock agotado'">
          <span class="dot"></span>
          {{ item.enStock > 0 ? 'En stock (' + item.enStock + ')' : 'Agotado' }}
        </p>

        <button 
          (click)="alAgregar()" 
          [disabled]="item.enStock <= 0"
          [ngClass]="{'btn-agregado': agregado(), 'btn-agotado': item.enStock <= 0}"
        >
          @if (agregado()) {
            ¡Agregado! 👍
          } @else if (item.enStock > 0) {
            Añadir al carrito
          } @else {
            Ya no hay
          }
        </button>

        @if (authService.user()?.rol === 'trabajador') {
          <div class="worker-controls">
            <input type="number" [(ngModel)]="newStock" min="0" placeholder="Stock">
            <button class="save-btn" (click)="updateStock()" [disabled]="isSavingStock">Guardar</button>
          </div>
        }
      </div>
    </article>
  `,
  styles: [`
    .tarjeta { 
      background: rgba(179, 99, 89, 0.15); 
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px; 
      overflow: hidden; 
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
      min-height: 480px;
      height: auto;
      color: white;
    }
    
    .tarjeta:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .img-container {
      position: relative;
      height: 200px;
      overflow: hidden;
    }
    
    img { 
      width: 100%; 
      height: 100%; 
      object-fit: cover; 
      transition: transform 0.5s ease;
    }
    
    .tarjeta:hover img {
      transform: scale(1.05);
    }
    
    .categoria-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.6);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      backdrop-filter: blur(5px);
    }
    
    .contenido { 
      padding: 1.5rem; 
      display: flex;
      flex-direction: column;
      gap: 12px; 
      flex-grow: 1;
      font-family: 'Roboto', sans-serif;  
    }
    
    .cabecera { 
      display: flex; 
      justify-content: space-between; 
      align-items: baseline;
      gap: 10px;
    }
    
    h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: bold;
    }
    
    .precio { 
      font-weight: bold; 
      color: #fff;
      font-size: 1.1rem;
      background: rgba(255,255,255,0.1);
      padding: 2px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }
    
    .desc { 
      font-size: 14px; 
      color: rgba(255,255,255,0.7); 
      margin: 0; 
      line-height: 1.4;
      flex-grow: 1;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .stock { 
      font-size: 13px; 
      font-weight: 600; 
      color: #00ff88; 
      margin: 0; 
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .dot {
      width: 8px;
      height: 8px;
      background-color: #00ff88;
      border-radius: 50%;
      display: inline-block;
    }
    
    .agotado { 
      color: #ff4d4d; 
    }
    
    .agotado .dot {
      background-color: #ff4d4d;
    }
    
    button { 
      background: linear-gradient(135deg, #831111 0%, #b36359 100%); 
      color: white; 
      border: none; 
      padding: 12px; 
      border-radius: 8px; 
      cursor: pointer; 
      font-weight: bold;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(131, 17, 17, 0.3);
      margin-top: auto;
    }
    
    button:hover:not(:disabled) { 
      transform: scale(1.02);
      box-shadow: 0 6px 20px rgba(131, 17, 17, 0.5);
      background: linear-gradient(135deg, #a51818 0%, #c97368 100%);
    }
    
    button:disabled { 
      background: rgba(255,255,255,0.1); 
      color: rgba(255,255,255,0.4);
      cursor: not-allowed; 
      box-shadow: none;
    }
    
    .btn-agregado {
      background: linear-gradient(135deg, #28a745 0%, #218838 100%) !important;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3) !important;
    }

    .btn-agotado {
      background: #555 !important;
      color: #999 !important;
      cursor: not-allowed !important;
      box-shadow: none !important;
    }

    .worker-controls {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }

    .worker-controls input {
      flex: 1;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.2);
      color: white;
      outline: none;
    }

    .save-btn {
      margin-top: 0;
      padding: 8px 12px;
      font-size: 14px;
    }
  `]
})
export class ProductoCard {
  @Input({ required: true }) item!: Producto;
  private carritoService = inject(CarritoService);
  authService = inject(AuthService);

  agregado = signal(false);
  newStock: number = 0;
  isSavingStock = false;

  ngOnInit() {
    this.newStock = this.item.enStock;
  }

  alAgregar() {
    this.item.enStock--;
    this.carritoService.agregar(this.item);
    this.agregado.set(true);
    setTimeout(() => this.agregado.set(false), 2000);
  }

  async updateStock() {
    this.isSavingStock = true;
    try {
      const res = await fetch(`http://localhost:3000/api/producto/${this.item.id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enStock: this.newStock })
      });
      if (res.ok) {
        this.item.enStock = this.newStock;
        alert('Stock actualizado');
      } else {
        alert('Error al actualizar stock');
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      this.isSavingStock = false;
    }
  }
}
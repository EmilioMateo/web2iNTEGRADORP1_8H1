import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Crear Cuenta</h2>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input type="text" id="username" formControlName="username" placeholder="Elige un usuario">
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" formControlName="password" placeholder="Crea una contraseña">
          </div>
          <div class="form-group">
            <label for="rol">Rol</label>
            <select id="rol" formControlName="rol">
              <option value="usuario">Usuario</option>
              <option value="trabajador">Trabajador</option>
            </select>
          </div>
          
          @if (errorMsg) {
            <div class="error">{{ errorMsg }}</div>
          }
          
          <button type="submit" [disabled]="registerForm.invalid || isLoading">
            {{ isLoading ? 'Cargando...' : 'Registrarse' }}
          </button>
        </form>
        <p class="switch-auth">
          ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      color: white;
      font-family: 'Roboto', sans-serif;
    }
    .auth-card {
      background: rgba(179, 99, 89, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
    }
    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
    }
    label {
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    input, select {
      padding: 0.8rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.2);
      color: white;
      outline: none;
    }
    select option {
      background: #333;
    }
    input:focus, select:focus {
      border-color: #b36359;
    }
    button {
      width: 100%;
      background: linear-gradient(135deg, #831111 0%, #b36359 100%);
      color: white;
      border: none;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      margin-top: 1rem;
      transition: all 0.3s ease;
    }
    button:hover:not(:disabled) {
      transform: scale(1.02);
    }
    button:disabled {
      background: rgba(255, 255, 255, 0.1);
      cursor: not-allowed;
    }
    .error {
      color: #ff4d4d;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      text-align: center;
    }
    .switch-auth {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.9rem;
    }
    .switch-auth a {
      color: #ffb3b3;
      text-decoration: none;
      font-weight: bold;
    }
    .switch-auth a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  registerForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    rol: ['usuario']
  });

  isLoading = false;
  errorMsg = '';

  async onSubmit() {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.errorMsg = '';
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.registerForm.value)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        this.router.navigate(['/login']);
      } else {
        this.errorMsg = data.error || 'Error al registrar';
      }
    } catch (e) {
      this.errorMsg = 'Error de conexión con el servidor';
    } finally {
      this.isLoading = false;
    }
  }
}

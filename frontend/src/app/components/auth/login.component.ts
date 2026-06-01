import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './auth-form.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notifications = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  loginForm = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMsg = '';
  submitted = false;
  invalidField: 'correo' | 'password' | null = null;

  private getErrorMessage(error: any): string {
    if (typeof error.error === 'string') {
      return error.error;
    }

    return error.error?.error || 'Error al iniciar sesion';
  }

  private markServerError(message: string): void {
    if (message.toLowerCase().includes('correo')) {
      this.invalidField = 'correo';
      this.loginForm.controls.correo.setErrors({ server: true });
      return;
    }

    if (message.toLowerCase().includes('contrasena')) {
      this.invalidField = 'password';
      this.loginForm.controls.password.setErrors({ server: true });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.invalidField = null;

    if (this.loginForm.invalid) {
      if (this.loginForm.controls.correo.hasError('email') && this.loginForm.controls.correo.value) {
        this.errorMsg = 'El formato del correo no es válido.';
      } else if (this.loginForm.controls.correo.hasError('required') || this.loginForm.controls.password.hasError('required')) {
        this.errorMsg = 'Todos los campos son obligatorios.';
      } else {
        this.errorMsg = 'Ingresa un correo válido y tu contraseña.';
      }
      this.loginForm.markAllAsTouched();
      this.invalidField = this.loginForm.controls.correo.invalid ? 'correo' : 'password';
      this.notifications.error(this.errorMsg);
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    this.authService.loginRequest(this.loginForm.getRawValue()).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: data => {
        this.authService.login(data);
        this.notifications.success('Inicio de sesion exitoso.');
        this.router.navigate([data.user.rol === 'admin' ? '/inventario' : '/Catalogo']);
      },
      error: error => {
        this.isLoading = false;
        this.errorMsg = this.getErrorMessage(error);
        this.notifications.error(this.errorMsg);
        this.markServerError(this.getErrorMessage(error));
        this.cdr.detectChanges();
      }
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './auth-form.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  registerForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    rol: this.fb.nonNullable.control<'usuario' | 'trabajador'>('usuario')
  });

  isLoading = false;
  errorMsg = '';

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    this.authService.registerRequest(this.registerForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/login']),
      error: error => {
        this.errorMsg = error.error?.error || 'Error al registrar';
        this.isLoading = false;
      },
      complete: () => (this.isLoading = false)
    });
  }
}



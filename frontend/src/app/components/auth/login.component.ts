import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMsg = '';

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    this.authService.loginRequest(this.loginForm.getRawValue()).subscribe({
      next: data => {
        this.authService.login(data);
        this.router.navigate(['/']);
      },
      error: error => {
        this.errorMsg = error.error?.error || 'Error al iniciar sesion';
        this.isLoading = false;
      },
      complete: () => (this.isLoading = false)
    });
  }
}


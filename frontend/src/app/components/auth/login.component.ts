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

  forgotPasswordForm = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]]
  });

  resetPasswordForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  });

  isLoading = false;
  isSendingCode = false;
  isResettingPassword = false;
  showForgotPasswordModal = false;
  resetStep: 'email' | 'code' = 'email';
  recoveryEmail = '';
  errorMsg = '';
  resetErrorMsg = '';
  resetSuccessMsg = '';
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

  openForgotPassword(): void {
    this.showForgotPasswordModal = true;
    this.resetStep = 'email';
    this.recoveryEmail = '';
    this.resetErrorMsg = '';
    this.resetSuccessMsg = '';
    this.forgotPasswordForm.reset();
    this.resetPasswordForm.reset();
  }

  closeForgotPassword(): void {
    this.showForgotPasswordModal = false;
    this.resetErrorMsg = '';
    this.resetSuccessMsg = '';
  }

  requestResetCode(): void {
    this.resetErrorMsg = '';
    this.resetSuccessMsg = '';

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      this.resetErrorMsg = this.forgotPasswordForm.controls.correo.hasError('email')
        ? 'El formato del correo no es valido.'
        : 'Ingresa el correo de tu cuenta.';
      this.notifications.error(this.resetErrorMsg);
      return;
    }

    this.isSendingCode = true;
    const payload = this.forgotPasswordForm.getRawValue();

    this.authService.forgotPasswordRequest(payload).pipe(
      finalize(() => {
        this.isSendingCode = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: response => {
        this.recoveryEmail = payload.correo;
        this.resetStep = 'code';
        this.resetSuccessMsg = response.message;
        this.notifications.success(response.message);
      },
      error: error => {
        this.resetErrorMsg = this.getErrorMessage(error);
        this.notifications.error(this.resetErrorMsg);
      }
    });
  }

  resetPassword(): void {
    this.resetErrorMsg = '';
    this.resetSuccessMsg = '';

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      if (this.resetPasswordForm.controls.code.hasError('pattern')) {
        this.resetErrorMsg = 'El codigo debe tener 6 digitos.';
      } else {
        this.resetErrorMsg = 'Completa el codigo y la nueva contrasena.';
      }
      this.notifications.error(this.resetErrorMsg);
      return;
    }

    const values = this.resetPasswordForm.getRawValue();

    if (values.password !== values.confirmPassword) {
      this.resetErrorMsg = 'Las contrasenas no coinciden.';
      this.notifications.error(this.resetErrorMsg);
      return;
    }

    this.isResettingPassword = true;

    this.authService.resetPasswordRequest({
      correo: this.recoveryEmail,
      code: values.code,
      password: values.password,
      confirmPassword: values.confirmPassword
    }).pipe(
      finalize(() => {
        this.isResettingPassword = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: response => {
        this.resetSuccessMsg = response.message;
        this.notifications.success(response.message);
        this.closeForgotPassword();
      },
      error: error => {
        this.resetErrorMsg = this.getErrorMessage(error);
        this.notifications.error(this.resetErrorMsg);
      }
    });
  }
}

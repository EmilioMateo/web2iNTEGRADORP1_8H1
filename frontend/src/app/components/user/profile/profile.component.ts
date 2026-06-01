import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notifications = inject(NotificationService);

  profile = signal(this.authService.user());
  correo = this.authService.user()?.correo || '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isSaving = false;

  constructor() {
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.correo = profile.correo;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar tu perfil.';
        this.notifications.error(this.errorMessage);
      }
    });
  }

  updateProfile(event: Event): void {
    event.preventDefault();
    this.errorMessage = '';
    this.successMessage = '';

    const normalizedCorreo = this.correo.trim();
    const wantsCorreoChange = normalizedCorreo !== this.profile()?.correo;
    const wantsPasswordChange = this.newPassword.length > 0 || this.confirmPassword.length > 0;

    if (!wantsCorreoChange && !wantsPasswordChange) {
      this.errorMessage = 'No hay cambios para guardar.';
      return;
    }

    if (!this.currentPassword) {
      this.errorMessage = 'Ingresa tu contrasena actual para confirmar los cambios.';
      return;
    }

    if (!this.isValidEmail(normalizedCorreo)) {
      this.errorMessage = 'Ingresa un correo valido.';
      return;
    }

    if (wantsPasswordChange && this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contrasenas no coinciden.';
      return;
    }

    this.isSaving = true;

    this.userService.updateProfile({
      correo: wantsCorreoChange ? normalizedCorreo : undefined,
      currentPassword: this.currentPassword,
      newPassword: wantsPasswordChange ? this.newPassword : undefined,
      confirmPassword: wantsPasswordChange ? this.confirmPassword : undefined
    }).subscribe({
      next: (response) => {
        this.profile.set(response.user);
        this.authService.updateUser(response.user);
        this.correo = response.user.correo;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.successMessage = response.message;
        this.notifications.success(response.message);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'No se pudo actualizar el perfil.';
        this.notifications.error(this.errorMessage);
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}

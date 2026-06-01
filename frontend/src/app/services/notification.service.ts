import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  id: number;
  message: string;
  type: NotificationType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSignal = signal<AppNotification | null>(null);
  notification = this.notificationSignal.asReadonly();

  show(message: string, type: NotificationType = 'info'): void {
    const id = Date.now();
    this.notificationSignal.set({ id, message, type });

    setTimeout(() => {
      if (this.notificationSignal()?.id === id) {
        this.notificationSignal.set(null);
      }
    }, 3500);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }
}

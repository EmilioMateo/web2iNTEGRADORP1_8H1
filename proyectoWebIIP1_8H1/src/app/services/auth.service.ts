import { Injectable, signal } from '@angular/core';

export interface User {
  id: number;
  username: string;
  rol: 'usuario' | 'trabajador';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<User | null>(null);

  constructor() {
    this.loadUserFromStorage();
  }

  get user() {
    return this.userSignal;
  }

  login(user: User) {
    this.userSignal.set(user);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  logout() {
    this.userSignal.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  private loadUserFromStorage() {
    if (typeof localStorage !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          this.userSignal.set(JSON.parse(userData));
        } catch (e) {
          console.error('Error parsing user data', e);
        }
      }
    }
  }
}

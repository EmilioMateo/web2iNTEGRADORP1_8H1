import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';
import { LoginCredentials, LoginResponse, RegisterPayload, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  private userSignal = signal<User | null>(null);

  constructor() {
    this.loadUserFromStorage();
  }

  get user() {
    return this.userSignal;
  }

  loginRequest(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  registerRequest(payload: RegisterPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, payload);
  }

  login(user: User): void {
    this.userSignal.set(user);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  logout(): void {
    this.userSignal.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  private loadUserFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const userData = localStorage.getItem('user');
    if (!userData) {
      return;
    }

    try {
      this.userSignal.set(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data', error);
      localStorage.removeItem('user');
    }
  }
}



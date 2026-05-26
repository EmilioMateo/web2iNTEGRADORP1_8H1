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
    this.loadSessionFromStorage();
  }

  get user() {
    return this.userSignal;
  }

  get token(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  loginRequest(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  registerRequest(payload: RegisterPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, payload);
  }

  login(session: LoginResponse): void {
    this.userSignal.set(session.user);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('token', session.token);
      localStorage.setItem('user', JSON.stringify(session.user));
    }
  }

  logout(): void {
    this.userSignal.set(null);

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  private loadSessionFromStorage(): void {
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
      this.logout();
    }
  }
}


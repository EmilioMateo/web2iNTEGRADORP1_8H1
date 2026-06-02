import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';
import { ForgotPasswordPayload, LoginCredentials, LoginResponse, RegisterPayload, ResetPasswordPayload, User } from '../models/user.model';

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

  forgotPasswordRequest(payload: ForgotPasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, payload);
  }

  resetPasswordRequest(payload: ResetPasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, payload);
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

  updateUser(user: User): void {
    this.userSignal.set(user);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
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
      const user = JSON.parse(userData);
      this.userSignal.set({
        ...user,
        correo: user.correo || user.username
      });
    } catch {
      this.logout();
    }
  }
}


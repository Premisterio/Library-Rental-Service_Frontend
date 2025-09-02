import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from './shared/error-handler.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    user: User;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.errorHandler.handleError('auth'))
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.errorHandler.handleError('auth'))
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    if (!response.data || !response.data.user) {
      console.error('No user data in response!');
      return;
    }
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    this.currentUser.set(response.data.user);
    this.isAuthenticated.set(true);
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user && user !== 'undefined' && user !== 'null') {
      try {
        this.currentUser.set(JSON.parse(user));
        this.isAuthenticated.set(true);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        this.logout();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

}
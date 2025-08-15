import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  access_token: string;
}

export interface LoginCredentials {
  cpf: string;
  password: string;
}

interface DecodedToken {
  sub: number;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/auth';
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly TOKEN_KEY = 'auth_token';

  readonly #decodedToken = signal<DecodedToken | null>(null);

  constructor() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.#decodedToken.set(jwtDecode(token));
    }
  }

  readonly isLoggedIn = computed(() => !!this.#decodedToken());
  readonly userRole = computed(() => this.#decodedToken()?.role);

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => this.setSession(response.access_token))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.#decodedToken.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(role: string): boolean {
    return this.userRole() === role;
  }

  private setSession(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.#decodedToken.set(jwtDecode(token));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
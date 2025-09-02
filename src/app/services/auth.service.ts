import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
}

export interface RegistrationData {
  token: string;
  cpf: string;
  name: string;
  email: string;
  phonenumber?: string;
  cep?: string;
  uf?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/auth';

  private http = inject(HttpClient);

  login(credentials: { cpf: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  register(registrationData: RegistrationData): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, registrationData);
  }
  
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  logout() {
    localStorage.clear();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getDecodedToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      this.logout();
      return null;
    }
  }

  handleLoginSuccess(token: string) {
  try {

    const payload: JwtPayload = jwtDecode(token);

    localStorage.setItem('auth_token', token);

    const userData = {
      id: payload.sub,
      email: payload.email,
      nome: payload.name,
      role: payload.role
    };

    localStorage.setItem('userData', JSON.stringify(userData));

  } catch (error) {
    console.error('Erro ao decodificar o token ou salvar os dados:', error);
  }
}
}

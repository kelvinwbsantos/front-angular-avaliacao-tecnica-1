// Caminho: src/app/core/auth/auth.service.ts (ou onde estiver seu AuthService)
// v2.0 - Adiciona gerenciamento de permissões

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import {
    RegistrationData, 
    JwtPayload,
    UserData
} from '../pages/users-page/models/users-models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/auth';
  // ASSUMINDO: Endpoint para buscar permissões do usuário logado
  private permissionsUrl = 'http://localhost:3000/users/me/permissions'; // <-- AJUSTE CONFORME SEU BACKEND

  private http = inject(HttpClient);

  // Armazena as permissões do usuário
  private userPermissions = new BehaviorSubject<Set<string>>(new Set());
  public userPermissions$ = this.userPermissions.asObservable(); // Observable para componentes

  constructor() {
    // Ao iniciar o serviço, tenta carregar permissões se já estiver logado
    this.loadUserPermissionsOnStartup();
  }

 

  login(credentials: { cpf: string; password: string }): Observable<any> {
    return this.http.post<{ access_token: string }>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => this.handleLoginSuccess(response.access_token)),
      // Após o login, busca as permissões
      switchMap(response => this.fetchAndStorePermissions())
    );
  }

  // register(registrationData: RegistrationData): Observable<any> { ... } // Mantenha se necessário

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  logout() {
    localStorage.clear();
    this.userPermissions.next(new Set()); // Limpa permissões
    // Redirecionar para login, etc.
  }

  isAuthenticated(): boolean {
    // Idealmente, verificar também a expiração do token
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

  // Método para componentes usarem e verificar permissão
  hasPermission(permission: string): boolean {
    return this.userPermissions.getValue().has(permission);
  }

  // Retorna a role principal (pode ser útil)
  getUserRole(): string | null {
      const decoded = this.getDecodedToken();
      return decoded?.role || null;
  }

  // Obtém os dados básicos do usuário do localStorage
  getUserData(): UserData | null {
      const data = localStorage.getItem('userData');
      try {
          return data ? JSON.parse(data) : null;
      } catch (e) {
          console.error("Erro ao parsear userData do localStorage", e);
          return null;
      }
  }

  // Chamado após o login bem-sucedido
  handleLoginSuccess(token: string) {
    try {
      const payload: JwtPayload = jwtDecode(token);
      localStorage.setItem('auth_token', token);
      const userData: UserData = {
        id: payload.sub,
        email: payload.email,
        nome: payload.name,
        role: payload.role
      };
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao decodificar token ou salvar dados:', error);
      localStorage.clear(); // Limpa se o token for inválido
    }
  }

   /**
   * MOCKADO: Busca e armazena as permissões.
   * Retorna um array fixo enquanto o backend não está pronto.
   */
  fetchAndStorePermissions(): Observable<string[]> {
    if (!this.isAuthenticated()) {
        return of([]);
    }

    console.warn("--- MODO MOCK ATIVADO PARA PERMISSÕES ---"); // Aviso

    // --- DEFINA AQUI AS PERMISSÕES MOCKADAS ---
    // Exemplo: Simulando um usuário ADMIN
    const mockPermissions: string[] = [
        "READ_USERS",
        "INVITE_USER",
        "CREATE_USER",
        "EDIT_USER_PROFILE",
        "ASSIGN_USER_ROLES",
        "DELETE_USER",
        "EXPORT_USERS",
        "READ_CERTIFICATIONS",
        "MANAGE_CERTIFICATIONS"
        // Adicione/remova conforme necessário para testar diferentes roles
    ];
    // ------------------------------------------

    // Simula a resposta da API com 'of()'
    return of(mockPermissions).pipe(
        tap(permissions => {
            console.log("Permissões MOCKADAS carregadas:", permissions);
            this.userPermissions.next(new Set(permissions));
        })
        // Não precisamos de catchError para o mock
    );

    /* --- CÓDIGO ORIGINAL (COMENTADO) ---
    console.log("Buscando permissões de:", this.permissionsUrl);
    return this.http.get<string[]>(this.permissionsUrl).pipe(
      tap(permissions => {
        console.log("Permissões recebidas:", permissions);
        this.userPermissions.next(new Set(permissions));
      }),
      catchError(error => {
        console.error('Erro ao buscar permissões:', error);
        this.userPermissions.next(new Set());
        return of([]);
      })
    );
    */
  }

  // Tenta carregar permissões se um token válido existir ao iniciar
  private loadUserPermissionsOnStartup(): void {
    if (this.isAuthenticated()) {
      this.fetchAndStorePermissions().subscribe();
    }
  }

  /**
   * Registra um novo usuário no sistema.
   * Usado geralmente após um fluxo de convite ou auto-registro.
   * @param registrationData Dados necessários para o registro.
   * @returns Observable com a resposta do backend (pode ser o usuário criado ou uma mensagem).
   */
  register(registrationData: RegistrationData): Observable<any> {
    // Assume que a rota de registro está em /auth/register
    const url = `${this.baseUrl}/register`;
    console.log(`[AuthService] register Chamando: ${url}`);
    return this.http.post(url, registrationData);
  }
}
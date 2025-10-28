// Caminho: src/app/core/services/auth.service.ts
// v3.0 - Mesclado: Signals + Lógica de Permissões + Register

import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core'; // Adicionado WritableSignal
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, of } from 'rxjs'; // Import 'of'
import { tap, catchError, switchMap, map } from 'rxjs/operators';

// Importa TODAS as interfaces necessárias do local centralizado
import {
    RegistrationData,
    JwtPayload, // Usar JwtPayload como nome padrão
    UserData // Manter UserData se o Header/outros componentes a usarem
} from '../../pages/users-page/models/users.models';

// Interface para a resposta do Login
export interface LoginResponse {
  access_token: string;
}

// Interface para as credenciais de Login
export interface LoginCredentials {
  cpf: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/auth';
  private permissionsUrl = 'http://localhost:3000/users/me/permissions'; // Endpoint de permissões
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly TOKEN_KEY = 'auth_token';

  // --- Signals para Estado ---
  // Signal privado para o token decodificado
  readonly #decodedToken: WritableSignal<JwtPayload | null> = signal(null);
  // Signal privado para as permissões
  readonly #userPermissions: WritableSignal<Set<string>> = signal(new Set());

  constructor() {
    // Tenta carregar token e permissões ao iniciar
    this.loadTokenFromStorage();
    if (this.isLoggedIn()) {
        this.loadUserPermissionsOnStartup();
    }
  }

  // --- Computed Signals Públicos ---
  readonly isLoggedIn = computed(() => !!this.#decodedToken());
  readonly userRole = computed(() => this.#decodedToken()?.role);
  readonly userEmail = computed(() => this.#decodedToken()?.email);
  readonly userName = computed(() => this.#decodedToken()?.name);
  readonly userId = computed(() => this.#decodedToken()?.sub); // ID do usuário

  // --- Métodos de Autenticação ---

 login(credentials: LoginCredentials): Observable<LoginResponse> {
    // Armazena a resposta original do login
    let loginResponse: LoginResponse;

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap({
          next: response => {
              loginResponse = response; // <-- Salva a resposta aqui
              this.setSession(response.access_token);
          }
      }),
      // Busca permissões (o valor emitido aqui é string[])
      switchMap(() => this.fetchAndStorePermissions()),
      // CORREÇÃO: Usa 'map' para retornar a resposta ORIGINAL do login
      map(() => loginResponse) // <-- Retorna o objeto { access_token: '...' }
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.#decodedToken.set(null); // Limpa signal do token
    this.#userPermissions.set(new Set()); // Limpa signal de permissões
    // Opcional: Limpar outros dados relacionados ao usuário se houver
    // localStorage.removeItem('userData'); // Remover se não for mais usado
    this.router.navigate(['/login']);
  }

  /**
   * Registra um novo usuário.
   */
  register(registrationData: RegistrationData): Observable<any> {
    const url = `${this.baseUrl}/register`;
    console.log(`[AuthService] register Chamando: ${url}`);
    return this.http.post(url, registrationData);
  }

  // --- Métodos de Token e Sessão ---

  private setSession(token: string): void {
    try {
        localStorage.setItem(this.TOKEN_KEY, token);
        const decoded = jwtDecode<JwtPayload>(token);
        this.#decodedToken.set(decoded);
        // Não precisamos mais salvar 'userData' separadamente no localStorage
        // Os computed signals derivam diretamente do #decodedToken
    } catch (error) {
        console.error("Erro ao decodificar ou salvar token:", error);
        this.logout(); // Desloga se o token for inválido
    }
  }

  private loadTokenFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
        try {
            // TODO: Adicionar verificação de expiração do token aqui
            const decoded = jwtDecode<JwtPayload>(token);
            this.#decodedToken.set(decoded);
        } catch (error) {
            console.error("Token armazenado inválido:", error);
            this.logout(); // Limpa token inválido
        }
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // --- Métodos de Permissão e Role ---

  /**
   * Verifica se o usuário possui uma role específica (Use com moderação).
   * Prefira hasPermission sempre que possível.
   */
  hasRole(role: string): boolean {
    // Compara case-insensitive por segurança
    return this.userRole()?.toLowerCase() === role.toLowerCase();
  }

  /**
   * Verifica se o usuário possui uma permissão específica.
   * Este é o método principal para controle de acesso no template e guardas.
   */
  hasPermission(permission: string): boolean {
    const hasPerm = this.#userPermissions().has(permission);
    // console.log(`Verificando permissão '${permission}': ${hasPerm}`); // Log para depurar
    return hasPerm;
  }

  /**
   * MOCKADO: Busca e armazena as permissões no signal #userPermissions.
   */
  fetchAndStorePermissions(): Observable<string[]> {
    if (!this.isLoggedIn()) { // Usa o computed signal
        this.#userPermissions.set(new Set()); // Garante limpeza se não logado
        return of([]);
    }

    console.warn("--- MODO MOCK ATIVADO PARA PERMISSÕES ---");

    const mockPermissions: string[] = [
        "READ_USERS", "INVITE_USER", "CREATE_USER", "EDIT_USER_PROFILE",
        "ASSIGN_USER_ROLES", "DELETE_USER", "EXPORT_USERS",
        "READ_CERTIFICATIONS", "MANAGE_CERTIFICATIONS", "VIEW_DASHBOARD" // Adicionada permissão do dashboard
        // Ajuste conforme roles (Admin, RH, Mentor)
    ];

    return of(mockPermissions).pipe(
        tap({
            next: permissions => {
                console.log("Permissões MOCKADAS carregadas:", permissions);
                this.#userPermissions.set(new Set(permissions));
            }
        })
    );

    /* --- CÓDIGO REAL (COMENTADO) ---
    console.log("Buscando permissões de:", this.permissionsUrl);
    return this.http.get<string[]>(this.permissionsUrl).pipe(
      tap(permissions => {
        console.log("Permissões recebidas:", permissions);
        this.#userPermissions.set(new Set(permissions)); // Atualiza o signal
      }),
      catchError(error => {
        console.error('Erro ao buscar permissões:', error);
        this.#userPermissions.set(new Set()); // Limpa signal em caso de erro
        // Considerar deslogar? this.logout();
        return of([]);
      })
    );
    */
  }

  /**
   * Carrega permissões se logado ao iniciar o app.
   */
  private loadUserPermissionsOnStartup(): void {
    // A chamada já está no construtor após loadTokenFromStorage
    // if (this.isLoggedIn()) {
    //   this.fetchAndStorePermissions().subscribe();
    // }
  }

   // Opcional: Método para obter dados básicos se necessário em algum lugar
   // (Mas prefira usar os computed signals diretamente)
   getUserData(): UserData | null {
       const decoded = this.#decodedToken();
       if (!decoded) return null;
       return {
           id: decoded.sub,
           email: decoded.email,
           nome: decoded.name,
           role: decoded.role
       };
   }
}
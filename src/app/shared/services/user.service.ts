// Caminho: src/app/core/services/user.service.ts ou similar
// v1.5 - Removendo TODOS os HttpParams do findAllUsers

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  UserApiParams,
  UserApiResponse,
  User,
  FullUserResponse
} from '../models/users.models'; // Ajuste o caminho se necessário

// --- CONFIGURAÇÃO DA API  ---
const API_URL = 'http://localhost:3000'; 
const ADMIN_USERS_PATH = `${API_URL}/admin/users`; // Rota da Coleção (plural)
const ADMIN_USER_PATH = `${API_URL}/admin/user`;   // Rota do Item (singular)


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  /**
   * Busca usuários com paginação e filtros.
   * Rota: GET /admin/users
   */
  findAllUsers(params: UserApiParams): Observable<UserApiResponse> {
    
    const url = ADMIN_USERS_PATH;

    // ************ CORREÇÃO AQUI ************
    // Removendo todos os HttpParams para imitar o Postman
    
    console.log(`[UserService] findAllUsers (TESTE SEM PARAMS) Chamando: ${url}`);
    
    // Chamada "pura", sem { params: ... }
    return this.http.get<UserApiResponse>(url);
    // ***************************************
  }

  /**
   * Busca os detalhes completos de um usuário pelo ID.
   * Rota: GET /admin/user/:id
   */
  findById(userId: string): Observable<FullUserResponse> {
    const url = `${ADMIN_USER_PATH}/${userId}`; 
    console.log(`[UserService] findById Chamando: ${url}`);
    return this.http.get<FullUserResponse>(url);
  }

  /**
   * Exporta a lista de usuários (filtrada) para um arquivo Excel (Blob).
   * Rota: GET /admin/users/exportXlsx
   */
  exportUsers(filters: { name?: string, email?: string, cpf?: string }): Observable<Blob> {
    const url = `${ADMIN_USERS_PATH}/exportXlsx`; 
    let httpParams = new HttpParams();

    // ... (filtros) ...

    console.log(`[UserService] exportUsers Chamando: ${url} com params:`, httpParams.toString());
    return this.http.get(url, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Atualiza a role de um usuário específico.
   * Rota: PATCH /admin/user/:id/role
   */
  updateUserRole(userId: string, roleName: string): Observable<User> {
    const url = `${ADMIN_USER_PATH}/${userId}/role`; 
    const payload = { roleName }; 
    console.log(`[UserService] updateUserRole Chamando: ${url} com payload:`, payload);
    return this.http.patch<User>(url, payload);
  }
}
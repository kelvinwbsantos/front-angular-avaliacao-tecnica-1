// Caminho: src/app/core/services/user.service.ts ou similar
// v1.2 - Serviço completo com URLs corrigidas e findById(number)

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  UserApiParams,
  UserApiResponse,
  User,
  FullUserResponse
} from '../models/users-models';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  // URL base correta conforme seu AdminController
  private baseUrl = 'http://localhost:3000/admin';
  private http = inject(HttpClient);

  /**
   * Busca usuários com paginação e filtros.
   * @param params Objeto contendo page, limit e filtros opcionais (name, email, cpf).
   * Filtros vazios/nulos devem ser tratados como `undefined` ANTES de chamar este método.
   * @returns Observable com a lista paginada de usuários.
   */
  findAllUsers(params: UserApiParams): Observable<UserApiResponse> {
   const url = `${this.baseUrl}/users`;

    // TESTE: Hardcoded strings
    let httpParams = new HttpParams()
        .set('page', '1') // String diretamente
        .set('limit', '10'); // String diretamente

    // Mantenha os filtros comentados por enquanto
    // if (params.name) { ... }
    // if (params.email) { ... }
    // if (params.cpf) { ... }

    console.log(`[UserService] findAllUsers (TESTE HARDCODED) Chamando: ${url} com params:`, httpParams.toString());
    return this.http.get<UserApiResponse>(url, { params: httpParams });
   
    // const url = `${this.baseUrl}/users`; // Rota GET /admin/users

    // let httpParams = new HttpParams()
    //   .set('page', params.page.toString())
    //   .set('limit', params.limit.toString());

    // // Adiciona filtros apenas se eles tiverem um valor (não nulo/undefined)
    // // A conversão de '' para undefined deve ser feita no COMPONENTE
    // if (params.name) {
    //   httpParams = httpParams.set('name', params.name);
    // }
    // if (params.email) {
    //   httpParams = httpParams.set('email', params.email);
    // }
    // if (params.cpf) {
    //   httpParams = httpParams.set('cpf', params.cpf);
    // }

    // console.log(`[UserService] findAllUsers Chamando: ${url} com params:`, httpParams.toString());
    // return this.http.get<UserApiResponse>(url, { params: httpParams });
  }

  /**
   * Busca os detalhes completos de um usuário pelo ID.
   * @param userId O ID numérico do usuário.
   * @returns Observable com os dados completos do usuário.
   */
  findById(userId: string): Observable<FullUserResponse> {
    const url = `${this.baseUrl}/user/${userId}`; // Rota GET /admin/user/:id
    console.log(`[UserService] findById Chamando: ${url}`);
    return this.http.get<FullUserResponse>(url);
  }

  /**
   * Exporta a lista de usuários (filtrada) para um arquivo Excel (Blob).
   * @param filters Filtros opcionais (name, email, cpf). Enviar undefined se vazios.
   * @returns Observable contendo o Blob do arquivo Excel.
   */
  exportUsers(filters: { name?: string, email?: string, cpf?: string }): Observable<Blob> {
    const url = `${this.baseUrl}/users/exportXlsx`; // Rota GET /admin/users/exportXlsx
    let httpParams = new HttpParams();

    // if (filters.name) httpParams = httpParams.set('name', filters.name);
    // if (filters.email) httpParams = httpParams.set('email', filters.email);
    // if (filters.cpf) httpParams = httpParams.set('cpf', filters.cpf);

    console.log(`[UserService] exportUsers Chamando: ${url} com params:`, httpParams.toString());
    return this.http.get(url, {
      params: httpParams,
      responseType: 'blob' // Essencial para receber o arquivo
    });
  }

  /**
   * Atualiza a role de um usuário específico.
   * @param userId O ID numérico do usuário.
   * @param roleName O nome da nova role a ser atribuída.
   * @returns Observable com os dados básicos do usuário atualizado.
   */
  updateUserRole(userId: number, roleName: string): Observable<User> {
    const url = `${this.baseUrl}/user/${userId}/role`; // Rota PATCH /admin/user/:id/role
    const payload = { roleName }; // Corpo da requisição conforme AdminController
    console.log(`[UserService] updateUserRole Chamando: ${url} com payload:`, payload);
    return this.http.patch<User>(url, payload);
  }

  // Você pode adicionar aqui métodos para criar (invite), atualizar perfil, deletar, etc.
  // Exemplo (precisaria da rota no backend):
  // deleteUser(userId: number): Observable<void> {
  //   const url = `${this.baseUrl}/user/${userId}`; // Ex: DELETE /admin/user/:id
  //   return this.http.delete<void>(url);
  // }
}
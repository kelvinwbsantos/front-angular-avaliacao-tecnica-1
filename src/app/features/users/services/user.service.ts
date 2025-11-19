// Caminho: src/app/core/services/user.service.ts ou similar
// v1.5 - Removendo TODOS os HttpParams do findAllUsers

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, forkJoin, tap, catchError, of } from 'rxjs';
import {
  UserApiParams,
  UserApiResponse,
  User,
  FullUserResponse
} from '../../shared/models/users.models';
import { environment } from '../../../environments/environment';
//FACADE SERVICES
import { Exam } from '../../shared/models/exam.model';
import { Certificate } from '../../shared/models/certificate.model';
import { ExamService } from '../../certifications/services/exam.service';
import { CertificateService } from '../../certifications/services/certificate.service';



@Injectable({
  providedIn: 'root'
})
export class UserService {
    // --- CONFIGURAÇÃO DA API  ---
  private readonly API_URL = environment.apiUrl;
  // --- DEFINIÇÃO DE ROTAS HÍBRIDAS ---
  // 1. Rota para LISTAGEM (AdminController no backend)
  private readonly LIST_PATH = `${this.API_URL}/admin/users`; 
  // 2. Rota UsersController para AÇÕES DE UM ITEM
  private readonly ITEM_PATH = `${this.API_URL}/users`; 
  
  private http = inject(HttpClient);
  private examService = inject(ExamService);
  private certificateService = inject(CertificateService);
  
  /**
   * Busca os detalhes completos de um usuário pelo ID.
   * Rota: GET /admin/user/:id
   */
  findById(userId: string): Observable<FullUserResponse> {
    const url = `${this.ITEM_PATH}/${userId}`; 
    console.log(`[UserService] findById Chamando: ${url}`);
    return this.http.get<FullUserResponse>(url);
  }

  /**
   * GET /admin/user/{id}
   * Usa a rota SINGULAR
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.ITEM_PATH}/${id}`);
  }

  /**
   * Exporta a lista de usuários (filtrada) para um arquivo Excel (Blob).
   * Rota: GET /admin/users/exportXlsx
   */
  exportUsers(filters: { name?: string, email?: string, cpf?: string }): Observable<Blob> {
    const url = `${this.LIST_PATH}/exportXlsx`; 
    let httpParams = new HttpParams();

    // ... (filtros) ...

    console.log(`[UserService] exportUsers Chamando: ${url} com params:`, httpParams.toString());
    return this.http.get(url, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Atualiza usuário existente
   * PATCH /admin/user/{id}
   * Usa a rota SINGULAR
   */
  updateUser(id: number, payload: any): Observable<User> {
    return this.http.patch<User>(`${this.ITEM_PATH}/${id}`, payload);
  }

  /**
   * Cria novo usuário
   * POST /admin/users (Geralmente cria-se na coleção)
   */
  createUser(payload: any): Observable<User> {
    return this.http.post<User>(this.ITEM_PATH, payload);
  }

  /**
   * Busca usuários paginados (Lista)
   * Usa a rota PLURAL: /admin/users
   */
  findAllUsers(filters: any): Observable<any> {
    let params = new HttpParams()
        .set('page', filters.page.toString())
        .set('limit', filters.limit.toString());

    if (filters.name) params = params.set('name', filters.name);
    if (filters.email) params = params.set('email', filters.email);
    if (filters.cpf) params = params.set('cpf', filters.cpf);

    return this.http.get<any>(this.LIST_PATH, { params });
  }

  /**
   * Atualiza a role de um usuário específico.
   * Rota: PATCH /admin/user/:id/role
   */
  updateUserRole(userId: string, roleName: string): Observable<User> {
    const url = `${this.ITEM_PATH}/${userId}/role`; 
    const payload = { roleName }; 
    console.log(`[UserService] updateUserRole Chamando: ${url} com payload:`, payload);
    return this.http.patch<User>(url, payload);
  }

  /**
   * Exclui usuário
   * DELETE /admin/user/{id}
   * Usa a rota SINGULAR
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.ITEM_PATH}/${id}`);
  }
  
  /**
   * MÉTODO "FACHADA" (Facade)
   * Orquestra múltiplas chamadas para montar os dados da
   * página de "Conquistas".
   * CORRIGIDO PARA SER "ANTI-FRÁGIL"
   * O fork join quebra se qualquer um quebrar, então retornamos 
   * vazio para a aplicação prosseguir
   * 
   */
  getUserAchievementsData(): Observable<{ certificates: Certificate[], exams: Exam[] }> {
    
    console.log('[UserService] Fachada: Buscando dados de Conquistas...');

    // 1. Prepara a chamada de Certificados (com seu próprio 'catchError')
    const certificates$ = this.certificateService.getUserCertificates().pipe(
      catchError(err => {
        console.error("Falha ao buscar certificados (na Fachada):", err);
        return of([]); // <-- Em vez de falhar, retorna um array vazio.
      })
    );
    
    // 2. Prepara a chamada de Exames (com seu próprio 'catchError')
    const exams$ = this.examService.getUserExams().pipe(
      catchError(err => {
        console.error("Falha ao buscar exames (na Fachada):", err);
        return of([]); // <-- Em vez de falhar, retorna um array vazio.
      })
    );

    // 3. O forkJoin agora não vai falhar.
    //    Na pior das hipóteses, ele retorna { certificates: [], exams: [] }
    return forkJoin({
      certificates: certificates$,
      exams: exams$
    }).pipe(
      tap(results => {
        // Log para vermos o que o forkJoin montou
        console.log('[UserService] Fachada: forkJoin concluído.', results);
      })
    );
  }

}
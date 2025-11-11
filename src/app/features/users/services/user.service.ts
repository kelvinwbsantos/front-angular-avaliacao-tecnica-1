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

//FACADE SERVICES
import { Exam } from '../../shared/models/exam.model';
import { Certificate } from '../../shared/models/certificate.model';
import { ExamService } from '../../certifications/services/exam.service';
import { CertificateService } from '../../certifications/services/certificate.service';

// --- CONFIGURAÇÃO DA API  ---
const API_URL = 'http://localhost:3000'; 
const ADMIN_USERS_PATH = `${API_URL}/admin/users`; // Rota da Coleção (plural)
const ADMIN_USER_PATH = `${API_URL}/admin/user`;   // Rota do Item (singular)


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private examService = inject(ExamService);
  private certificateService = inject(CertificateService);

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
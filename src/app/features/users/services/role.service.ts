// Assumindo que você está em src/app/core/services/role.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Você deve garantir que os modelos acima (Role, Permission, etc.) sejam importáveis
import { Role, Permission, CreateRoleDTO, UpdateRoleDTO } from '../../shared/models/role.model'; 

// Configuração da API (Adapte o caminho do environment se necessário)
import { environment } from '../../../environments/environment';
const BASE_PATH = `${environment.apiUrl}/roles`;

@Injectable({ providedIn: 'root' })
export class RoleService {
    private http = inject(HttpClient);

    // --- MÉTODOS DE BUSCA ---
    getRoleByName(name: string): Observable<Role> {
        // Assumindo que o backend tem um endpoint para buscar por nome (ex: /roles/name/Administrador)
        // Se a rota for apenas uma query param, use: `${BASE_PATH}?name=${name}`
        return this.http.get<Role>(`${BASE_PATH}/name/${name}`);
    }
    /**
     * Busca todas as funções ativas (Para uso no MatSelect).
     * Rota: GET /roles
     */
    findAllActiveRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(BASE_PATH);
    }
    
    /**
     * Busca todas as Permissões disponíveis (Para o CRUD de Role).
     * Rota: GET /permissions
     */
    findAllPermissions(): Observable<Permission[]> {
        const PERMISSION_PATH = `${environment.apiUrl}/permissions`;
        return this.http.get<Permission[]>(PERMISSION_PATH);
    }
    
    // --- MÉTODOS CRUD ---

    /**
     * Cria uma nova função.
     * Rota: POST /roles
     */
   createRole(payload: CreateRoleDTO): Observable<Role> {
        // Usa a rota específica que você identificou
        return this.http.post<Role>(`${BASE_PATH}/create`, payload);
    }

    /**
     * Atualiza uma função existente.
     * Rota: PATCH /roles/{id}
     */
    updateRole(id: number, payload: UpdateRoleDTO): Observable<Role> {
        // Mudança de PATCH para PUT
        return this.http.put<Role>(`${BASE_PATH}/${id}`, payload);
    }

    getRoleById(id: number): Observable<Role> {
        return this.http.get<Role>(`${BASE_PATH}/${id}`);
    }
    /**
     * Exclui uma função.
     * Rota: DELETE /roles/{id}
     */
    deleteRole(id: number): Observable<void> {
        return this.http.delete<void>(`${BASE_PATH}/${id}`);
    }
}
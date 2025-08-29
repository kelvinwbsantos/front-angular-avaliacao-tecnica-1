import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface UserApiParams {
  page: number;
  limit: number;
  name?: string | null;
  email?: string | null;
  cpf?: string | null;
}

export interface UserApiResponse {
  data: User[];
  total: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  role: string;
}

export interface FullUserResponse {
  id: number;
  name: string;
  email: string;
  cpf: string
  phonenumber: string;
  cep: string;
  uf: string;
  city: string;
  neighborhood: string;
  street: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:3000/admin';
  private http = inject(HttpClient);

  findAllUsers(params: UserApiParams): Observable<UserApiResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.name) {
      httpParams = httpParams.set('name', params.name);
    }
    if (params.email) {
      httpParams = httpParams.set('email', params.email);
    }
    if (params.cpf) {
      httpParams = httpParams.set('cpf', params.cpf);
    }

    return this.http.get<UserApiResponse>(`${this.baseUrl}/users`, { params: httpParams });
  }

  findById(userId: string): Observable<FullUserResponse> {
    return this.http.get<FullUserResponse>(`${this.baseUrl}/user/${userId}`);
  }

  exportUsers(filters: { name?: string, email?: string, cpf?: string }): Observable<Blob> {
    let params = new HttpParams();
    if (filters.name) params = params.set('name', filters.name);
    if (filters.email) params = params.set('email', filters.email);
    if (filters.cpf) params = params.set('cpf', filters.cpf);

    return this.http.get(`${this.baseUrl}/users/exportXlsx`, { 
      params,
      responseType: 'blob'
    });
  }

  updateUserRole(userId: number, roleName: string): Observable<User> {
    const payload = { roleName };
    return this.http.patch<User>(`${this.baseUrl}/user/${userId}/role`, payload);
  }
}

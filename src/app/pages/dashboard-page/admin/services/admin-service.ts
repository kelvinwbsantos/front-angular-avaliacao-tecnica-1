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
}

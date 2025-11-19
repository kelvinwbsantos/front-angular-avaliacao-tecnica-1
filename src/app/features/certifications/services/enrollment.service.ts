// src/app/core/services/enrollment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enrollment } from '../../shared/models/enrollment.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly API_URL = environment.apiUrl;
  private readonly BASE_PATH = `${this.API_URL}/enrollments`;
  private http = inject(HttpClient);
  
  constructor() { }

  /**
   * (GET /enrollments)
   * Busca todas as matrículas do usuário logado.
   * A API deve filtrar pelo usuário autenticado.
   */
  getUserEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.BASE_PATH);
  }

  /**
   * (POST /enrollments)
   * Cria uma nova matrícula para o usuário na certificação.
   */
  createEnrollment(payload: { certificationId: string }): Observable<Enrollment> {
    return this.http.post<Enrollment>(this.BASE_PATH, payload);
  }

  /**
   * (DELETE /enrollments/{id})
   * Cancela/exclui uma matrícula existente.
   */
  deleteEnrollment(enrollmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_PATH}/${enrollmentId}`);
  }
}
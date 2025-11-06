// src/app/core/services/enrollment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enrollment } from '../../shared/models/enrollment.model';
const API_URL = 'http://localhost:3000'; // Ou a porta que sua API usa
const BASE_PATH = `${API_URL}/enrollments`;
@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {

  private http = inject(HttpClient);
  

  constructor() { }

  /**
   * (GET /enrollments)
   * Busca todas as matrículas do usuário logado.
   * A API deve filtrar pelo usuário autenticado.
   */
  getUserEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(BASE_PATH);
  }

  /**
   * (POST /enrollments)
   * Cria uma nova matrícula para o usuário na certificação.
   */
  createEnrollment(payload: { certificationId: string }): Observable<Enrollment> {
    return this.http.post<Enrollment>(BASE_PATH, payload);
  }

  /**
   * (DELETE /enrollments/{id})
   * Cancela/exclui uma matrícula existente.
   */
  deleteEnrollment(enrollmentId: string): Observable<void> {
    return this.http.delete<void>(`${BASE_PATH}/${enrollmentId}`);
  }
}
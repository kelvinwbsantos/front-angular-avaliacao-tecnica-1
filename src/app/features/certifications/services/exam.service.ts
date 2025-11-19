// src/app/core/services/exam.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { 
  Exam, 
  AnswerPayload, 
  ExamQuestionsResponse,
  ExamResult 
} from '../../shared/models/exam.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private readonly API_URL = environment.apiUrl;
  private readonly BASE_PATH = `${this.API_URL}/exams`;

  private http = inject(HttpClient);

  /**
   * (GET /exams)
   * Lista todos os exames do usuário.
   */
  getUserExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(this.BASE_PATH);
  }

  /**
   * (POST /exams)
   * Inicia um novo exame para uma matrícula.
   * Assume que enviamos o enrollmentId.
   */
  startExam(enrollmentId: string): Observable<Exam> {
    // Confirme o payload que o backend espera.
    // Estou assumindo que é { "enrollmentId": "uuid" }
    return this.http.post<Exam>(this.BASE_PATH, { enrollmentId });
  }

  /**
   * (GET /exams/{id}/questions)
   * Obtém as questões para um exame em andamento.
   */
  getExamQuestions(examId: string): Observable<ExamQuestionsResponse> {
    return this.http.get<ExamQuestionsResponse>(`${this.BASE_PATH}/${examId}/questions`);
  }

  /**
   * (POST /exams/{id}/submit)
   * Envia as respostas do exame para correção.
   */
  submitExam(examId: string, payload: AnswerPayload): Observable<any> { 
    return this.http.post<any>(`${this.BASE_PATH}/${examId}/submit`, payload);
  }
  /**
   * (GET /exams/{id}/result)
   * Obtém o resultado de um exame finalizado.
   */
  getExamResult(examId: string): Observable<ExamResult> {
    return this.http.get<ExamResult>(`${this.BASE_PATH}/${examId}/result`);
  }

  // A lógica 'findInProgressExam' está no componente.
}
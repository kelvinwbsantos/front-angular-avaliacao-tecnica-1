// src/app/core/services/exam.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { 
  Exam, 
  AnswerPayload, 
  ExamQuestionsResponse 
} from '../models/exam.model';

// Configuração da API
const API_URL = 'http://localhost:3000'; // Ajuste sua URL
const BASE_PATH = `${API_URL}/exams`;

@Injectable({
  providedIn: 'root'
})
export class ExamService {

  private http = inject(HttpClient);

  /**
   * (GET /exams)
   * Lista todos os exames do usuário.
   */
  getUserExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(BASE_PATH);
  }

  /**
   * (POST /exams)
   * Inicia um novo exame para uma matrícula.
   * Assume que enviamos o enrollmentId.
   */
  startExam(enrollmentId: string): Observable<Exam> {
    // Confirme o payload que o backend espera.
    // Estou assumindo que é { "enrollmentId": "uuid" }
    return this.http.post<Exam>(BASE_PATH, { enrollmentId });
  }

  /**
   * (GET /exams/{id}/questions)
   * Obtém as questões para um exame em andamento.
   */
  getExamQuestions(examId: string): Observable<ExamQuestionsResponse> {
    return this.http.get<ExamQuestionsResponse>(`${BASE_PATH}/${examId}/questions`);
  }

  /**
   * (POST /exams/{id}/submit)
   * Envia as respostas do exame para correção.
   */
  submitExam(examId: string, payload: AnswerPayload): Observable<any> { 
    return this.http.post<any>(`${BASE_PATH}/${examId}/submit`, payload);
  }

  // NOTE: O 'findInProgressExam' foi REMOVIDO
  // A lógica dele agora vai para o componente.
}
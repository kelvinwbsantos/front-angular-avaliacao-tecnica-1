// Caminho: src/app/pages/questions/services/questions.service.ts
// (NOVO ARQUIVO)

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
    BackendQuestion,
    QuestionFilterDTO, 
    PaginatedTfQuestionsResponse
} from '../models/question-models'; 

// Configuração da API (Ajuste a URL base)
const API_URL = 'http://localhost:3000'; 
const BASE_PATH = `${API_URL}/questions`; // Rota base de questões

@Injectable({
    providedIn: 'root'
})
export class QuestionsService {
    private http = inject(HttpClient);
    
    /**
     * Busca de questões com filtros e paginação (GET /questions)
     */
    findAllQuestions(filters: QuestionFilterDTO): Observable<PaginatedTfQuestionsResponse> {
        let params = new HttpParams()
            .set('page', filters.page.toString())
            .set('limit', filters.limit.toString());
            
        if (filters.questionText) {
            params = params.set('questionText', filters.questionText);
        }
        if (filters.isActive !== null && filters.isActive !== undefined) {
            params = params.set('isActive', filters.isActive.toString());
        }
        if (filters.certificationId) {
             params = params.set('certificationId', filters.certificationId);
        }
        // TODO: Adicionar filtros de data (validUntilStart, validUntilEnd)
        if (filters.validUntilEnd) {
            params = params.set('onlyValid', filters.validUntilEnd.toString());
        }
        
        return this.http.get<PaginatedTfQuestionsResponse>(BASE_PATH, { params });
    }

    /**
     * Apaga uma questão (DELETE /questions/{id})
     */
    deleteQuestion(id: string): Observable<void> {
        return this.http.delete<void>(`${BASE_PATH}/${id}`);
    }
/**
     * (NOVO) Cria uma nova questão V/F (POST /questions)
     * O DTO exato pode precisar de ajuste (ex: CreateQuestionDto)
     */
    createQuestion(payload: Partial<BackendQuestion>): Observable<BackendQuestion> {
        return this.http.post<BackendQuestion>(BASE_PATH, payload);
    }

    /**
     * (NOVO) Atualiza uma questão V/F (PATCH /questions/{id})
     * O DTO exato pode precisar de ajuste (ex: UpdateQuestionDto)
     */
    updateQuestion(id: string, payload: Partial<BackendQuestion>): Observable<BackendQuestion> {
        return this.http.patch<BackendQuestion>(`${BASE_PATH}/${id}`, payload);
    }
}
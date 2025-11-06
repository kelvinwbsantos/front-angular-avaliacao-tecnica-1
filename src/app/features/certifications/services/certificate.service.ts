// src/app/core/services/certificate.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs'; // <-- IMPORTAR 'map'
import { Certificate } from '../../shared/models/certificate.model';

// Configuração da API
const API_URL = 'http://localhost:3000'; // Ajuste sua URL
const BASE_PATH = `${API_URL}/certificates`;

/**
 * Interface para a resposta paginada que o Postman mostrou
 */
interface PaginatedCertResponse {
  data: Certificate[];
  meta: {
    total: number;
    page: number;
    last_page: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  private http = inject(HttpClient);

  /**
   * (GET /certificates)
   * Busca todas as certificações obtidas pelo usuário.
   */
  getUserCertificates(): Observable<Certificate[]> {
    // 1. Espera o objeto paginado
    return this.http.get<PaginatedCertResponse>(BASE_PATH).pipe(
      // 2. Extrai e retorna APENAS o array 'data'
      map(response => response.data) 
    );
  }
 
  /**
   * (POST /certificates/generate/{certificationId})
   * Gera e baixa o certificado em PDF.
   */
  generateCertificate(certificationId: string): Observable<Blob> {
    return this.http.post(`${BASE_PATH}/generate/${certificationId}`, {}, {
      responseType: 'blob' 
    });
  }
}
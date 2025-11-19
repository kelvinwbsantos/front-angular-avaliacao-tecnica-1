// src/app/core/services/certificate.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs'; 
import { Certificate } from '../../shared/models/certificate.model';
import { environment } from '../../../environments/environment';
import { VerificationResult } from '../../shared/models/certificate.model';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  private readonly API_URL = environment.apiUrl;
  private readonly BASE_PATH = `${this.API_URL}/certificates`;

  private http = inject(HttpClient);

  /**
   * (GET /certificates)
   * Busca todas as certificações obtidas pelo usuário.
   */
  getUserCertificates(): Observable<Certificate[]> {
    // 1. Espera o objeto paginado
    return this.http.get<PaginatedCertResponse>(this.BASE_PATH).pipe(
      // 2. Extrai e retorna APENAS o array 'data'
      map(response => response.data) 
    );
  }
 
  /**
   * (POST /certificates/generate/{certificationId})
   * Gera e baixa o certificado em PDF.
   */
  generateCertificate(certificationId: string): Observable<Blob> {
    return this.http.post(`${this.BASE_PATH}/generate/${certificationId}`, {}, {
      responseType: 'blob' 
    });
  }

  /**
   * (GET /certificates/public/{uuid})
   * Busca os dados públicos de um certificado para o validador.
   * @param uuid O ID (uuid) do certificado a ser validado.
   */
  getPublicValidationData(uuid: string): Observable<any> {
    // Este método usa o endpoint público que a equipe de backend
    // irá criar (ex: /api/certificates/public/01914bf6-...)
    //
    // Note que usamos <any> porque ainda não definimos um 
    // modelo (interface) para a resposta pública.
    return this.http.get<any>(`${this.BASE_PATH}/public/${uuid}`);
  }
  
  verifyCertificate(uuid: string): Observable<VerificationResult> {
        const url = `${this.BASE_PATH}/verify`; // Rota sem o UUID no final
        
        // Envia o UUID como um parâmetro de consulta
        let params = new HttpParams().set('uuid', uuid);
        
        // Assumindo que BASE_PATH = API_URL/certificates
        return this.http.get<VerificationResult>(url, { params: params });
    }

}
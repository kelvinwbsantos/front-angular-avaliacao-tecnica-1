import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
    
    Certification,
    CertificationFilterDTO,
    CertificationPayloadDTO,
    PaginatedCertificationsResponse
} from '../models/certification-models';
import { ApiResponse } from '../../questions-page/models/question-models';    

// --- CONFIGURAÇÃO DA API ---
// ATENÇÃO: Substitua pela sua URL base real da API
const API_URL = 'http://localhost:3000'; 
const BASE_PATH = `${API_URL}/certifications`;


@Injectable({
    providedIn: 'root'
})
export class CertificationsService {
    // Injeta o HttpClient
    private http = inject(HttpClient);
    
    /**
     * Busca de certificações com filtros e paginação (GET /certifications)
     */
   /**
     * Busca de certificações com filtros e paginação (GET /certifications)
     */
    findAllCertifications(filters: CertificationFilterDTO): Observable<PaginatedCertificationsResponse> {
        let params = new HttpParams()
            .set('page', filters.page.toString())
            .set('limit', filters.limit.toString());
            
        if (filters.title) {
            params = params.set('title', filters.title);
        }
        if (filters.isActive !== null && filters.isActive !== undefined) {
            params = params.set('isActive', filters.isActive.toString());
        }
        
        return this.http.get<PaginatedCertificationsResponse>(BASE_PATH, { params }).pipe(
            // --- 2. ADICIONE O "LIMPADOR" DE DADOS AQUI ---
          map((response: PaginatedCertificationsResponse) => {
                response.data.forEach(cert => {
                    if (cert.pdfPath) {
                        // ... (lógica do split)
                        const fileNameOnDisk = cert.pdfPath.split('/').pop() || '';
                        const parts = fileNameOnDisk.split('-');
                        cert.pdfFileName = parts.slice(2).join('-');
                    }
                });
                return response; 
            })
        );
    }

    /**
     * Busca uma certificação pelo ID (GET /certification/{id})
     */
    findCertificationById(id: number | string): Observable<Certification> {
        return this.http.get<Certification>(`${BASE_PATH}/${id}`);
    }
    
   
     /**
     * Cria uma nova certificação (POST /certifications) - aceita multipart/form-data
     */
    createCertification(payload: CertificationPayloadDTO, file:File ) : Observable<Certification> {
        const formData = new FormData();

        // 1. Adiciona todos os campos do DTO ao FormData
        formData.append('name', payload.name);
        formData.append('shortDescription', payload.shortDescription);
        formData.append('description', payload.description);
        formData.append('modality', payload.modality);
        
        // FormData só aceita strings, então convertemos números
        formData.append('passingScore', payload.passingScore.toString());
        formData.append('durationHours', payload.durationHours.toString());
        
        // 2. Adiciona o arquivo (se existir)
        // O backend espera um campo chamado "file", de acordo com o DTO
        if (file) {
            formData.append('file', file, file.name);
        }

        // 3. Envia o FormData.
        // NÃO definimos o Content-Type; o browser faz isso
        // automaticamente (e define o 'boundary' correto).
        return this.http.post<Certification>(BASE_PATH, formData);
    }

    /**
     * Atualiza uma certificação existente (PATCH /certification/{id})
     */
    updateCertification(id: number | string, payload: Partial<CertificationPayloadDTO>): Observable<Certification> {
        return this.http.patch<Certification>(`${BASE_PATH}/${id}`, payload);
    }
    /**
     * Apaga uma certificação (DELETE /certification/{id})
     */
    deleteCertification(id: string): Observable<void> {
        return this.http.delete<void>(`${BASE_PATH}/${id}`);
    }
   /**
   * CORREÇÃO: Esta é a função que precisa ser atualizada.
   * Ela agora usa a nova ROTA e o novo TIPO DE RETORNO (ApiResponse).
   */
  generateAiQuestions(certificationId: string, file: File | null): Observable<ApiResponse> {
    
    // A nova rota que você especificou
    const url = `${API_URL}/questions/generate-from-pdf`;
    
    const formData = new FormData();
    
    // O backend precisa saber qual arquivo processar.
    // Se 'file' for nulo, o backend deve (espera-se) usar o PDF existente.
    // Se 'file' for enviado, o backend deve usá-lo e substituí-lo.
    formData.append('certificationId', certificationId)
    if (file) {
      formData.append('pdfFile', file, file.name); // 'pdfFile' é um nome comum, ajuste se o seu backend esperar outro
    }

    // Nota: A rota antiga era /ai-generate/{id} e provavelmente era um POST/PUT.
    // A nova rota /generate-from-pdf/{id} provavelmente é um POST.
    // Estou assumindo POST. Ajuste se for PUT.
    return this.http.post<ApiResponse>(url, formData);
  }

  /**
   * Envia o arquivo PDF para uma certificação existente.
   * Você PRECISA criar a rota correspondente no backend (ex: POST /certifications/{id}/pdf).
   */
  uploadCertificationPdf(id: string, file: File): Observable<Certification> { // Ou Observable<any>
    const formData = new FormData();
    formData.append('file', file, file.name); // O nome 'file' deve bater com o backend

    // Rota Exemplo: ajuste conforme seu backend
    const url = `${BASE_PATH}/${id}/pdf`; 
    
    // Método Exemplo: Pode ser POST ou PUT
    return this.http.post<Certification>(url, formData); 
  }
    
}

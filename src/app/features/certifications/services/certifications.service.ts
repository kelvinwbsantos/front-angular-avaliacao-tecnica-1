import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
    
    InitialCertification,
    CompleteCertification,
    CertificationFilterDTO,
    PaginatedCertificationsResponse,
    
} from '../../shared/models/certification.models';
import { ApiResponse } from '../../shared/models/question-models';     
import { environment } from '../../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class CertificationsService {
    private readonly API_URL = environment.apiUrl;
    private readonly BASE_PATH = `${this.API_URL}/certifications`;

    private http = inject(HttpClient);
    
    /**
     * Busca de certificações com filtros e paginação (GET /certifications)
     */
   findAllCertifications(filters: CertificationFilterDTO): Observable<PaginatedCertificationsResponse> {
        let params = new HttpParams()
            .set('page', filters.page.toString())
            .set('limit', filters.limit.toString());
            
        if (filters.title) {
            params = params.set('name', filters.title); 
        }
        
        // Ajuste para o filtro de status
        if (filters.status !== null && filters.status !== undefined) {
            // Se o backend espera 'true'/'false' como string:
            const isActiveString = (filters.status === 'Ativa').toString();
            params = params.set('isActive', isActiveString);
        }
        
        return this.http.get<PaginatedCertificationsResponse>(this.BASE_PATH, { params }).pipe(
            map((response) => {
                // A resposta já vem no formato { data: [], meta: {} }
                // Só precisamos processar o PDF dentro de response.data
                if (response.data) {
                    response.data.forEach(cert => {
                        if (cert.pdfPath) {
                            const fileNameOnDisk = cert.pdfPath.split('/').pop() || '';
                            cert.pdfFileName = fileNameOnDisk; 
                        }
                    });
                }
                return response; 
            })
        );
    }

    /**
     * Busca uma certificação pelo ID (GET /certification/{id})
     */
    findCertificationById(id: number | string): Observable<CompleteCertification> {
        return this.http.get<CompleteCertification>(`${this.BASE_PATH}/${id}`).pipe(
        
        map((cert: CompleteCertification) => {
            if (cert.pdfPath) {
            const fileNameOnDisk = cert.pdfPath.split('/').pop() || '';
            const parts = fileNameOnDisk.split('-');
            cert.pdfFileName = parts.slice(2).join('-');
            }
            return cert;
        })
        );
     }
    
    
     /**
     * Cria uma nova certificação (POST /certifications) - aceita multipart/form-data
     */
    createCertification(payload: InitialCertification, file:File ) : Observable<CompleteCertification> {
        const formData = new FormData();
        formData.append('name', payload.name);
        formData.append('shortDescription', payload.shortDescription);
        formData.append('description', payload.description);
        formData.append('modality', payload.modality);
        formData.append('passingScore', payload.passingScore.toString());
        formData.append('durationHours', payload.durationHours.toString());
        
        if (file) {
            formData.append('file', file, file.name);
        }
        return this.http.post<CompleteCertification>(this.BASE_PATH, formData);
    }

    /**
     * Atualiza uma certificação (PATCH /certifications/{id})
     * 1. Usa a interface 'InitialCertification' + 'isActive'.
     * 2. Trabalha o 'isActive' como string, pois FormData exige e backend é boolean.
     * 3. Adiciona o 'file' opcional.
     * 4. Retorna a certificação completa atualizada.
     */
    updateCertification(
      id: string, 
      // O payload são todos os campos de texto, incluindo isActive
      payload: InitialCertification & { isActive: boolean }, 
      file: File | null // O arquivo opcional
    ): Observable<CompleteCertification> { // Retorna a certificação completa
        
        const formData = new FormData();

        // 1. Adiciona os campos de texto
        formData.append('name', payload.name);
        formData.append('shortDescription', payload.shortDescription);
        formData.append('description', payload.description);
        formData.append('modality', payload.modality);
        formData.append('passingScore', payload.passingScore.toString());
        formData.append('durationHours', payload.durationHours.toString());
        
        // 2. O Swagger exige 'isActive' (boolean). O FormData envia string.
        // Se o backend não preparado para converter "true" -> true trabalhamos com o campo vazio para 0.
        formData.append('isActive', payload.isActive ? 'true' : '');        
       
        // 3. Adiciona o arquivo, se fornecido
        if (file) {
            console.log("[Service] Anexando NOVO arquivo PDF:", file.name);
            formData.append('file', file, file.name);
        }
        
        // 4. Envia o FormData usando PATCH
        console.log("[Service] Enviando FormData (PATCH) para:", `${this.BASE_PATH}/${id}`);
        return this.http.patch<CompleteCertification>(`${this.BASE_PATH}/${id}`, formData);
    }
    /**
     * Apaga uma certificação (DELETE /certification/{id})
     */
    deleteCertification(id: string): Observable<void> {
        return this.http.delete<void>(`${this.BASE_PATH}/${id}`);
    }


    
    /**
     * Gera questões de IA a partir de um PDF (POST /questions/generate-from-pdf)
     */
    generateAiQuestions(certificationId: string, file: File | null): Observable<ApiResponse> {
        const url = `${this.API_URL}/questions/generate-from-pdf`;
        const formData = new FormData();
        formData.append('certificationId', certificationId)
        if (file) {
            formData.append('pdfFile', file, file.name);
        }
        return this.http.post<ApiResponse>(url, formData);
    }

    /**
     * Envia o arquivo PDF para uma certificação existente.
     * Rota: POST /certifications/{id}/pdf
     */
    uploadCertificationPdf(id: string, file: File): Observable<CompleteCertification> {
        const formData = new FormData();
        formData.append('file', file, file.name);
        const url = `${this.BASE_PATH}/${id}/pdf`; 
        return this.http.post<CompleteCertification>(url, formData); 
    }
    
    // ******************************************************
    // ****** O MÉTODO QUE FALTA (PARA O downloadMaterial) ******
    // ******************************************************
    /**
     * Gera/Baixa o PDF de um certificado/material.
     * Rota: POST /certificates/generate/{id}
     */
    // generateCertificate(certificationId: string): Observable<Blob> {
    //     // ATENÇÃO: A rota correta é /certificates (singular)
    //     // Estamos "roubando" a API_URL para forçar a rota certa.
    //     const url = `${API_URL}/certificates/generate/${certificationId}`;
        
    //     return this.http.post(url, {}, {
    //         responseType: 'blob' // Espera um arquivo (Blob)
    //     });
    // }
    
}
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
    
    Certification,
    CertificationFilterDTO,
    CertificationPayloadDTO,
    PaginatedCertificationsResponse
} from '../../shared/models/certification.models';
import { ApiResponse } from '../../shared/models/question-models';     

// --- CONFIGURAÇÃO DA API ---
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
            map((response: PaginatedCertificationsResponse) => {
                response.data.forEach(cert => {
                    if (cert.pdfPath) {
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
        return this.http.get<Certification>(`${BASE_PATH}/${id}`).pipe(
        
        map((cert: Certification) => {
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
    createCertification(payload: CertificationPayloadDTO, file:File ) : Observable<Certification> {
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
     * Gera questões de IA a partir de um PDF (POST /questions/generate-from-pdf)
     */
    generateAiQuestions(certificationId: string, file: File | null): Observable<ApiResponse> {
        const url = `${API_URL}/questions/generate-from-pdf`;
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
    uploadCertificationPdf(id: string, file: File): Observable<Certification> {
        const formData = new FormData();
        formData.append('file', file, file.name);
        const url = `${BASE_PATH}/${id}/pdf`; 
        return this.http.post<Certification>(url, formData); 
    }
    
    // ******************************************************
    // ****** O MÉTODO QUE FALTAVA (PARA O downloadMaterial) ******
    // ******************************************************
    /**
     * Gera/Baixa o PDF de um certificado/material.
     * Rota: POST /certificates/generate/{id}
     */
    generateCertificate(certificationId: string): Observable<Blob> {
        // ATENÇÃO: A rota correta é /certificates (singular)
        // Estamos "roubando" a API_URL para forçar a rota certa.
        const url = `${API_URL}/certificates/generate/${certificationId}`;
        
        return this.http.post(url, {}, {
            responseType: 'blob' // Espera um arquivo (Blob)
        });
    }
    
}
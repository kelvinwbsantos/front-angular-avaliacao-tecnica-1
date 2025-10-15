import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Interface para a Certificação (Baseado em como será no backend)
export interface Certification {
  id: number;
  title: string;
  pdfFileName: string;
  status: 'Draft' | 'Published' | 'Pending Review';
  questionsCount: number;
  createdAt: string;
}

// Interface para o DTO de paginação/filtro
export interface CertificationFilterDTO {
  page: number;
  limit: number;
  title?: string | null;
  status?: string | null;
}

const MOCK_CERTIFICATIONS: Certification[] = [
  { id: 1, title: 'Certificação Angular Avançado', pdfFileName: 'angular_guide.pdf', status: 'Published', questionsCount: 45, createdAt: '2025-09-01' },
  { id: 2, title: 'Segurança em APIs REST com NestJS', pdfFileName: 'nest_security.pdf', status: 'Draft', questionsCount: 12, createdAt: '2025-09-15' },
  { id: 3, title: 'Fundamentos de PostgreSql', pdfFileName: 'postgres_intro.pdf', status: 'Pending Review', questionsCount: 30, createdAt: '2025-10-01' },
  { id: 4, title: 'Desenvolvimento Web Responsivo', pdfFileName: 'responsive_web.pdf', status: 'Published', questionsCount: 50, createdAt: '2025-10-10' },
  { id: 5, title: 'Design Patterns em TypeScript', pdfFileName: 'typescript_patterns.pdf', status: 'Draft', questionsCount: 5, createdAt: '2025-10-12' },
  { id: 6, title: 'Estruturas de Dados Essenciais', pdfFileName: 'data_structures.pdf', status: 'Draft', questionsCount: 0, createdAt: '2025-10-14' },
  { id: 7, title: 'Gestão Ágil de Projetos', pdfFileName: 'agile.pdf', status: 'Published', questionsCount: 60, createdAt: '2025-09-20' },
];

@Injectable({
  providedIn: 'root'
})
export class CertificationsService {

  // Simula a busca de certificações com filtros e paginação
  findAllCertifications(filters: CertificationFilterDTO): Observable<{ data: Certification[], total: number }> {
    let filteredData = MOCK_CERTIFICATIONS.filter(cert => {
      // Filtro por Título
      if (filters.title && !cert.title.toLowerCase().includes(filters.title.toLowerCase())) {
        return false;
      }
      // Filtro por Status
      if (filters.status && filters.status !== 'Todos os Status' && cert.status !== filters.status) {
        return false;
      }
      return true;
    });

    // Simula a paginação
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    const paginatedData = filteredData.slice(start, end);

    return of({
      data: paginatedData,
      total: filteredData.length
    }).pipe(delay(500)); // Simula um delay de rede
  }
}

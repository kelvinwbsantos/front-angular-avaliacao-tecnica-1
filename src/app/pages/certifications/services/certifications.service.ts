import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// --- INTERFACES DETALHADAS (Usadas pelo Modal de Detalhes e Questões) ---

export interface QuestionOption {
  id: string; // Identificador único da opção
  text: string; // O texto da resposta
  isCorrect: boolean; // Flag para indicar se a opção é a correta
}

/**
 * Interface para as opções de resposta de uma questão.
 */
export interface Option {
    text: string;
    isCorrect: boolean;
}

/**
 * Interface para a Questão.
 */
export interface Question {
    id: string;
    questionText: string;
    options: Option[];
    isActive: boolean;
    validUntil: string; // Formato YYYY-MM-DD
    isValidated: boolean; // Indica se foi validada por um especialista ou IA
    createdAt: string;
}

/**
 * Interface para a Certificação (Detalhada).
 */
export interface Certification {
    id: number;
    title: string;
    description: string; // Nova propriedade para o detalhe
    status: 'Draft' | 'Published' | 'Pending Review';
    questionsCount: number;
    createdAt: string;
    // Propriedade detalhada, usada no modal:
    // NOVOS CAMPOS PARA GERENCIAMENTO DE PDF
    pdfFileName?: string; // Nome do arquivo original
    pdfPath?: string;     // Caminho simulado no 'storage'
    questions?: Question[]; 
}

// --- INTERFACES DE FILTRO E MOCK ---

// Interface para o DTO de paginação/filtro
export interface CertificationFilterDTO {
    page: number;
    limit: number;
    title?: string | null;
    status?: string | null;
}

// Dados mockados mestre (utilizados para simular tanto a lista quanto o detalhe)
const MOCK_CERTIFICATIONS: Certification[] = [
    { 
        id: 1, 
        title: 'Certificação Angular Avançado', 
        description: 'Módulo avançado sobre reatividade, Signals e performance em Angular.',
        pdfFileName: 'angular_guide.pdf', 
        status: 'Published', 
        questionsCount: 45, 
        createdAt: '2025-09-01',
        questions: [
            {
                id: '101',
                questionText: 'Qual o principal benefício da utilização de Signals no Angular?',
                options: [
                    { text: 'Melhora a detecção de mudanças (Change Detection)', isCorrect: true },
                    { text: 'Reduz o tamanho dos bundles', isCorrect: false },
                ],
                isActive: true,
                validUntil: '2025-12-31',
                isValidated: true,
                createdAt: '2024-06-01'
            },
            {
                id: '102',
                questionText: 'O que é Overfitting em modelos de Machine Learning?',
                options: [
                    { text: 'Quando o modelo aprende demais com os dados de treinamento, incluindo ruído.', isCorrect: true },
                    { text: 'Quando o modelo não consegue aprender o padrão dos dados.', isCorrect: false },
                ],
                isActive: false,
                validUntil: '2024-09-01',
                isValidated: true,
                createdAt: '2024-06-05'
            }
        ]
    },
    { id: 2, title: 'Segurança em APIs REST com NestJS', description: 'Foco em JWT, CORS e autenticação com Passport.', pdfFileName: 'nest_security.pdf', status: 'Draft', questionsCount: 12, createdAt: '2025-09-15' },
    { id: 3, title: 'Fundamentos de PostgreSql', description: 'Conceitos básicos, otimização de consultas e tipos de dados avançados.', pdfFileName: 'postgres_intro.pdf', status: 'Pending Review', questionsCount: 30, createdAt: '2025-10-01' },
    { id: 4, title: 'Desenvolvimento Web Responsivo', description: 'Uso de Flexbox, Grid e Mobile First com Tailwind CSS.', pdfFileName: 'responsive_web.pdf', status: 'Published', questionsCount: 50, createdAt: '2025-10-10' },
    { id: 5, title: 'Design Patterns em TypeScript', description: 'Implementação de Padrões como Factory, Singleton e Strategy.', pdfFileName: 'typescript_patterns.pdf', status: 'Draft', questionsCount: 5, createdAt: '2025-10-12' },
    { id: 6, title: 'Estruturas de Dados Essenciais', description: 'Implementação e análise de desempenho de Listas, Pilhas e Filas.', pdfFileName: 'data_structures.pdf', status: 'Draft', questionsCount: 0, createdAt: '2025-10-14' },
    { id: 7, title: 'Gestão Ágil de Projetos', description: 'Scrum, Kanban e técnicas de planejamento e retrospectiva.', pdfFileName: 'agile.pdf', status: 'Published', questionsCount: 60, createdAt: '2025-09-20' },
];

@Injectable({
    providedIn: 'root'
})
export class CertificationsService {

  private certifications: Certification[] = [
        {
            id: 1,
            title: 'Angular Standalone Components',
            description: 'Certificação sobre o novo paradigma de componentes standalone do Angular e a eliminação dos NgModules.',
            status: 'Published',
            questionsCount: 15,
            createdAt: '2023-10-01',
            pdfFileName: 'guia_standalone.pdf',
            pdfPath: 'assets/pdfs/guia_standalone.pdf',
            questions: [
                { id: '101', questionText: 'Qual o principal benefício dos Standalone Components?', options: [{text: 'Diminuição do bundle size', isCorrect: true}, {text: 'Aumento da complexidade', isCorrect: false}], isActive: true, validUntil: '2025-12-31', isValidated: true, createdAt: '2023-10-01' },
                { id: '102', questionText: 'Como um componente Standalone importa dependências?', options: [{text: 'Usando o `imports` array no `@Component`', isCorrect: true}, {text: 'Usando o `declarations` array no AppModule', isCorrect: false}], isActive: true, validUntil: '2025-12-31', isValidated: true, createdAt: '2023-10-01' },
            ]
        },
        {
            id: 2,
            title: 'RxJS Operators Avançados',
            description: 'Foco em operadores de transformação, filtragem e multicasting do RxJS.',
            status: 'Draft',
            questionsCount: 5,
            createdAt: '2023-11-15',
            pdfFileName: undefined,
            pdfPath: undefined,
            questions: [
                { id: '201', questionText: 'Qual a diferença entre `switchMap` e `mergeMap`?', options: [{text: 'SwitchMap cancela o Observable anterior', isCorrect: true}, {text: 'MergeMap garante a ordem dos resultados', isCorrect: false}], isActive: true, validUntil: '2025-11-15', isValidated: false, createdAt: '2023-11-15' },
            ]
        },
    ];  
  
  // Simula a busca de certificações com filtros e paginação (usado pela Listagem)
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
        const paginatedData = filteredData.slice(start, end).map(c => ({
             ...c, // Retorna a versão completa, mas o componente de listagem só usará as props necessárias
             questions: undefined // Garante que a lista não carregue as questões desnecessariamente
        }));

        return of({
            data: paginatedData,
            total: filteredData.length
        }).pipe(delay(500)); 
    }

    /**
     * Simula a busca de uma certificação pelo ID (usado pelo Modal de Detalhes).
     * @param id O ID da certificação.
     * @returns Um Observable da Certificação completa ou undefined se não for encontrada.
     */
    findCertificationById(id: number): Observable<Certification | undefined> {
        //const certification = MOCK_CERTIFICATIONS.find(c => c.id === id);
        const cert = this.certifications.find(c => c.id === id);

        // Retorna a certificação completa (incluindo as questions)
        return of(cert).pipe(delay(500)); 
    }
}

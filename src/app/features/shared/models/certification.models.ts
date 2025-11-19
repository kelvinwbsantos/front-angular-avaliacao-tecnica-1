// Interface para a *nova* resposta do backend (Verdadeiro/Falso)

export interface Option {
    text: string;
    isCorrect: boolean;
}

/**
 * Interface para os dados de criação/atualização (Payload - POST/PATCH)
 */
export interface InitialCertification {
    name: string; 
    shortDescription: string;
    description: string;
    passingScore: number;
    modality: string;
    durationHours: number;
    // isActive: boolean;
}

/**
 * Interface para a Certificação completa retornada pelo backend (GET).
 */
export interface CompleteCertification extends InitialCertification {
    id: string;
    title: string; // Mantido para compatibilidade com o componente de listagem
    status: 'Draft' | 'Published' | 'Pending Review';
    questionsCount: number;
    createdAt: string;
    pdfFileName?: string; 
    pdfPath?: string; 
    //questions?: BackendQuestion[];
    isActive: boolean; 
}

// --- INTERFACES DE FILTRO E RESPOSTA ---

// Interface para o DTO de paginação/filtro
export interface CertificationFilterDTO {
    page: number;
    limit: number;
    title?: string | null;
    status?: string | null;
    isActive?: boolean | null;
}

// Interface para a resposta paginada do backend
export interface PaginatedCertificationsResponse {
    data: CompleteCertification[];
    meta: {
        total: number;
        page: number;
        last_page: number;
    };
}
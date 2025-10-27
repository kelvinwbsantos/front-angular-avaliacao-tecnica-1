export interface BackendQuestion {
    id: string;
    question: string;
    answer: boolean;
    validity_months?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    //validUntil?: string | null;
    certificationId?: string;
}

// 'PaginatedQuestionsResponse' antiga para ser específica)
export interface PaginatedMcQuestionsResponse {
    data: Question[]; // 'Question' é o modelo de Múltipla Escolha
    total: number; 
    page: number;
    limit: number;
}

// (Esta é a interface que o GET /questions  está usando)
export interface PaginatedTfQuestionsResponse {
    data: BackendQuestion[]; // 'BackendQuestion' é o modelo V/F
    total: number; 
    page: number;
    limit: number;
}
  
// Interface para a  resposta completa da API
export interface ApiResponse {
    created: number;
    message: string;
    questions: BackendQuestion[];
}

export interface QuestionFilterDTO {
    page: number;
    limit: number;
    questionText?: string | null;
    isActive?: boolean | null;
    validUntilStart?: string | null;
    validUntilEnd?: string | null;
    // Adicione outros filtros se necessário (ex: certificationId)
    certificationId?: string | null;
}

export interface Option {
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: string;
    questionText: string;
    options: Option[];
    isActive: boolean;
    validUntil: string; 
    isValidated: boolean; 
    createdAt: string;
}
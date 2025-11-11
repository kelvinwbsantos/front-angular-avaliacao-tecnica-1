// src/app/core/models/exam.model.ts

/**
 * O que a API retorna em GET /exams (lista)
 * ou POST /exams (criação)
 * Note: 'questions' aqui pode ser nulo ou uma lista vazia.
 */
export interface Exam {
  id: string; // ID do exame
  enrollmentId: string;
  certificationId: string;
  certificationName?: string;
  status: 'in_progress' | 'completed';
  score: number | null;
  passed: boolean | null;
  startedAt: string;
  completedAt: string | null;
  // A API de lista NÃO retorna as questões
  questions?: ExamQuestion[]; // Torna opcional
  certification:{
    name?: string;
  }
}

// ... (interfaces Exam, ExamQuestion, AnswerPayload que já existem) ...

/**
 * O que a API retorna em GET /exams/{id}/result
 */
export interface ExamResult {
  id: string; // ID do exame
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  passingScore: number; // A nota de corte
  completedAt: string;
  certificationName: string;
}



/**
 * A estrutura da questão (usada em ambos os payloads)
 */
export interface ExamQuestion {
  id: string;
  question: string;
}

/**
 * O que a API retorna em GET /exams/{id}/questions
 */
export interface ExamQuestionsResponse {
  examId: string;
  questions: ExamQuestion[];
  totalQuestions: number;
}

/**
 * O que a API espera em POST /exams/{id}/submit
 */
export interface Answer {
  questionId: string;
  userAnswer: boolean; // Baseado no seu exemplo, a resposta é T/F
}

export interface AnswerPayload {
  answers: Answer[];
}
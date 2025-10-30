// src/app/core/models/enrollment.model.ts

export interface Enrollment {
  /**
   * O ID único da matrícula (gerado pelo banco).
   */
  id: string;

  /**
   * O ID do usuário que se matriculou.
   * (A API de GET /enrollments provavelmente filtra por isso)
   */
  userId: string;

  /**
   * O ID da certificação à qual esta matrícula pertence.
   * (É o que usamos para fazer o .find())
   */
  certificationId: string;

  /**
   * Data/hora em que a matrícula foi criada (ISO String).
   */
  enrolledAt: string;

  /**
   * Status atual da matrícula.
   * (Pode ser útil para o futuro, ex: se ele já completou)
   */
  status: 'active' | 'completed' | 'cancelled';
  
  // Adicione quaisquer outros campos que sua API retornar...
  // expiresAt?: string; 
}
// src/app/core/models/certificate.model.ts

export interface Certificate {
  id: string;
  userId: number; // A API mandou um número, não string
  certificationId: string;
  active: boolean;
  createdAt: string; // O nome real é 'createdAt', não 'issuedAt'

  // --- O que está FALTANDO (Backend precisa adicionar) ---
  // A API NÃO está mandando esses. Vamos deixá-los como opcionais
  // para o código não quebrar, mas eles virão como 'undefined'.
  certificationName?: string; 
  expiresAt?: string;
  certification: {
    name?: string;
  }
}
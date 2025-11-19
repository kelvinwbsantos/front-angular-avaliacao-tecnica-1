// src/app/core/models/certificate.model.ts
import { User } from './users.models'; 
import { CompleteCertification } from './certification.models';

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

export interface VerificationResult {
    id: string; // ID do Certificado
    userId: number;
    certificationId: string;
    
    // Dados para exibição
    snapshot_student_name: string | null;
    snapshot_certification_name: string | null;
    expiresAt: string;
    createdAt: string;
    
    // Status Blockchain
    blockchainTxHash: string | null;
    blockchain_minted: boolean;

    // Relacionamentos completos (que vieram do backend)
    user: User;
    certification: CompleteCertification;
}
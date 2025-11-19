// src/app/pages/certifications-page/components/certifications-list/certifications-list.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CompleteCertification } from '../../../shared/models/certification.models';

@Component({
  selector: 'app-certifications-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './certifications-list.component.html',
  styleUrl: './certifications-list.component.scss'
})
export class CertificationsListComponent {

  // --- O "GARÇOM" (BURRO) SÓ RECEBE DADOS ---
  @Input() dataSource = new MatTableDataSource<CompleteCertification>([]);
  @Input() isLoading = true;
  @Input() isDeleting = false;
  @Input() isUploadingPdf = false;
  @Input() displayedColumns: string[] = [];

  // --- E EMITE EVENTOS ("SININHOS") ---
  @Output() pdfUpload = new EventEmitter<string>();
  @Output() openDetails = new EventEmitter<CompleteCertification>();

  /**
   * Retorna o ícone do Material Symbols com base na modalidade.
   */
  getModalityIcon(modality: string | undefined): string {
    if (!modality) return 'help_outline';
    return modality === 'online' ? 'computer' : 'groups'; // 'groups' para Presencial
  }
  /**
   * Retorna o texto traduzido da modalidade.
   */
  getModalityText(modality: string | undefined): string {
    if (!modality) return 'Não Definido';
    return modality === 'online' ? 'Online' : 'Presencial';
  }
  /**
   * Limpa o nome do arquivo, removendo o prefixo TIMESTAMP e UUID.
   * Assume o formato: 1762806999280-459504317-nome_original.pdf
   */
  cleanPdfFileName(originalName: string | null | undefined): string {
    if (!originalName) {
      return 'PDF disponível';
    }
    
    // Expressão regular para remover a UUID/Timestamp no início do nome
    // Padrão: [números]-[uuid]-[nome] OU [timestamp]-[nome]
    // Tentamos encontrar o primeiro traço (-) e removemos tudo antes dele,
    // mas garantindo que o nome não comece com o UUID da certificação.
    
    // Solução mais segura: Tenta achar o terceiro traço (se o formato for timestamp-uuid-nome)
    const parts = originalName.split('-');
    
    // Se tiver pelo menos 3 partes (ou mais) e o nome começa com o ID do item
    if (parts.length >= 3 && parts[0].length > 8) { // Heurística: se a primeira parte parece um timestamp/hash
        // Exemplo: '1762806999280-459504317-nome_original.pdf'
        // Retorna a união das partes após o segundo traço (índice 2)
        return parts.slice(2).join('-').trim(); 
    } 
    
    // Caso o formato seja apenas UUID-nome_original ou não tenha prefixo, 
    // tentamos encontrar o primeiro traço longo (UUID tem 36 caracteres).
    if (parts.length > 1 && parts[0].length >= 36) { 
         // Exemplo: 'f16c4998-bd06-48d5-98e2-1d67b948877e-nome_original.pdf'
         return parts.slice(1).join('-').trim();
    }
    
    // Retorna o nome original se não encontrar um prefixo para limpar
    return originalName;
  }
  
  // (A lógica de 'loadCertifications' etc. FOI REMOVIDA)
}
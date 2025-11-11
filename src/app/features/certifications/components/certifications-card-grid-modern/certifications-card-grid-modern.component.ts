// Caminho: src/app/pages/available-certifications-page/available-certifications.component.ts
import { Component, Input, Output, EventEmitter,  inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para @if, @for, pipes
import { Router } from '@angular/router'; // Para navegação

// Imports do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

// Serviços e Models (Ajuste os caminhos!)
import { CompleteCertification } from '../../../shared/models/certification.models'; // Reutiliza o model

@Component({
  selector: 'app-certifications-card-grid-modern', // Nome do seletor
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './certifications-card-grid-modern.component.html',
  styleUrls: ['./certifications-card-grid-modern.component.scss'],
})
export class CertificationsCardGridModernComponent {
  // Injeções
  private router = inject(Router);

  // Estado do componente
  @Input() certifications: CompleteCertification[] = [];
  @Input() isLoading = true;
  @Input() errorLoading = false;
  @Output() retryLoad = new EventEmitter<void>();

  
  // Função para navegar para a página de detalhes/realização
  viewCertificationDetails(certificationId: string): void {
     // Navega para a rota de detalhes específica do candidato
     this.router.navigate(['/app/available-certifications', certificationId]);
  }

  // Função auxiliar para obter um ícone baseado na modalidade (exemplo)
  getModalityIcon(modality: string): string {
    return modality === 'online' ? 'computer' : 'groups';
  }
}
// Caminho: src/app/pages/available-certifications-page/available-certifications.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para @if, @for, pipes
import { Router } from '@angular/router'; // Para navegação
import { Observable, EMPTY, catchError, finalize } from 'rxjs'; // RxJS

// Imports do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

// Serviços e Models (Ajuste os caminhos!)
import { CertificationsService } from '../certifications-page/services/certifications.service'; // Reutiliza o serviço
import { Certification } from '../certifications-page/models/certification-models'; // Reutiliza o model
import { AuthService } from '../../core/services/auth.service'; // Para futuras verificações de permissão

@Component({
  selector: 'app-available-certifications', // Nome do seletor
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './available-certifications.component.html',
  styleUrls: ['./available-certifications.component.scss'],
})
export class AvailableCertificationsComponent implements OnInit {
  // Injeções
  private certificationsService = inject(CertificationsService);
  private router = inject(Router);
  public authService = inject(AuthService); // Público se precisar no template

  // Estado do componente
  certifications: Certification[] = [];
  isLoading = true;
  errorLoading = false;

  ngOnInit(): void {
    this.loadCertifications();
  }

  loadCertifications(): void {
    this.isLoading = true;
    this.errorLoading = false;
    console.log('[AvailableCerts] Carregando certificações...');

    // Busca todas as certificações ativas (exemplo de filtro, ajuste no serviço se necessário)
    // Assumindo que findAllCertifications busca tudo e filtramos aqui,
    // ou idealmente o serviço teria um método findAvailable()
    this.certificationsService
      .findAllCertifications({ page: 1, limit: 100, isActive: true }) // Busca muitas, apenas ativas
      .pipe(
        catchError((err) => {
          console.error('[AvailableCerts] Erro ao buscar certificações:', err);
          this.errorLoading = true;
          // TODO: Mostrar mensagem de erro para o usuário (ex: Snackbar)
          return EMPTY; // Encerra o fluxo em caso de erro
        }),
        finalize(() => {
          this.isLoading = false;
          console.log('[AvailableCerts] Carregamento finalizado.');
        })
      )
      .subscribe((response) => {
        // Atribui apenas os dados recebidos
        this.certifications = response.data;
        console.log(`[AvailableCerts] ${this.certifications.length} certificações carregadas.`);
      });
  }

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
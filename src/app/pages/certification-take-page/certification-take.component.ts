// Caminho: src/app/pages/certification-take-page/certification-take.component.ts
// v1.1 - Adiciona logs detalhados e garante finalização

import { Component, OnInit, inject, OnDestroy } from '@angular/core'; // Adicionado OnDestroy
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, EMPTY, Subscription } from 'rxjs'; // Adicionado Subscription
import { switchMap, catchError, finalize, tap, take } from 'rxjs/operators';

// ... (imports do Material)
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';


// Serviços e Models (Ajuste os caminhos!)
import { CertificationsService } from '../certifications-page/services/certifications.service';
import { Certification } from '../certifications-page/models/certification-models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-certification-take',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './certification-take.component.html',
  styleUrls: ['./certification-take.component.scss'],
})
// Adiciona OnDestroy para limpar a subscription
export class CertificationTakeComponent implements OnInit, OnDestroy {
  // ... (injeções: route, router, certificationsService, authService)
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private certificationsService = inject(CertificationsService);
  public authService = inject(AuthService);

  // --- Estado do Componente ---
  certification: Certification | null = null;
  isLoading = true; // Começa como true
  errorLoading = false;
  certificationId: string | null = null;

  private loadSubscription: Subscription | null = null; // Para gerenciar a subscription

  ngOnInit(): void {
    this.loadCertificationDetails();
  }

  ngOnDestroy(): void {
    // Cancela a subscription se o componente for destruído
    this.loadSubscription?.unsubscribe();
    console.log('[CertTake] Componente destruído, subscription cancelada.');
  }


  loadCertificationDetails(): void {
    // ... (todo o seu reset de estado está ótimo)
    this.isLoading = true;
    this.errorLoading = false;
    this.certification = null;
    console.log('[CertTake] Iniciando carregamento...');
    this.loadSubscription?.unsubscribe();

    this.loadSubscription = this.route.paramMap.pipe(
      tap(params => {
        this.certificationId = params.get('id');
        console.log(`[CertTake] ID da rota obtido: ${this.certificationId}`);
        if (!this.certificationId) {
          console.error('[CertTake] ID não encontrado na rota.');
          this.errorLoading = true;
          this.isLoading = false; 
          throw new Error('ID da certificação ausente');
        }
      }),
      switchMap(() => {
          console.log('[CertTake] Buscando dados no serviço...');
          return this.certificationsService.findCertificationById(this.certificationId!);
      }),
      
      // ****** A MÁGICA ESTÁ AQUI ******
      take(1), // 2. ADICIONE O take(1) AQUI
      // Isso força o Observable a completar após a primeira emissão.
      // E isso VAI disparar o finalize.
      // **********************************

      tap(certData => { 
          console.log('[CertTake] Dados recebidos do serviço:', certData);
          if (!certData) {
               console.warn('[CertTake] Serviço retornou null/undefined.');
               this.errorLoading = true; 
          }
      }),
      catchError((err) => {
        console.error('[CertTake] Erro DURANTE a busca no serviço:', err);
        this.errorLoading = true;
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false; // <-- Agora isso vai rodar
        console.log(`[CertTake] Finalize executado. isLoading = ${this.isLoading}`);
      })
    ).subscribe({
        // ... (seu subscribe está perfeito, não mude nada)
        next: (certData) => {
            if (certData) {
                this.certification = certData;
                console.log('[CertTake] Subscribe (next): Dados atribuídos ao componente.');
            } else {
                 console.warn('[CertTake] Subscribe (next): Recebeu null/undefined, não atribuiu.');
            }
        },
        // ... (etc)
    });
  }

  // ... (scheduleExam, startExam, getModalityIcon - sem alterações)
  scheduleExam(): void {
    console.log(`[CertTake] Clicou em Agendar para Cert ID: ${this.certificationId}`);
    alert('Funcionalidade de agendamento ainda não implementada.');
  }
  startExam(): void {
    if (!this.certificationId) return;
    console.log(`[CertTake] Clicou em Realizar Prova para Cert ID: ${this.certificationId}. Navegando para /app/exam/${this.certificationId}`);
    this.router.navigate(['/app/exam', this.certificationId]);
  }
  getModalityIcon(modality: string | undefined): string {
    return modality === 'online' ? 'computer' : 'groups';
  }
}

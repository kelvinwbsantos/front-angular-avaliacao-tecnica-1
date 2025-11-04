// Caminho: src/app/pages/certification-take-page/certification-take.component.ts
// v2.1 - Adiciona lógica de Download de Material

import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, Subscription, forkJoin, of } from 'rxjs'; // Importa forkJoin e of
import { switchMap, catchError, finalize, tap, take }from 'rxjs/operators';

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Para feedback

// Serviços e Models (Ajuste os caminhos!)
import { CertificationsService } from '../certifications-page/services/certifications.service';
import { Certification } from '../certifications-page/models/certification-models';
import { AuthService } from '../../core/services/auth.service';

// !!! VOCÊ PRECISA CRIAR E PROVER ESTES SERVIÇOS !!!
import { EnrollmentService } from '../../core/services/enrollment.service'; // Ex: /core/services/
import { Enrollment } from '../../core/models/enrollment.model'; // Ex: /core/models/
import { ExamService } from '../exam-page/services/exam.service';       // Ex: /core/services/


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
    MatSnackBarModule,
  ],
  templateUrl: './certification-take.component.html',
  styleUrls: ['./certification-take.component.scss'],
})
export class CertificationTakeComponent implements OnInit, OnDestroy {
  // --- Injeções ---
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private certificationsService = inject(CertificationsService);
  public authService = inject(AuthService);
  
  private enrollmentService = inject(EnrollmentService);
  private examService = inject(ExamService); 
  private snackBar = inject(MatSnackBar);

  // --- Estado do Componente ---
  certification: Certification | null = null;
  isLoading = true; // Spinner da PÁGINA
  errorLoading = false;
  certificationId: string | null = null;
  
  // --- ESTADO NOVO ---
  userEnrollmentId: string | null = null;
  isEnrolling = false; // Spinner dos BOTÕES de inscrição
  isDownloading = false; // <-- ADICIONADO: Spinner do botão de download

  private loadSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.loadCertificationDetails();
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
    console.log('[CertTake] Componente destruído, subscription cancelada.');
  }

  loadCertificationDetails(): void {
    this.isLoading = true;
    this.errorLoading = false;
    this.certification = null;
    this.userEnrollmentId = null; 
    console.log('[CertTake] Iniciando carregamento (Certificação e Matrículas)...');
    
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
        console.log('[CertTake] Buscando dados em paralelo (forkJoin)...');
        return forkJoin({
          // Busca 1: Detalhes da Certificação
          certification: this.certificationsService.findCertificationById(this.certificationId!).pipe(
            catchError(err => {
              console.error('[CertTake] Erro ao buscar certificação:', err);
              this.errorLoading = true;
              return of(null);
            })
          ),
          // Busca 2: Matrículas do Usuário
          enrollments: this.enrollmentService.getUserEnrollments().pipe(
            catchError(err => {
              console.warn('[CertTake] Erro ao buscar matrículas:', err);
              return of([]); 
            })
          )
        });
      }),
      take(1),
      tap(({ certification, enrollments }) => { 
          console.log('[CertTake] forkJoin concluído. Processando dados...');
          if (!certification) {
            console.error('[CertTake] Falha crítica: Certificação não carregada.');
            this.errorLoading = true;
            return; 
          }
          
          this.certification = certification;
          console.log('[CertTake] Certificação atribuída.');
          // Log para verificar se o pdfFileName (criado no service) chegou
          console.log('[CertTake] PDF FileName (do service):', this.certification.pdfFileName);

          const foundEnrollment = enrollments.find(
            (e: Enrollment) => e.certificationId === this.certificationId
          );

          if (foundEnrollment) {
            this.userEnrollmentId = foundEnrollment.id;
            console.log(`[CertTake] Usuário ESTÁ MATRICULADO. ID da Matrícula: ${this.userEnrollmentId}`);
          } else {
            this.userEnrollmentId = null;
            console.log('[CertTake] Usuário NÃO ESTÁ MATRICULADO.');
          }
      }),
      catchError((err) => {
        console.error('[CertTake] Erro GERAL no pipe:', err);
        this.errorLoading = true;
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false; // Desliga o spinner da PÁGINA
        console.log(`[CertTake] Finalize executado. isLoading = ${this.isLoading}`);
      })
    ).subscribe();
  }

  // --- AÇÕES DE MATRÍCULA ---

  /** Inscreve o usuário na certificação */
  enroll(): void {
    if (!this.certificationId) return;

    this.isEnrolling = true; 
    this.enrollmentService.createEnrollment({ certificationId: this.certificationId })
      .pipe(finalize(() => this.isEnrolling = false))
      .subscribe({
        next: (newEnrollment) => {
          this.userEnrollmentId = newEnrollment.id;
          console.log(`[CertTake] Inscrição realizada. Novo ID: ${newEnrollment.id}`);
          this.snackBar.open('Inscrição realizada com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
        },
        error: (err) => {
          console.error('[CertTake] Erro ao se inscrever:', err);
          this.snackBar.open('Falha ao realizar inscrição. Tente novamente.', 'Fechar', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }

  /** Cancela a inscrição do usuário */
  unenroll(): void {
    if (!this.userEnrollmentId) return;

    this.isEnrolling = true;
    this.enrollmentService.deleteEnrollment(this.userEnrollmentId)
      .pipe(finalize(() => this.isEnrolling = false))
      .subscribe({
        next: () => {
          console.log(`[CertTake] Inscrição ${this.userEnrollmentId} cancelada.`);
          this.userEnrollmentId = null;
          this.snackBar.open('Inscrição cancelada.', 'Fechar', {
            duration: 3000
          });
        },
        error: (err) => {
          console.error('[CertTake] Erro ao cancelar inscrição:', err);
          this.snackBar.open('Falha ao cancelar inscrição. Tente novamente.', 'Fechar', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }


  // --- AÇÕES DO EXAME ---

  scheduleExam(): void {
    alert('Funcionalidade de agendamento ainda não implementada.');
  }

  startExam(): void {
    if (!this.userEnrollmentId) {
      this.snackBar.open('Você precisa estar matriculado para iniciar a prova.', 'Fechar', { duration: 3000 });
      return;
    }
    console.log(`[CertTake] Clicou em Realizar Prova. Matrícula ID: ${this.userEnrollmentId}`);
    
    this.router.navigate(['/app/exam', this.userEnrollmentId]);
  }

  // --- AÇÃO DE DOWNLOAD (NOVO MÉTODO) ---

  /**
   * Baixa o material de estudo (PDF) associado à certificação.
   */
  downloadMaterial(): void {
    // 1. Verifica se os dados necessários existem
    if (!this.certification?.pdfPath || !this.certification.id) {
      this.snackBar.open('Material de estudo não disponível.', 'Fechar', { duration: 3000 });
      return;
    }

    // 2. Define estados
    this.isDownloading = true;
    const certId = this.certification.id;
    // O 'pdfFileName' foi criado no service, na chamada findCertificationById
    const fileName = this.certification.pdfFileName || 'material_de_estudo.pdf';

    // 3. Chama o serviço (reutilizando a rota de gerar certificado)
    this.certificationsService.generateCertificate(certId).pipe(
      finalize(() => this.isDownloading = false) // Garante que o spinner pare
    ).subscribe({
      next: (blob) => {
        // 4. Lógica de "forçar" o download no navegador
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = fileName; // Usa o nome bonito que tratamos no service
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error("Erro ao baixar material:", err);
        this.snackBar.open('Não foi possível baixar o material.', 'Fechar', { duration: 3000 });
      }
    });
  }
  // --- FIM DO NOVO MÉTODO ---


  getModalityIcon(modality: string | undefined): string {
    return modality === 'online' ? 'computer' : 'groups';
  }
}

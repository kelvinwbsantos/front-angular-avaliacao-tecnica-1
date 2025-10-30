// Caminho: src/app/pages/certification-take-page/certification-take.component.ts
// v2.0 - Adiciona lógica de Matrícula (Enrollment)

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
    MatSnackBarModule, // Adiciona o módulo do SnackBar
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
  
  // !!! INJEÇÕES NOVAS !!!
  private enrollmentService = inject(EnrollmentService);
  private examService = inject(ExamService); 
 // private examService = inject(ExamService); // Ainda não usado, mas pronto para o startExam
  private snackBar = inject(MatSnackBar);

  // --- Estado do Componente ---
  certification: Certification | null = null;
  isLoading = true; // Spinner da PÁGINA
  errorLoading = false;
  certificationId: string | null = null;
  
  // --- ESTADO NOVO ---
  userEnrollmentId: string | null = null; // Guarda o ID da matrícula se o usuário estiver matriculado
  isEnrolling = false; // Spinner dos BOTÕES de ação (inscrever/cancelar)

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
    this.userEnrollmentId = null; // Reseta o status da matrícula
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
              this.errorLoading = true; // Sinaliza erro, mas não para o forkJoin
              return of(null); // Retorna nulo para o forkJoin completar
            })
          ),
          // Busca 2: Matrículas do Usuário
          enrollments: this.enrollmentService.getUserEnrollments().pipe(
             // Assumindo que você tem um método no serviço que faz "GET /enrollments"
            catchError(err => {
              console.warn('[CertTake] Erro ao buscar matrículas:', err);
              return of([]); // Retorna array vazio em caso de erro
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
            return; // Não podemos continuar sem a certificação
          }
          
          this.certification = certification;
          console.log('[CertTake] Certificação atribuída.');

          // Agora, verifica se há uma matrícula para ESTA certificação
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

    this.isEnrolling = true; // Liga o spinner do BOTÃO
    this.enrollmentService.createEnrollment({ certificationId: this.certificationId })
      .pipe(finalize(() => this.isEnrolling = false)) // Desliga o spinner do BOTÃO
      .subscribe({
        next: (newEnrollment) => {
          this.userEnrollmentId = newEnrollment.id;
          console.log(`[CertTake] Inscrição realizada. Novo ID: ${newEnrollment.id}`);
          this.snackBar.open('Inscrição realizada com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: 'success-snackbar' // (Opcional, para CSS)
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

    this.isEnrolling = true; // Liga o spinner do BOTÃO
    this.enrollmentService.deleteEnrollment(this.userEnrollmentId)
      .pipe(finalize(() => this.isEnrolling = false)) // Desliga o spinner do BOTÃO
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


  // ... (scheduleExam, startExam, getModalityIcon - sem alterações por enquanto)
  scheduleExam(): void {
    // A lógica de agendamento viria aqui
    alert('Funcionalidade de agendamento ainda não implementada.');
  }

  startExam(): void {
    // A lógica de iniciar o exame (POST /exams) deve vir aqui
    // Por enquanto, apenas navegamos
    if (!this.userEnrollmentId) {
      this.snackBar.open('Você precisa estar matriculado para iniciar a prova.', 'Fechar', { duration: 3000 });
      return;
    }
    console.log(`[CertTake] Clicou em Realizar Prova. Matrícula ID: ${this.userEnrollmentId}`);
    
    // Opcional (se você quisesse iniciar e *depois* navegar):
    // this.examService.startExam(this.userEnrollmentId).subscribe(exam => {
    //   this.router.navigate(['/app/exam', exam.id]); // Navega com o ID do *exame*
    // });
    
    this.router.navigate(['/app/exam', this.userEnrollmentId]);
  }

  getModalityIcon(modality: string | undefined): string {
    return modality === 'online' ? 'computer' : 'groups';
  }
}